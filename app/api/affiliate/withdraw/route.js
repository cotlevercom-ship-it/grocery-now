import { adminFetch } from '@/lib/supabase-admin'

async function verifySession(affiliateId, sessionToken) {
  if (!affiliateId || !sessionToken) return null
  const rows = await adminFetch(`affiliates?select=id,session_token&id=eq.${affiliateId}`)
  const aff = rows?.[0]
  if (!aff || aff.session_token !== sessionToken) return null
  return aff
}

export async function POST(req) {
  try {
    const { affiliate_id, session_token, bkash_number } = await req.json()

    const valid = await verifySession(affiliate_id, session_token)
    if (!valid) return Response.json({ error: 'Not authorized' }, { status: 401 })

    if (!bkash_number || bkash_number.length < 11) {
      return Response.json({ error: 'Enter a valid bKash number' }, { status: 400 })
    }

    const [refRows, minRows] = await Promise.all([
      adminFetch(`referrals?select=*&affiliate_id=eq.${affiliate_id}&status=eq.pending`),
      adminFetch(`app_settings?select=value&key=eq.affiliate_min_withdraw`),
    ])
    const pendingRefs = refRows || []
    const minWithdraw = Number(minRows?.[0]?.value) || 100
    const total = pendingRefs.reduce((s, r) => s + Number(r.bonus_amount || 0), 0)

    if (total < minWithdraw) {
      return Response.json({ error: `You need at least ৳${minWithdraw} pending to withdraw` }, { status: 400 })
    }

    const wd = await adminFetch('withdrawal_requests', {
      method: 'POST',
      body: JSON.stringify({
        affiliate_id,
        bkash_number,
        amount: total,
        status: 'requested',
      }),
    })
    const wdId = Array.isArray(wd) ? wd[0]?.id : wd?.id

    await Promise.all(pendingRefs.map(r =>
      adminFetch(`referrals?id=eq.${r.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'requested', withdrawal_request_id: wdId }),
      })
    ))

    return Response.json({ success: true })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Failed to send withdrawal request' }, { status: 500 })
  }
}
