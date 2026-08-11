'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSession, supabaseFetch } from '@/lib/supabase'

export default function PaymentPage() {
  const { listingId } = useParams()
  const router = useRouter()
  const [prices, setPrices] = useState({ monthly: '', yearly: '', bkashNumber: '' })
  const [plan, setPlan] = useState('monthly')
  const [senderNumber, setSenderNumber] = useState('')
  const [trxId, setTrxId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const rows = await supabaseFetch('app_settings?select=key,value&key=in.(listing_price_monthly,listing_price_yearly,bkash_payment_number)')
        const map = {}
        ;(rows || []).forEach(r => { map[r.key] = r.value })
        setPrices({
          monthly: map.listing_price_monthly || '0',
          yearly: map.listing_price_yearly || '0',
          bkashNumber: map.bkash_payment_number || '',
        })
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [])

  const price = plan === 'monthly' ? prices.monthly : prices.yearly

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!senderNumber.trim() || !trxId.trim()) {
      setError('আপনার bKash নম্বর ও ট্রানজেকশন আইডি দিন')
      return
    }
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
      setError('সাবমিট করতে সমস্যা হয়েছে, আবার চেষ্টা করুন')
    }
    setSubmitting(false)
  }

  const inputStyle = {
    width: '100%', padding: '11px 13px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
  }
  const labelStyle = { fontSize: '12.5px', color: '#555', display: 'block', marginBottom: '5px', fontWeight: '600' }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>লোড হচ্ছে...</div>

  if (done) {
    return (
      <div style={{ padding: 'clamp(16px, 3vw, 40px)', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e5e5e5', padding: '40px 24px', marginTop: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '14px' }}>✅</div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#163a2c', marginBottom: '8px' }}>পেমেন্ট জমা হয়েছে</h1>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '18px' }}>
            যাচাই করার পর আপনার লিস্টিং একটিভ হয়ে যাবে (সাধারণত কয়েক ঘণ্টার মধ্যে)।
          </p>
          <a href="/" style={{
            display: 'inline-block', background: '#163a2c', color: 'white',
            borderRadius: '8px', padding: '11px 22px', fontSize: '14px', fontWeight: '700'
          }}>হোমে ফিরে যান</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 40px)', maxWidth: '560px', margin: '0 auto' }}>
      <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: '800', marginBottom: '20px' }}>পেমেন্ট করুন</h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['monthly', 'yearly'].map(p => (
          <button key={p} onClick={() => setPlan(p)} style={{
            flex: 1, padding: '16px', borderRadius: '10px', border: '2px solid',
            borderColor: plan === p ? '#163a2c' : '#e0e0e0',
            background: plan === p ? '#163a2c' : 'white',
            color: plan === p ? 'white' : '#333', textAlign: 'left'
          }}>
            <div style={{ fontSize: '13px', fontWeight: '700' }}>{p === 'monthly' ? 'মাসিক' : 'বাৎসরিক'}</div>
            <div style={{ fontSize: '20px', fontWeight: '800', marginTop: '4px' }}>
              ৳{p === 'monthly' ? prices.monthly : prices.yearly}
            </div>
          </button>
        ))}
      </div>

      {error && (
        <div style={{ marginBottom: '16px', padding: '10px 12px', background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <div style={{ background: '#fff8e6', border: '1px solid #f4a300', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#8a6200', marginBottom: '6px' }}>bKash-এ পেমেন্ট করুন</div>
        <div style={{ fontSize: '15px', color: '#333' }}>
          Send Money করুন: <strong>{prices.bkashNumber || 'অ্যাডমিন নম্বর সেট করেনি'}</strong> নম্বরে, পরিমাণ ৳{price}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e5e5', padding: '20px' }}>
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>আপনার bKash নম্বর *</label>
          <input style={inputStyle} value={senderNumber} onChange={e => setSenderNumber(e.target.value)} placeholder="01XXXXXXXXX" />
        </div>
        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>ট্রানজেকশন আইডি (TrxID) *</label>
          <input style={inputStyle} value={trxId} onChange={e => setTrxId(e.target.value)} placeholder="8N7A6B5C4D" />
        </div>

        <button type="submit" disabled={submitting} style={{
          width: '100%', background: submitting ? '#9ca3af' : '#163a2c', color: 'white',
          borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: '700'
        }}>
          {submitting ? 'সাবমিট হচ্ছে...' : 'পেমেন্ট সাবমিট করুন'}
        </button>
      </form>
    </div>
  )
}
