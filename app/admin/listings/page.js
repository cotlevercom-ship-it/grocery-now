'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

const TYPE_LABEL = {
  co_founder: 'কো-ফাউন্ডার', partner: 'পার্টনার', investor: 'ইনভেস্টর',
  employee: 'কর্মী', supplier: 'সাপ্লায়ার', buyer: 'বায়ার',
}

function addDuration(plan) {
  const now = new Date()
  const end = new Date(now)
  if (plan === 'monthly') end.setMonth(end.getMonth() + 1)
  else end.setFullYear(end.getFullYear() + 1)
  return { starts_at: now.toISOString(), ends_at: end.toISOString() }
}

export default function AdminListingsPage() {
  const [tab, setTab] = useState('pending')
  const [subs, setSubs] = useState([])
  const [listingsById, setListingsById] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actingId, setActingId] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const subData = await supabaseFetch('listing_subscriptions?select=*&order=created_at.desc')
      setSubs(subData || [])
      const ids = [...new Set((subData || []).map(s => s.listing_id))]
      if (ids.length) {
        const listingData = await supabaseFetch(`listings?select=*&id=in.(${ids.join(',')})`)
        const map = {}
        ;(listingData || []).forEach(l => { map[l.id] = l })
        setListingsById(map)
      }
    } catch (e) {
      console.error(e)
      setError('লোড করতে সমস্যা হয়েছে')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleApprove = async (sub) => {
    setActingId(sub.id)
    try {
      const { starts_at, ends_at } = addDuration(sub.plan)
      await supabaseFetch(`listing_subscriptions?id=eq.${sub.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'active', starts_at, ends_at }),
      })
      await supabaseFetch(`listings?id=eq.${sub.listing_id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'active' }),
      })
      await load()
    } catch (e) {
      console.error(e)
      setError('অ্যাপ্রুভ করতে সমস্যা হয়েছে')
    }
    setActingId(null)
  }

  const handleReject = async (sub) => {
    setActingId(sub.id)
    try {
      await supabaseFetch(`listing_subscriptions?id=eq.${sub.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'rejected' }),
      })
      await load()
    } catch (e) {
      console.error(e)
      setError('রিজেক্ট করতে সমস্যা হয়েছে')
    }
    setActingId(null)
  }

  const filtered = subs.filter(s => s.status === tab)

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '4px' }}>Listings & Payments</h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        পেমেন্ট যাচাই করে লিস্টিং একটিভ করুন।
      </p>

      {error && (
        <div style={{ marginBottom: '16px', padding: '10px 12px', background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['pending', 'active', 'rejected', 'expired', 'cancelled'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '6px 14px', borderRadius: '20px', border: '1px solid #ddd', fontSize: '12.5px',
            background: tab === t ? '#163a2c' : 'white',
            color: tab === t ? 'white' : '#444', textTransform: 'capitalize'
          }}>{t} ({subs.filter(s => s.status === t).length})</button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>লোড হচ্ছে...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#999', background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0' }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>📋</div>
          <p>কিছু নেই</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          {filtered.map((sub, i) => {
            const listing = listingsById[sub.listing_id]
            return (
              <div key={sub.id} style={{
                padding: '14px 16px', borderBottom: i < filtered.length - 1 ? '1px solid #eee' : 'none'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: '700' }}>{listing?.business_name || 'Unknown'}</div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                      {(listing?.listing_types || []).map(t => TYPE_LABEL[t] || t).join(', ')}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                      {sub.plan === 'monthly' ? 'মাসিক' : 'বাৎসরিক'} · ৳{sub.amount} · bKash: {sub.payment_reference}
                    </div>
                  </div>
                  {sub.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px', alignSelf: 'center' }}>
                      <button disabled={actingId === sub.id} onClick={() => handleApprove(sub)} style={{
                        background: '#2d6a4f', color: 'white', borderRadius: '6px', padding: '8px 14px', fontSize: '12.5px', fontWeight: '600'
                      }}>Approve</button>
                      <button disabled={actingId === sub.id} onClick={() => handleReject(sub)} style={{
                        background: '#ffebee', color: '#c62828', borderRadius: '6px', padding: '8px 14px', fontSize: '12.5px', fontWeight: '600'
                      }}>Reject</button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
