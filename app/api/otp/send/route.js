import { NextResponse } from 'next/server'
import { adminFetch } from '@/lib/supabase-admin'
import { sendOtpEmail } from '@/lib/resend'

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(req) {
  try {
    const { email, purpose } = await req.json()
    if (!email || !['signup', 'reset', 'merchant_reset'].includes(purpose)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
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
