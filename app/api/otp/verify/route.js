import { NextResponse } from 'next/server'
import { adminFetch } from '@/lib/supabase-admin'

export async function POST(req) {
  try {
    const { email, code, purpose } = await req.json()
    if (!email || !code || !['signup', 'reset', 'admin_reset'].includes(purpose)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const rows = await adminFetch(
      `otp_codes?email=eq.${encodeURIComponent(normalizedEmail)}&purpose=eq.${purpose}&order=created_at.desc&limit=1`
    )
    const row = rows?.[0]

    if (!row) {
      return NextResponse.json({ error: 'No verification code found, please request a new one' }, { status: 400 })
    }
    if (new Date(row.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This code has expired, please request a new one' }, { status: 400 })
    }
    if (row.attempts >= 5) {
      return NextResponse.json({ error: 'Too many attempts, please request a new code' }, { status: 400 })
    }
    if (row.code !== String(code).trim()) {
      await adminFetch(`otp_codes?id=eq.${row.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ attempts: row.attempts + 1 }),
      })
      return NextResponse.json({ error: 'Incorrect code' }, { status: 400 })
    }

    await adminFetch(`otp_codes?id=eq.${row.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ verified: true }),
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('otp/verify error', e)
    return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 })
  }
}
