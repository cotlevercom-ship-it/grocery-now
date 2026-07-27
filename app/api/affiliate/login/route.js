import { adminFetch } from '@/lib/supabase-admin'
import crypto from 'crypto'

function generateToken() {
  return crypto.randomBytes(24).toString('hex')
}

export async function POST(req) {
  try {
    const { phone, pinHash } = await req.json()
    if (!phone?.trim() || !pinHash) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const rows = await adminFetch(
      `affiliates?select=*&phone=eq.${encodeURIComponent(phone.trim())}&pin_hash=eq.${pinHash}`
    )
    const found = rows?.[0]
    if (!found) {
      return Response.json({ error: 'Incorrect phone number or PIN' }, { status: 401 })
    }
    const sessionToken = generateToken()
    await adminFetch(`affiliates?id=eq.${found.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ session_token: sessionToken }),
    })
    return Response.json({ id: found.id, name: found.name, referral_code: found.referral_code, session_token: sessionToken })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Login failed' }, { status: 500 })
  }
}
