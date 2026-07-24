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

// ---------- REST (PostgREST) fetch ----------
export async function supabaseFetch(endpoint, options = {}) {
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
  if (!res.ok) throw new Error(data.error_description || data.msg || data.error || 'সাইনআপ ব্যর্থ হয়েছে')
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
  if (!res.ok) throw new Error(data.error_description || data.msg || data.error || 'লগইন ব্যর্থ হয়েছে')
  saveSession(data)
  return data
}

export function signOut() {
  clearSession()
}

// ---------- Storage (image upload) ----------
// Uploads a file to the public "images" bucket under the given folder
// (e.g. folder="shops") and returns its public URL.
export async function uploadImage(file, folder = 'misc') {
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

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || 'ছবি আপলোড ব্যর্থ হয়েছে')
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
