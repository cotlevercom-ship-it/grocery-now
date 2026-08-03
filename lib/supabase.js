const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SESSION_KEY = 'auth_session'
const STORAGE_BUCKET = 'images'

// ---------- Session helpers ----------
export function getSession() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

function saveSession(session) {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  window.dispatchEvent(new Event('auth-changed'))
}

export function clearSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
  window.dispatchEvent(new Event('auth-changed'))
}

function getAccessToken() {
  const session = getSession()
  return session?.access_token || null
}

// Refreshes the access token using the stored refresh_token.
// Returns the new access token on success, or null if the session
// could not be refreshed (in which case the local session is cleared).
let refreshInFlight = null
async function refreshAccessToken() {
  const session = getSession()
  if (!session?.refresh_token) return null

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
          method: 'POST',
          headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: session.refresh_token }),
        })
        const data = await res.json()
        if (!res.ok || !data.access_token) {
          clearSession()
          return null
        }
        saveSession(data)
        return data.access_token
      } catch (e) {
        console.error('token refresh failed', e)
        return null
      } finally {
        refreshInFlight = null
      }
    })()
  }
  return refreshInFlight
}

// ---------- REST (PostgREST) fetch ----------
export async function supabaseFetch(endpoint, options = {}, _retried = false) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`
  const token = getAccessToken()
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...options.headers,
    },
    ...options,
  })

  // Access token expired or invalid — refresh once and retry the request.
  if (res.status === 401 && !_retried && getSession()?.refresh_token) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      return supabaseFetch(endpoint, options, true)
    }
  }

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err)
  }
  if (res.status === 204) return null
  return res.json()
}

// ---------- Auth (GoTrue) ----------
export async function signUp(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error_description || data.msg || data.error || 'Signup failed')
  if (data.access_token) saveSession(data)
  return data
}

export async function signIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error_description || data.msg || data.error || 'Login failed')
  saveSession(data)
  return data
}

export function signOut() {
  clearSession()
}

// ---------- Storage (image upload) ----------
// Uploads a file to the public "images" bucket under the given folder
// (e.g. folder="shops") and returns its public URL.
export async function uploadImage(file, folder = 'misc', _retried = false) {
  const token = getAccessToken()
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
  const path = `${folder}/${Date.now()}-${safeName}`

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${path}`,
    {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
        'Content-Type': file.type || 'application/octet-stream',
        'x-upsert': 'true',
      },
      body: file,
    }
  )

  if (res.status === 401 && !_retried && getSession()?.refresh_token) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      return uploadImage(file, folder, true)
    }
  }

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || 'Image upload failed')
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`
}

// ---------- Affiliate referrals ----------
// Called once a shop becomes active. If the shop was opened via an affiliate
// referral link (ref_code) and no referral record exists yet for it, creates
// a pending referral with the current bonus amount from app_settings.
export async function createReferralIfNeeded(shopId, refCode) {
  if (!shopId || !refCode) return
  try {
    const affiliates = await supabaseFetch(`affiliates?select=id&referral_code=eq.${refCode}`)
    const affiliate = affiliates?.[0]
    if (!affiliate) return

    const existing = await supabaseFetch(`referrals?select=id&shop_id=eq.${shopId}`)
    if (existing && existing.length > 0) return

    const settings = await supabaseFetch(`app_settings?select=value&key=eq.affiliate_bonus_amount`)
    const bonusAmount = Number(settings?.[0]?.value) || 0

    await supabaseFetch('referrals', {
      method: 'POST',
      body: JSON.stringify({
        affiliate_id: affiliate.id,
        shop_id: shopId,
        bonus_amount: bonusAmount,
        status: 'pending',
      }),
    })
  } catch (e) {
    console.error('createReferralIfNeeded failed', e)
  }
}

// ---------- Affiliate PIN hashing (client-side SHA-256, no extra libs) ----------
export async function hashPin(pin) {
  const enc = new TextEncoder().encode(pin)
  const buf = await crypto.subtle.digest('SHA-256', enc)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ---------- Account type separation (customer vs merchant) ----------
// Called once right after a new account is created, to tag it so it can
// only be used to log in through the matching login page.
export async function setAccountType(type) {
  try {
    const session = getSession()
    if (!session?.user) return
    await supabaseFetch('account_types', {
      method: 'POST',
      headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify({ user_id: session.user.id, account_type: type }),
    })
  } catch (e) {
    console.error('setAccountType failed', e)
  }
}

// Checks that the currently logged-in session matches the expected account
// type. Accounts created before this feature have no row yet — those are
// allowed through so existing users aren't locked out.
export async function verifyAccountType(expectedType) {
  const session = getSession()
  if (!session?.user) return true
  try {
    const rows = await supabaseFetch(`account_types?select=account_type&user_id=eq.${session.user.id}`)
    const row = rows?.[0]
    if (!row) return true
    return row.account_type === expectedType
  } catch (e) {
    console.error('verifyAccountType failed', e)
    return true
  }
}
