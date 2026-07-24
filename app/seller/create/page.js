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

  // Package selection
  const [packages, setPackages] = useState([])
  const [selectedPkgId, setSelectedPkgId] = useState('')
  const [bkashNumber, setBkashNumber] = useState('')

  // Payment step (shown after shop is created with a paid package)
  const [step, setStep] = useState('form') // 'form' | 'payment' | 'done'
  const [createdShopId, setCreatedShopId] = useState(null)
  const [payerNumber, setPayerNumber] = useState('')
  const [trxId, setTrxId] = useState('')
  const [copied, setCopied] = useState(false)

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
        const [areaRows, pkgRows, settings] = await Promise.all([
          supabaseFetch(`areas?select=id,name&is_active=eq.true&order=name`),
          supabaseFetch(`seller_packages?select=*&is_active=eq.true&order=sort_order`),
          supabaseFetch(`app_settings?select=value&key=eq.bkash_number`),
        ])
        setAreas(areaRows || [])
        setPackages(pkgRows || [])
        setBkashNumber(settings?.[0]?.value || '')
        const freePkg = (pkgRows || []).find(p => !p.price || p.price <= 0)
        setSelectedPkgId(freePkg ? freePkg.id : (pkgRows?.[0]?.id || ''))
      } catch (e) {
        console.error(e)
        setError('তথ্য লোড করতে সমস্যা হয়েছে, পেজ রিফ্রেশ করুন')
      }
      setChecking(false)
    }
    init()
  }, [router])

  const selectedPkg = packages.find(p => p.id === selectedPkgId) || null
  const isPaidPkg = selectedPkg && selectedPkg.price > 0

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
    if (packages.length > 0 && !selectedPkgId) {
      setError('একটি প্যাকেজ বেছে নিন')
      return
    }

    setSubmitting(true)
    try {
      const session = getSession()
      const rows = await supabaseFetch('shops', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          area_id: areaId,
          owner_id: session.user.id,
          category: category.trim() || 'general',
          delivery_charge: Number(deliveryCharge) || 0,
          min_order_amount: Number(minOrderAmount) || 0,
          package_id: selectedPkgId || null,
          // Paid package: shop stays hidden until admin verifies the bKash payment
          is_active: !isPaidPkg,
        }),
      })

      if (isPaidPkg) {
        const shop = Array.isArray(rows) ? rows[0] : rows
        setCreatedShopId(shop?.id || null)
        setStep('payment')
        setSubmitting(false)
      } else {
        router.push('/seller/dashboard')
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'দোকান তৈরি করতে সমস্যা হয়েছে, আবার চেষ্টা করুন')
      setSubmitting(false)
    }
  }

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(bkashNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSubmitPayment = async (e) => {
    e.preventDefault()
    if (!payerNumber.trim() || !trxId.trim()) {
      setError('পেয়ার নাম্বার ও Transaction ID দুটোই দিন')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await supabaseFetch('package_payment_requests', {
        method: 'POST',
        body: JSON.stringify({
          shop_id: createdShopId,
          package_id: selectedPkgId,
          amount: selectedPkg.price,
          payer_number: payerNumber.trim(),
          trx_id: trxId.trim(),
        }),
      })
      setStep('done')
    } catch (e) {
      console.error(e)
      setError('রিকোয়েস্ট জমা দিতে সমস্যা হয়েছে')
    }
    setSubmitting(false)
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

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
  }
  const labelStyle = { fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }

  // ---- Step: payment (after shop created with a paid package) ----
  if (step === 'payment') {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <div style={{
          background: '#2e7d32', padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <div style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>
            bKash পেমেন্ট সম্পন্ন করুন
          </div>
        </div>

        <div style={{
          background: 'white', margin: '16px', borderRadius: '12px',
          border: '2px solid #e2136e', padding: '22px'
        }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#163a2c', marginBottom: '4px' }}>
            "{selectedPkg.name_bn}" প্যাকেজ — ৳{selectedPkg.price}/মাস
          </div>
          <div style={{ fontSize: '13px', color: '#777', marginBottom: '16px' }}>
            দোকান তৈরি হয়েছে। পেমেন্ট যাচাই হওয়ার পর এটি ক্রেতাদের কাছে দৃশ্যমান হবে।
          </div>

          <div style={{
            background: '#fdf1f6', border: '1px dashed #e2136e', borderRadius: '8px',
            padding: '14px', marginBottom: '16px'
          }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>এই bKash নাম্বারে "Send Money" করুন</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#e2136e', letterSpacing: '0.5px' }}>
                {bkashNumber || '—'}
              </div>
              <button type="button" onClick={handleCopyNumber} style={{
                background: '#e2136e', color: 'white', border: 'none', borderRadius: '6px',
                padding: '5px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
              }}>{copied ? 'কপি হয়েছে' : 'কপি করুন'}</button>
            </div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
              টাকা পাঠানোর পর নিচে আপনার bKash নাম্বার ও Transaction ID (Trx ID) দিন। অ্যাডমিন যাচাই করার পর দোকান চালু হয়ে যাবে।
            </div>
          </div>

          {error && (
            <div style={{
              marginBottom: '16px', padding: '10px 12px',
              background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmitPayment}>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>আপনার bKash নাম্বার (যেখান থেকে পাঠিয়েছেন)</label>
              <input style={inputStyle} value={payerNumber} onChange={e => setPayerNumber(e.target.value)} placeholder="যেমন: 01XXXXXXXXX" />
            </div>
            <div style={{ marginBottom: '18px' }}>
              <label style={labelStyle}>Transaction ID (Trx ID)</label>
              <input style={inputStyle} value={trxId} onChange={e => setTrxId(e.target.value)} placeholder="যেমন: 8N7A6XXXXX" />
            </div>
            <button type="submit" disabled={submitting} style={{
              width: '100%', background: submitting ? '#f48fb1' : '#e2136e', color: 'white',
              border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '600'
            }}>{submitting ? 'জমা হচ্ছে...' : 'পেমেন্ট রিকোয়েস্ট জমা দিন'}</button>
          </form>
        </div>
      </div>
    )
  }

  // ---- Step: done ----
  if (step === 'done') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center', padding: '24px', background: '#f5f5f5'
      }}>
        <div style={{ fontSize: '44px', marginBottom: '14px' }}>✅</div>
        <div style={{ fontSize: '17px', fontWeight: '700', color: '#163a2c', marginBottom: '8px' }}>
          পেমেন্ট রিকোয়েস্ট জমা হয়েছে
        </div>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '24px', maxWidth: '340px' }}>
          অ্যাডমিন আপনার Transaction ID যাচাই করার পর আপনার দোকান ক্রেতাদের কাছে দৃশ্যমান হবে।
        </div>
        <button onClick={() => router.push('/seller/dashboard')} style={{
          background: '#2e7d32', color: 'white', border: 'none', borderRadius: '10px',
          padding: '12px 24px', fontSize: '14px', fontWeight: '600'
        }}>ড্যাশবোর্ডে যান</button>
      </div>
    )
  }

  // ---- Step: form ----
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
          <label style={labelStyle}>দোকানের নাম *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="যেমন: রহিম স্টোর"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>বিবরণ</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="আপনার দোকান সম্পর্কে সংক্ষেপে লিখুন"
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>এলাকা *</label>
          <select
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
            style={{ ...inputStyle, background: 'white' }}
          >
            <option value="">এলাকা বেছে নিন</option>
            {areas.map(area => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>ক্যাটাগরি</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="যেমন: মুদি দোকান, ফার্মেসি"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>ডেলিভারি চার্জ (৳)</label>
            <input
              type="number"
              value={deliveryCharge}
              onChange={(e) => setDeliveryCharge(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>ন্যূনতম অর্ডার (৳)</label>
            <input
              type="number"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {packages.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <label style={{ ...labelStyle, fontSize: '13px', fontWeight: '600', color: '#163a2c', marginBottom: '10px' }}>
              প্যাকেজ বেছে নিন *
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {packages.map(pkg => {
                const isSelected = selectedPkgId === pkg.id
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPkgId(pkg.id)}
                    style={{
                      border: isSelected ? '2px solid #2e7d32' : '1px solid #ddd',
                      borderRadius: '10px', padding: '14px', cursor: 'pointer',
                      background: isSelected ? '#f1f8f2' : 'white',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#163a2c' }}>
                        {pkg.name_bn}
                      </div>
                      {pkg.features_bn?.length > 0 && (
                        <div style={{ fontSize: '12px', color: '#777', marginTop: '3px' }}>
                          {pkg.features_bn.join(' · ')}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#2e7d32', whiteSpace: 'nowrap' }}>
                      {pkg.price > 0 ? `৳${pkg.price}/মাস` : 'ফ্রি'}
                    </div>
                  </div>
                )
              })}
            </div>
            {isPaidPkg && (
              <div style={{ fontSize: '12px', color: '#f4a300', marginTop: '10px' }}>
                পেইড প্যাকেজ বেছে নিলে দোকান তৈরির পর bKash পেমেন্ট সম্পন্ন করতে হবে। অ্যাডমিন যাচাই করার আগ পর্যন্ত দোকানটি ক্রেতাদের কাছে দেখা যাবে না।
              </div>
            )}
          </div>
        )}

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
          {submitting ? 'তৈরি হচ্ছে...' : isPaidPkg ? 'দোকান তৈরি করুন ও পেমেন্ট করুন' : 'দোকান তৈরি করুন'}
        </button>
      </form>
    </div>
  )
}
