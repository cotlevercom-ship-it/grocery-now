import { NextResponse } from 'next/server'
import { adminFetch } from '@/lib/supabase-admin'
import { sendConnectionRequestEmail } from '@/lib/resend'

export async function POST(req) {
  try {
    const { requestId } = await req.json()
    if (!requestId) {
      return NextResponse.json({ error: 'Missing requestId' }, { status: 400 })
    }

    const rows = await adminFetch(`connection_requests?select=id,from_user_id,to_user_id,message&id=eq.${requestId}`)
    const request = rows?.[0]
    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const [fromProfiles, toProfiles] = await Promise.all([
      adminFetch(`member_profiles?select=display_name,role_title,contact_email&user_id=eq.${request.from_user_id}`),
      adminFetch(`member_profiles?select=display_name,contact_email&user_id=eq.${request.to_user_id}`),
    ])

    const fromProfile = fromProfiles?.[0]
    const toProfile = toProfiles?.[0]

    if (!fromProfile?.contact_email || !toProfile?.contact_email) {
      return NextResponse.json({ error: 'Missing contact email on one of the profiles' }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cotlever.com'

    await sendConnectionRequestEmail(toProfile.contact_email, {
      fromName: fromProfile.display_name || 'A Cot Lever member',
      fromRoleTitle: fromProfile.role_title || '',
      fromEmail: fromProfile.contact_email,
      message: request.message || '',
      profileUrl: `${siteUrl}/members/${request.from_user_id}`,
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('connect/notify error', e)
    return NextResponse.json({ error: 'Failed to send connection request email' }, { status: 500 })
  }
}
