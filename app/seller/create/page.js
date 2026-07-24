'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch } from '@/lib/supabase'

function CreateShopForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planParam = searchParams.get('plan')

  const [checking, setChecking] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [areas, setAreas] = useState([])
  const [name, setName] = useState('')
  const [areaId, setAreaId] = useState('')

  const [packages, setPackages] = useState([])
  const [selectedPkgId, setSelectedPkgId] = useState('')
  const [bkashNumber, setBkashNumber] = useState('')

  const [payerNumber, setPayerNumber] = useState('')
  const [trxId, setTrxId] = useState('')
  const [copied, setCopied] = useState(false)

  const [step, setStep] = useState('form')

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

        const pkgList = pkgRows || []
        let initialPkg = null
        if (planParam === 'premium') {
          initialPkg = pkgList.find(p => p.price > 0)
        } else if (planParam === 'free') {
          initialPkg = pkgList.find(p => !p.price || p.price <= 0)
        }
        if (!initialPkg) {
          initialPkg = pkgList.find(p => !p.price || p.price <= 0) || pkgList[0]
        }
        setSelectedPkgId(initialPkg ? initialPkg.id : '')
      } catch (e) {
        console.error(e)
        setError('তথ্য লোড করতে সমস্যা হয়েছে, পেজ রিফ্রেশ করুন')
      }
      setChecking(false)
    }
    init()
  }, [router, planParam])

  const selectedPkg = packages.find(p => p.id === selectedPkgId) || null
  const isPaidPkg = selectedPkg && selectedPkg.price > 0

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(bkashNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error(e)
    }
  }

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
    if (isPaidPkg && (!payerNumber.trim() || !trxId.trim())) {
      setError('bKash নাম্বার ও Transaction ID দুটোই দিন')
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
          description: null,
          area_id: areaId,
          owner_id: session.user.id,
          category: 'general',
          delivery_charge: 20,
          min_order_amount: 0,
          package_id: selectedPkgId || null,
          is_active: !isPaidPkg,
        }),
      })

      if (isPaidPkg) {
        const shop = Array.isArray(rows) ? rows[0] : rows
        await supabaseFetch('package_payment_requests', {
          method: 'POST',
          body: JSON.stringify({
            shop_id: shop?.id || null,
            package_id: selectedPkgId,
            amount: selectedPkg.price,
            payer_number: payerNumber.trim(),
            trx_id: trxId.trim(),
          }),
        })
        setStep('done')
        setSubmitting(false)
      } else {
        router.push('/seller/dashboard')
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'দোকান তৈরি করতে সমস্যা হয়েছে, আবার চেষ্ট করুন')
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

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
  }
  const labelStyle = { fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }

  if (step === 'done') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center', padding: '24px', background: '#f5f5f5'
      }}>
        <div style={{ fontSize: '44px', marginBottom: '14px' }}>✅</div>
        <div style={{ fontSize: '17px', fontWeight: '700', color: '#163a2c', marginBottom: '8px' }}>
          দোকান তৈরি ও পেমেন্ট রিকোয়েস্ট জমা হয়েছে
        </div>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '24px', maxWidth: '340px' }}>
          অ্যাডমিন আপনার Transaction ID যাচাই করার পর আপনার দোকান ক্রেতাদের কাছে দৃশ্যমান হব।
        </div>
        <button onClick={() => router.push('/seller/dashboard')} style={{
          background: '#2e7d32', color: 'white', border: 'none', borderRadius: '10px',
          padding: '12px 24px', fontSize: '14px', fontWeight: '600'
        }}>ড্যাশবোর্ডে যান</button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
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

        <div style={{ marginBottom: '18px' }}>
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
          </div>
        )}

        {isPaidPkg && (
          <div style={{
            background: '#fdf1f6', border: '1px dashed #e2136e', borderRadius: '8px',
            padding: '14px', marginBottom: '18px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#e2136e', marginBottom: '8px' }}>
              bKash পেমেন্ট তথ্য
            </div>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>এই bKash নাম্বারে "Payment" করুন </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#e2136e', letterSpacing: '0.5px' }}>
                {bkashNumber || '—'}
              </div>
              <button type="button" onClick={handleCopyNumber} style={{
                background: '#e2136e', color: 'white', border: 'none', borderRadius: '6px',
                padding: '5px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
              }}>{copied ? 'কপি হয়েছে' : 'কপি করুন'}</button>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>আপনার bKash নাম্বার (যেখান থেকে পাঠিয়েছেন)</label>
              <input style={inputStyle} value={payerNumber} onChange={e => setPayerNumber(e.target.value)} placeholder="যেমন: 01XXXXXXXXX" />
            </div>
            <div>
              <label style={labelStyle}>Transaction ID (Trx ID)</label>
              <input style={inputStyle} value={trxId} onChange={e => setTrxId(e.target.value)} placeholder="যেমন: 8N7A6XXXXX" />
            </div>
            <div style={{ fontSize: '12px', color: '#f4a300', marginTop: '10px' }}>
              অ্যাডমিন যাচাই করার আগ পর্যন্ত দোকানটি ক্রেতাদের কাছে দেখা যাবে না।
            </div>
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
          {submitting ? 'তৈরি হচ্...' : isPaidPkg ? 'দোকান তৈরি করুন ও পেমেন্ট জমা দন' : 'দোকান তৈরি করুন'}
        </button>
      </form>
    </div>
  )
}

export default function CreateShopPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: '#888', fontSize: '14px'
      }}>
        লোড হচ্ছে...
      </div>
    }>
      <CreateShopForm />
    </Suspense>
  )
}
