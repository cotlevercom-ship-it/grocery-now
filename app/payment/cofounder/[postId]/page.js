'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSession, supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'

export default function CofounderPaymentPage() {
  const { postId } = useParams()
  const router = useRouter()
  const [price, setPrice] = useState('')
  const [bkashNumber, setBkashNumber] = useState('')
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
        router.replace(`/login?next=/payment/cofounder/${postId}`)
        return
      }
      setLoading(true)
      try {
        const rows = await supabaseFetch(`app_settings?select=key,value&key=in.(cofounder_price_yearly,bkash_payment_number)`)
        const map = Object.fromEntries((rows || []).map(r => [r.key, r.value]))
        setPrice(map.cofounder_price_yearly || '2000')
        setBkashNumber(map.bkash_payment_number || '')
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [router, postId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!senderNumber.trim() || !trxId.trim()) { setError('Enter your bKash number and transaction ID'); return }
    setSubmitting(true)
    try {
      const session = getSession()
      await supabaseFetch('cofounder_subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          post_id: postId,
          user_id: session.user.id,
          plan: 'yearly',
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

  if (loading) {
    return (
      <div style={{ background: theme.paper, minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: theme.inkSoft, fontSize: '14px' }}>Loading…</div>
      </div>
    )
  }

  if (done) {
    return (
      <div style={{ background: theme.paper, minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '380px' }}>
          <div style={{ fontSize: '40px', marginBottom: '14px' }}>✅</div>
          <h2 style={{ fontFamily: theme.fontDisplay, fontSize: '20px', fontWeight: '600', color: theme.ink, marginBottom: '8px' }}>Payment Submitted</h2>
          <p style={{ fontSize: '13.5px', color: theme.inkSoft, marginBottom: '20px' }}>We'll verify it and activate your post shortly — usually within a few hours.</p>
          <a href="/account/cofounder" style={{ display: 'inline-block', background: theme.brass, color: 'white', borderRadius: '8px', padding: '11px 22px', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>Back to Find Co-founder</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: theme.paper, minHeight: '80vh' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,3vw,24px)' }}>
        <h1 style={{ fontFamily: theme.fontDisplay, fontSize: 'clamp(22px,2.8vw,28px)', fontWeight: '600', color: theme.ink, marginBottom: '8px' }}>
          Activate Your Post
        </h1>
        <p style={{ fontSize: '13.5px', color: theme.inkSoft, marginBottom: '22px' }}>Yearly plan — ৳{price}</p>

        <div style={{
          background: theme.surface, border: `1px solid ${theme.line}`, borderRadius: '10px',
          padding: '16px', marginBottom: '22px', fontSize: '13.5px', color: theme.ink, lineHeight: '1.7'
        }}>
          Send ৳{price} via bKash (Send Money) to <strong>{bkashNumber}</strong>, then enter the details below.
        </div>

        {error && (
          <div style={{ marginBottom: '16px', padding: '11px 14px', background: theme.dangerSoft, color: theme.danger, borderRadius: '8px', fontSize: '13.5px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: theme.ink, marginBottom: '6px', display: 'block' }}>Your bKash number</label>
            <input style={{ width: '100%', padding: '11px 13px', borderRadius: '8px', border: `1px solid ${theme.line}`, fontSize: '14px' }} value={senderNumber} onChange={e => setSenderNumber(e.target.value)} placeholder="01XXXXXXXXX" />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: theme.ink, marginBottom: '6px', display: 'block' }}>Transaction ID</label>
            <input style={{ width: '100%', padding: '11px 13px', borderRadius: '8px', border: `1px solid ${theme.line}`, fontSize: '14px' }} value={trxId} onChange={e => setTrxId(e.target.value)} placeholder="e.g. 8N7A6B5C4D" />
          </div>
          <button type="submit" disabled={submitting} style={{
            background: theme.brass, color: 'white', border: 'none', borderRadius: '8px',
            padding: '13px', fontSize: '14.5px', fontWeight: '700', cursor: submitting ? 'default' : 'pointer',
            opacity: submitting ? 0.7 : 1
          }}>{submitting ? 'Submitting…' : 'I\'ve Sent the Payment'}</button>
        </form>
      </div>
    </div>
  )
}
