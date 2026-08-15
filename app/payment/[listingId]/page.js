'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'

export default function PaymentPage() {
  const { listingId } = useParams()
  const router = useRouter()
  const [prices, setPrices] = useState({ monthly: '', monthlyRegular: '', yearly: '', yearlyRegular: '', bkashNumber: '' })
  const [plan, setPlan] = useState('monthly')
  const [senderNumber, setSenderNumber] = useState('')
  const [trxId, setTrxId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    async function load() {
      const s = getSession()
      if (!s?.user?.id) {
        router.replace(`/login?next=/payment/${listingId}`)
        return
      }
      setLoading(true)
      try {
        const rows = await supabaseFetch('app_settings?select=key,value&key=in.(listing_price_monthly_regular,listing_price_monthly,listing_price_yearly_regular,listing_price_yearly,bkash_payment_number)')
        const map = {}
        ;(rows || []).forEach(r => { map[r.key] = r.value })
        setPrices({
          monthly: map.listing_price_monthly || '0',
          monthlyRegular: map.listing_price_monthly_regular || '',
          yearly: map.listing_price_yearly || '0',
          yearlyRegular: map.listing_price_yearly_regular || '',
          bkashNumber: map.bkash_payment_number || '',
        })
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const price = plan === 'monthly' ? prices.monthly : prices.yearly

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!senderNumber.trim() || !trxId.trim()) { setError('Enter your bKash number and transaction ID'); return }
    setSubmitting(true)
    try {
      const session = getSession()
      await supabaseFetch('listing_subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          listing_id: listingId,
          user_id: session.user.id,
          plan,
          amount: Number(price),
          status: 'pending',
          payment_method: 'bkash',
          payment_reference: `${senderNumber.trim()} / ${trxId.trim()}`,
        }),
      })
      setDone(true)
    } catch (e) {
      console.error(e)
      setError('Submission failed, please try again')
    }
    setSubmitting(false)
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: '8px',
    border: `1px solid ${theme.line}`, fontSize: '14.5px', boxSizing: 'border-box',
    fontFamily: theme.fontBody, background: theme.surface, color: theme.ink,
  }
  const labelStyle = { fontSize: '12.5px', color: theme.inkSoft, display: 'block', marginBottom: '6px', fontWeight: '600' }

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: theme.inkSoft }}>Loading…</div>

  if (done) {
    return (
      <div style={{ background: theme.paper, minHeight: '70vh' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: 'clamp(20px,4vw,48px) clamp(16px,3vw,24px)', textAlign: 'center' }}>
          <div style={{ background: theme.surface, borderRadius: '14px', border: `1px solid ${theme.line}`, padding: '44px 28px', marginTop: '30px' }}>
            <div style={{ fontSize: '44px', marginBottom: '16px' }}>✅</div>
            <h1 style={{ fontFamily: theme.fontDisplay, fontSize: '22px', fontWeight: '600', color: theme.ink, marginBottom: '10px' }}>Payment Submitted</h1>
            <p style={{ fontSize: '14px', color: theme.inkSoft, marginBottom: '22px', lineHeight: '1.6' }}>
              Your listing will be activated after verification (usually within a few hours).
            </p>
            <Link href="/" style={{
              display: 'inline-block', background: theme.brass, color: 'white',
              borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: '600', textDecoration: 'none'
            }}>Back to Home</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: theme.paper, minHeight: '70vh' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: 'clamp(20px,4vw,48px) clamp(16px,3vw,24px)' }}>
        <h1 style={{ fontFamily: theme.fontDisplay, fontSize: 'clamp(22px,2.8vw,30px)', fontWeight: '600', color: theme.ink, marginBottom: '24px' }}>
          Make Payment
        </h1>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '22px' }}>
          {['monthly', 'yearly'].map(p => {
            const discount = p === 'monthly' ? prices.monthly : prices.yearly
            const regular = p === 'monthly' ? prices.monthlyRegular : prices.yearlyRegular
            const active = plan === p
            return (
              <button key={p} onClick={() => setPlan(p)} style={{
                flex: 1, padding: '18px', borderRadius: '10px', border: `2px solid ${active ? theme.brass : theme.line}`,
                background: active ? theme.brass : theme.surface,
                color: active ? 'white' : theme.ink, textAlign: 'left'
              }}>
                <div style={{ fontSize: '13px', fontWeight: '600', fontFamily: theme.fontBody }}>{p === 'monthly' ? 'Monthly' : 'Yearly'}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                  <div style={{ fontFamily: theme.fontDisplay, fontSize: '22px', fontWeight: '600' }}>
                    ৳{discount}
                  </div>
                  {regular && (
                    <div style={{
                      fontSize: '13px', fontFamily: theme.fontBody, textDecoration: 'line-through',
                      opacity: 0.6
                    }}>৳{regular}</div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {error && (
          <div style={{ marginBottom: '16px', padding: '11px 14px', background: theme.dangerSoft, color: theme.danger, borderRadius: '8px', fontSize: '13.5px' }}>
            {error}
          </div>
        )}

        <div style={{ background: '#FBF3E7', border: `1px solid ${theme.brass}`, borderRadius: '10px', padding: '18px', marginBottom: '22px' }}>
          <div style={{ fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: '600', color: theme.brassDark, marginBottom: '8px' }}>Pay via bKash</div>
          <div style={{ fontSize: '15px', color: theme.ink }}>
            Merchant: <strong>{prices.bkashNumber || 'Admin has not set a number yet'}</strong>, amount ৳{price} (discounted)
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ background: theme.surface, borderRadius: '12px', border: `1px solid ${theme.line}`, padding: 'clamp(20px,3vw,28px)' }}>
          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Your bKash Number *</label>
            <input style={inputStyle} value={senderNumber} onChange={e => setSenderNumber(e.target.value)} placeholder="01XXXXXXXXX" />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Transaction ID (TrxID) *</label>
            <input style={inputStyle} value={trxId} onChange={e => setTrxId(e.target.value)} placeholder="8N7A6B5C4D" />
          </div>

          <button type="submit" disabled={submitting} style={{
            width: '100%', background: submitting ? '#B8B2A0' : theme.brass, color: 'white',
            borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: '600', border: 'none', fontFamily: theme.fontBody
          }}>
            {submitting ? 'Submitting...' : 'Submit Payment'}
          </button>
        </form>
      </div>
    </div>
  )
}
