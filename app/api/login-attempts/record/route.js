import { adminFetch } from '@/lib/supabase-admin'

const MAX_ATTEMPTS = 5
const LOCK_MINUTES = 15

export async function POST(req) {
  try {
    const { email, success } = await req.json()
    if (!email) return Response.json({ error: 'Missing email' }, { status: 400 })
    const normalizedEmail = email.trim().toLowerCase()

    if (success) {
      await adminFetch(`login_attempts?email=eq.${encodeURIComponent(normalizedEmail)}`, {
        method: 'PATCH',
        body: JSON.stringify({ fail_count: 0, locked_until: null, updated_at: new Date().toISOString() }),
      })
      return Response.json({ ok: true })
    }

    const rows = await adminFetch(`login_attempts?select=*&email=eq.${encodeURIComponent(normalizedEmail)}`)
    const row = rows?.[0]
    const newFailCount = (row?.fail_count || 0) + 1
    const locked = newFailCount >= MAX_ATTEMPTS
    const lockedUntil = locked ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString() : null

    if (row) {
      await adminFetch(`login_attempts?email=eq.${encodeURIComponent(normalizedEmail)}`, {
        method: 'PATCH',
        body: JSON.stringify({ fail_count: newFailCount, locked_until: lockedUntil, updated_at: new Date().toISOString() }),
      })
    } else {
      await adminFetch('login_attempts', {
        method: 'POST',
        body: JSON.stringify({ email: normalizedEmail, fail_count: newFailCount, locked_until: lockedUntil }),
      })
    }

    return Response.json({
      ok: true,
      locked,
      attemptsRemaining: Math.max(0, MAX_ATTEMPTS - newFailCount),
      retryAfterSeconds: locked ? LOCK_MINUTES * 60 : null,
    })
  } catch (err) {
    console.error(err)
    return Response.json({ ok: false })
  }
}
