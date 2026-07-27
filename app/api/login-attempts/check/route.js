import { adminFetch } from '@/lib/supabase-admin'

const MAX_ATTEMPTS = 5
const LOCK_MINUTES = 15

export async function POST(req) {
  try {
    const { email } = await req.json()
    if (!email) return Response.json({ error: 'Missing email' }, { status: 400 })

    const rows = await adminFetch(`login_attempts?select=*&email=eq.${encodeURIComponent(email.trim().toLowerCase())}`)
    const row = rows?.[0]

    if (row?.locked_until) {
      const lockedUntil = new Date(row.locked_until)
      const now = new Date()
      if (lockedUntil > now) {
        const retryAfterSeconds = Math.ceil((lockedUntil - now) / 1000)
        return Response.json({ locked: true, retryAfterSeconds })
      }
    }

    return Response.json({ locked: false, attemptsRemaining: MAX_ATTEMPTS - (row?.fail_count || 0) })
  } catch (err) {
    console.error(err)
    // Fail open — don't let a tracking error block real logins
    return Response.json({ locked: false })
  }
}
