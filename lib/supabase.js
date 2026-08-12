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
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...options.headers,
    },
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

// Verifies an email+password combo against Supabase Auth WITHOUT touching the
// current stored session — used to re-confirm identity before a destructive
// action (e.g. deleting a category), not to log in.
export async function verifyPassword(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return res.ok
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
// bump
// bump
// bump
// bump
// bump
// bump
// bump
