import { NextResponse } from 'next/server'
import { adminFetch } from '@/lib/supabase-admin'
import { sendOtpEmail } from '@/lib/resend'

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(req) {
  try {
    const { email, purpose } = await req.json()
    if (!email || !['signup', 'reset', 'admin_reset'].includes(purpose)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    if (purpose === 'admin_reset') {
      const rows = await adminFetch(`admin_users?select=id&email=eq.${encodeURIComponent(normalizedEmail)}`)
      if (!rows || rows.length === 0) {
        // Don't reveal whether the email exists; respond success either way.
        return NextResponse.json({ success: true })
      }
    }

    // Server-side rate limit: at most 1 code every 30s, and 5 per hour per
    // email — the old 30s cooldown was client-side only and trivially
    // bypassed by calling this endpoint directly, allowing unlimited email
    // spam to any address.
    const recentRows = await adminFetch(
      `otp_codes?select=created_at&email=eq.${encodeURIComponent(normalizedEmail)}&purpose=eq.${purpose}&order=created_at.desc&limit=5`
    )
    if (recentRows && recentRows.length > 0) {
      const lastSentAt = new Date(recentRows[0].created_at)
      const secondsSinceLast = (Date.now() - lastSentAt.getTime()) / 1000
      if (secondsSinceLast < 30) {
        return NextResponse.json({ error: 'Please wait before requesting another code' }, { status: 429 })
      }
    }
    if (recentRows && recentRows.length >= 5) {
      const oldestOfFive = new Date(recentRows[recentRows.length - 1].created_at)
      if (Date.now() - oldestOfFive.getTime() < 60 * 60 * 1000) {
        return NextResponse.json({ error: 'Too many codes requested, please try again later' }, { status: 429 })
      }
    }

    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    await adminFetch('otp_codes', {
      method: 'POST',
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        code,
        purpose,
        expires_at: expiresAt,
      }),
    })

    await sendOtpEmail(email.trim(), code, purpose)

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('otp/send error', e)
    return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 })
  }
}
