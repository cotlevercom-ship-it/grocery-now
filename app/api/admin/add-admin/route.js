import { NextResponse } from 'next/server'
import { findUserByEmail, adminFetch } from '@/lib/supabase-admin'

const VALID_ROLES = ['super_admin', 'members', 'feed', 'resources', 'banners', 'pages', 'agreements', 'help', 'settings']

export async function POST(req) {
  try {
    const { email, role } = await req.json()
    if (!email || !role) {
      return NextResponse.json({ error: 'Email and department are required' }, { status: 400 })
    }
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid department' }, { status: 400 })
    }

    const user = await findUserByEmail(email.trim())
    if (!user) {
      return NextResponse.json({ error: 'No Cot Lever account found with that email — the employee needs to sign up first.' }, { status: 404 })
    }

    const rows = await adminFetch('admin_users?on_conflict=user_id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({ user_id: user.id, email: user.email, role }),
    })

    return NextResponse.json({ admin: rows?.[0] || null })
  } catch (e) {
    console.error('add-admin error', e)
    return NextResponse.json({ error: 'Failed to add admin' }, { status: 500 })
  }
}
