import { NextResponse } from 'next/server'
import { findUserByEmail } from '@/lib/supabase-admin'

export async function POST(req) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    const existing = await findUserByEmail(email.trim())
    return NextResponse.json({ exists: !!existing })
  } catch (e) {
    console.error('check-email error', e)
    return NextResponse.json({ error: 'Failed to check email' }, { status: 500 })
  }
}
