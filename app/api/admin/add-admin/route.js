import { NextResponse } from 'next/server'
import { findUserByEmail, adminFetch } from '@/lib/supabase-admin'

const VALID_ROLES = ['super_admin', 'members', 'feed', 'resources', 'banners', 'pages', 'agreements', 'help', 'settings']

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Resolves the caller from their bearer token and confirms they're a
// super_admin. Returns the caller's user id on success, or null.
async function requireSuperAdmin(req) {
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return null

  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  })
  if (!userRes.ok) return null
  const userData = await userRes.json()
  const callerId = userData?.id
  if (!callerId) return null

  const rows = await adminFetch(`admin_users?select=role&user_id=eq.${callerId}`)
  const callerRole = rows?.[0]?.role
  if (callerRole !== 'super_admin') return null

  return callerId
}

export async function POST(req) {
  try {
    const callerId = await requireSuperAdmin(req)
    if (!callerId) {
      return NextResponse.json({ error: 'Only super admins can add admin users' }, { status: 403 })
    }

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
