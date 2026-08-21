'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch, signOut } from '@/lib/supabase'
import { theme } from '@/lib/theme'

// Signup-time payment: account-level, not tied to a listing. Once approved
// by admin, this becomes the user's active subscription — required to use
// the rest of the site (create/browse profiles, etc).
export default function SubscribePage() {
  const router = useRouter()
  const [prices, setPrices] = useState({ yearly: '', yearlyRegular: '', bkashNumber: '' })
  const [senderNumber, setSenderNumber] = useState('')
  const [trxId, setTrxId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [alreadyHasSub, setAlreadyHasSub] = useState(false)

  const handleLogout = () => {
    signOut()
    router.push('/')
  }

  useEffect(() => {
    async function load() {
      const s = getSession()
      if (!s?.user?.id) {
        router.replace('/login?next=/account/subscribe')
        return
      }
      setLoading(true)
      try {
        const rows = await supabaseFetch('app_settings?select=key,value&key=in.(listing_price_yearly_regular,listing_price_yearly,bkash_payment_number)')
        const map = {}
        ;(rows || []).forEach(r => { map[r.key] = r.value })
        setPrices({
          yearly: map.listing_price_yearly || '0',
          yearlyRegular: map.listing_price_yearly_regular || '',
          bkashNumber: map.bkash_payment_number || '',
        })

        const existing = await supabaseFetch(
          `member_subscriptions?select=id&user_id=eq.${s.user.id}&status=in.(active,pending)&order=created_at.desc&limit=1`
        )
        if (existing && existing.length) setAlreadyHasSub(true)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!senderNumber.trim() || !trxId.trim()) { setError('Enter your bKash number and transaction ID'); return }
    setSubmitting(true)
    try {
      const session = getSession()
      await supabaseFetch('member_subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          user_id: session.user.id,
          plan: 'yearly',
          amount: Number(prices.yearly),
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

  if (alreadyHasSub && !done) {
    return (
      <div style={{ background: theme.paper, minHeight: '70vh' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: 'clamp(20px,4vw,48px) clamp(16px,3vw,24px)', textAlign: 'center' }}>
          <div style={{ background: theme.surface, borderRadius: '14px', border: `1px solid ${theme.line}`, padding: '44px 28px', marginTop: '30px' }}>
            <div style={{ fontSize: '44px', marginBottom: '16px' }}>✅</div>
            <h1 style={{ fontFamily: theme.fontDisplay, fontSize: '22px', fontWeight: '600', color: theme.ink, marginBottom: '10px' }}>You&apos;re All Set</h1>
            <p style={{ fontSize: '14px', color: theme.inkSoft, marginBottom: '22px', lineHeight: '1.6' }}>
              Your subscription is already active or being reviewed. You can create your profile now.
            </p>
            <Link href="/account" style={{
              display: 'inline-block', background: theme.brass, color: 'white',
              borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: '600', textDecoration: 'none'
            }}>Create Your Profile</Link>
          </div>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div style={{ background: theme.paper, minHeight: '70vh' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: 'clamp(20px,4vw,48px) clamp(16px,3vw,24px)', textAlign: 'center' }}>
          <div style={{ background: theme.surface, borderRadius: '14px', border: `1px solid ${theme.line}`, padding: '44px 28px', marginTop: '30px' }}>
            <div style={{ fontSize: '44px', marginBottom: '16px' }}>✅</div>
            <h1 style={{ fontFamily: theme.fontDisplay, fontSize: '22px', fontWeight: '600', color: theme.ink, marginBottom: '10px' }}>Payment Submitted</h1>
            <p style={{ fontSize: '14px', color: theme.inkSoft, marginBottom: '22px', lineHeight: '1.6' }}>
              Once verified (usually within a few hours), you'll have full access to the site.
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
          <button onClick={handleLogout} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '13px', color: theme.inkSoft, fontFamily: theme.fontBody, textDecoration: 'underline',
          }}>Log Out</button>
        </div>
        <div style={{
          fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
          color: theme.brassDark, marginBottom: '10px', fontWeight: '600'
        }}>One-Time Setup</div>
        <h1 style={{ fontFamily: theme.fontDisplay, fontSize: 'clamp(22px,2.8vw,30px)', fontWeight: '600', color: theme.ink, marginBottom: '10px' }}>
          Activate Your Subscription
        </h1>
        <p style={{ fontSize: '14px', color: theme.inkSoft, marginBottom: '22px', lineHeight: '1.6' }}>
          Pay once a year to unlock your co-founder profile and the full directory.
        </p>

        <div style={{
          padding: '16px', border: `1px solid ${theme.line}`, borderRadius: '10px', marginBottom: '22px',
          background: theme.surface,
        }}>
          <div style={{ fontSize: '12px', color: theme.inkSoft, marginBottom: '4px' }}>Yearly plan</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontFamily: theme.fontDisplay, fontSize: '26px', fontWeight: '700', color: theme.ink }}>৳{prices.yearly}</span>
            {prices.yearlyRegular && (
              <span style={{ fontSize: '14px', color: theme.inkSoft, textDecoration: 'line-through' }}>৳{prices.yearlyRegular}</span>
            )}
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: '16px', padding: '11px 14px', background: theme.dangerSoft, color: theme.danger, borderRadius: '8px', fontSize: '13.5px' }}>
            {error}
          </div>
        )}

        <div style={{ background: '#FBF3E7', border: `1px solid ${theme.brass}`, borderRadius: '10px', padding: '18px', marginBottom: '22px' }}>
          <div style={{ fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: '600', color: theme.brassDark, marginBottom: '8px' }}>Pay via bKash</div>
          <div style={{ fontSize: '15px', color: theme.ink }}>
            Merchant: <strong>{prices.bkashNumber || 'Admin has not set a number yet'}</strong>, amount ৳{prices.yearly}
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
