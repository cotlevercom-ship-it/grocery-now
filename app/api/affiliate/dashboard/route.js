import { adminFetch } from '@/lib/supabase-admin'

async function verifySession(affiliateId, sessionToken) {
  if (!affiliateId || !sessionToken) return null
  const rows = await adminFetch(`affiliates?select=id,session_token&id=eq.${affiliateId}`)
  const aff = rows?.[0]
  if (!aff || aff.session_token !== sessionToken) return null
  return aff
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const affiliateId = searchParams.get('affiliate_id')
    const sessionToken = searchParams.get('session_token')

    const valid = await verifySession(affiliateId, sessionToken)
    if (!valid) return Response.json({ error: 'Not authorized' }, { status: 401 })

    const [refRows, minRows] = await Promise.all([
      adminFetch(`referrals?select=*,shops(name)&affiliate_id=eq.${affiliateId}&order=created_at.desc`),
      adminFetch(`app_settings?select=value&key=eq.affiliate_min_withdraw`),
    ])

    return Response.json({
      referrals: refRows || [],
      min_withdraw: Number(minRows?.[0]?.value) || 100,
    })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Failed to load data' }, { status: 500 })
  }
}
