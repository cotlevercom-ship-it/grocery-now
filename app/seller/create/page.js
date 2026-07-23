'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch } from '@/lib/supabase'

export default function CreateShopPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [areas, setAreas] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [areaId, setAreaId] = useState('')
  const [category, setCategory] = useState('general')
  const [deliveryCharge, setDeliveryCharge] = useState('20')
  const [minOrderAmount, setMinOrderAmount] = useState('0')

  useEffect(() => {
    async function init() {
      const session = getSession()
      if (!session?.user) {
        router.replace('/seller/login?next=/seller/create')
        return
      }
      try {
        const existing = await supabaseFetch(`shops?select=id&owner_id=eq.${session.user.id}`)
        if (existing && existing.length > 0) {
          router.replace('/seller/dashboard')
          return
        }
        const areaRows = await supabaseFetch(`areas?select=id,name&is_active=eq.true&order=name`)
        setAreas(areaRows || [])
      } catch (e) {
        console.error(e)
        setError('তথ্য লোড করতে সমস্যা হয়েছে, পেজ রিফ্রেশ করুন')
      }
      setChecking(false)
    }
    init()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('দোকানের নাম দিন')
      return
    }
    if (!areaId) {
      setError('এলাকা বেছে নিন')
      return
    }

    setSubmitting(true)
    try {
      const session = getSession()
      const rows = await supabaseFetch('shops', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          area_id: areaId,
          owner_id: session.user.id,
          category: category.trim() || 'general',
          delivery_charge: Number(deliveryCharge) || 0,
          min_order_amount: Number(minOrderAmount) || 0,
          is_active: true,
        }),
      })
      router.push('/seller/dashboard')
    } catch (err) {
      console.error(err)
      setError(err.message || 'দোকান তৈরি করতে সমস্যা হয়েছে, আবার চেষ্টা করুন')
      setSubmitting(false)
    }
  }

  if (checking) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: '#888', fontSize: '14px'
      }}>
        লোড হচ্ছে...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Topbar */}
      <div style={{
        background: '#2e7d32', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <Link href="/">
          <div style={{ color: 'white', fontSize: '22px', lineHeight: 1 }}>←</div>
        </Link>
        <div style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>
          আপনার দোকান খুলুন
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{
        background: 'white', margin: '16px', borderRadius: '10px',
        border: '1px solid #e0e0e0', padding: '20px'
      }}>
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>দোকানের নাম *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="যেমন: রহিম স্টোর"
            style={{
              width: '100%', padding: '10px 12px', borderRadius: '8px',
              border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>বিবরণ</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="আপনার দোকান সম্পর্কে সংক্ষেপে লিখুন"
            rows={3}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: '8px',
              border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box',
              resize: 'vertical', fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>এলাকা *</label>
          <select
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: '8px',
              border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box',
              background: 'white'
            }}
          >
            <option value="">এলাকা বেছে নিন</option>
            {areas.map(area => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>ক্যাটাগরি</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="যেমন: মুদি দোকান, ফার্মেসি"
            style={{
              width: '100%', padding: '10px 12px', borderRadius: '8px',
              border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>ডেলিভারি চার্জ (৳)</label>
            <input
              type="number"
              value={deliveryCharge}
              onChange={(e) => setDeliveryCharge(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>ন্যূনতম অর্ডার (৳)</label>
            <input
              type="number"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {error && (
          <div style={{
            margin: '10px 0', padding: '10px 12px', background: '#ffebee',
            color: '#c62828', borderRadius: '8px', fontSize: '13px'
          }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%', marginTop: '10px', background: submitting ? '#a5d6a7' : '#2e7d32',
            color: 'white', padding: '12px', borderRadius: '10px', fontSize: '14px',
            fontWeight: '600', border: 'none'
          }}>
          {submitting ? 'তৈরি হচ্ছে...' : 'দোকান তৈরি করুন'}
        </button>
      </form>
    </div>
  )
}
