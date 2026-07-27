import { adminFetch } from '@/lib/supabase-admin'
import crypto from 'crypto'

function generateCode(name) {
  const base = (name || '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 4)
    .toUpperCase() || 'AFF'
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${base}${rand}`
}

function generateToken() {
  return crypto.randomBytes(24).toString('hex')
}

export async function POST(req) {
  try {
    const { name, phone, pinHash } = await req.json()
    if (!name?.trim() || !phone?.trim() || !pinHash) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existing = await adminFetch(`affiliates?select=*&phone=eq.${encodeURIComponent(phone.trim())}`)
    const sessionToken = generateToken()

    if (existing && existing.length > 0) {
      const aff = existing[0]
      if (!aff.pin_hash) {
        // Backward-compatible: no PIN set yet, set it now
        const updated = await adminFetch(`affiliates?id=eq.${aff.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ pin_hash: pinHash, session_token: sessionToken }),
        })
        const row = Array.isArray(updated) ? updated[0] : aff
        return Response.json({ id: row.id, name: row.name, referral_code: row.referral_code, session_token: sessionToken })
      }
      if (aff.pin_hash !== pinHash) {
        return Response.json({ error: 'A different PIN is already set for this phone number' }, { status: 400 })
      }
      await adminFetch(`affiliates?id=eq.${aff.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ session_token: sessionToken }),
      })
      return Response.json({ id: aff.id, name: aff.name, referral_code: aff.referral_code, session_token: sessionToken })
    }

    let created = null
    for (let attempt = 0; attempt < 3 && !created; attempt++) {
      try {
        const code = generateCode(name)
        const rows = await adminFetch('affiliates', {
          method: 'POST',
          body: JSON.stringify({
            name: name.trim(), phone: phone.trim(), referral_code: code,
            pin_hash: pinHash, session_token: sessionToken,
          }),
        })
        created = Array.isArray(rows) ? rows[0] : rows
      } catch (err) {
        if (attempt === 2) throw err
      }
    }
    return Response.json({ id: created.id, name: created.name, referral_code: created.referral_code, session_token: sessionToken })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Registration failed, please try again' }, { status: 500 })
  }
}
