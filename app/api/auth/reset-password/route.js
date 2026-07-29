import { NextResponse } from 'next/server'
import { adminFetch, findUserByEmail, updateUserPassword } from '@/lib/supabase-admin'

export async function POST(req) {
  try {
    const { email, newPassword, purpose } = await req.json()
    if (!email || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    const normalizedEmail = email.toLowerCase().trim()
    const otpPurpose = purpose === 'seller_reset' ? 'seller_reset' : 'reset'

    const rows = await adminFetch(
      `otp_codes?email=eq.${encodeURIComponent(normalizedEmail)}&purpose=eq.${otpPurpose}&verified=eq.true&order=created_at.desc&limit=1`
    )
    const row = rows?.[0]
    if (!row || new Date(row.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Verification expired, please start over' }, { status: 400 })
    }

    const user = await findUserByEmail(normalizedEmail)
    if (!user) {
      return NextResponse.json({ error: 'No account found with this email' }, { status: 400 })
    }

    await updateUserPassword(user.id, newPassword)

    await adminFetch(`otp_codes?id=eq.${row.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ expires_at: new Date(0).toISOString() }),
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('reset-password error', e)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
