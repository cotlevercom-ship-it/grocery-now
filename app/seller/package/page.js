'use client'
import { useState, useEffect } from 'react'
import { getSession, supabaseFetch } from '@/lib/supabase'
import SellerNav from '@/components/SellerNav'

export default function SellerPackagePage() {
  const [loading, setLoading] = useState(true)
  const [shop, setShop] = useState(null)
  const [packages, setPackages] = useState([])
  const [productCount, setProductCount] = useState(0)
  const [bkashNumber, setBkashNumber] = useState('')
  const [requests, setRequests] = useState([])
  const [switchingId, setSwitchingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Payment form state
  const [payingPkg, setPayingPkg] = useState(null)
  const [payerNumber, setPayerNumber] = useState('')
  const [trxId, setTrxId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    const session = getSession()
    if (!session?.user) {
      setLoading(false)
      return
    }
    try {
      const [shops, pkgs, settings] = await Promise.all([
        supabaseFetch(`shops?select=*,seller_packages(*)&owner_id=eq.${session.user.id}`),
        supabaseFetch('seller_packages?select=*&is_active=eq.true&order=sort_order'),
        supabaseFetch(`app_settings?select=value&key=eq.bkash_number`),
      ])
      const myShop = shops?.[0] || null
      setShop(myShop)
      setPackages(pkgs || [])
      setBkashNumber(settings?.[0]?.value || '')
      if (myShop) {
        const [products, reqs] = await Promise.all([
          supabaseFetch(`products?select=id&shop_id=eq.${myShop.id}`),
          supabaseFetch(`package_payment_requests?select=*&shop_id=eq.${myShop.id}&order=created_at.desc`),
        ])
        setProductCount(products?.length || 0)
        setRequests(reqs || [])
      }
    } catch (e) {
      console.error(e)
      setError('তথ্য লোড করতে সমস্যা হয়েছে')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const pendingRequestFor = (pkgId) =>
    requests.find(r => r.package_id === pkgId && r.status === 'pending')

  const handleSwitch = async (pkg) => {
    if (!shop || pkg.id === shop.package_id) return
    if (pkg.max_products != null && productCount > pkg.max_products) {
      setError(`এই প্যাকেজে সর্বোচ্চ ${pkg.max_products}টি পণ্য রাখা যায়, কিন্তু আপনার বর্তমানে ${productCount}টি পণ্য আছে। প্যাকেজ পরিবর্তনের আগে কিছু পণ্য মুছে ফেলুন।`)
      return
    }
    // Free package -> switch instantly
    if (!pkg.price || pkg.price <= 0) {
      setError('')
      setSuccess('')
      setSwitchingId(pkg.id)
      try {
        await supabaseFetch(`shops?id=eq.${shop.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ package_id: pkg.id }),
        })
        setSuccess(`আপনার প্যাকেজ "${pkg.name_bn}"-এ পরিবর্তন হয়েছে`)
        await load()
      } catch (e) {
        console.error(e)
        setError('প্যাকেজ পরিবর্তন করতে সমস্যা হয়েছে')
      }
      setSwitchingId(null)
      return
    }
    // Paid package -> open bKash payment form
    setError('')
    setSuccess('')
    setPayingPkg(pkg)
    setPayerNumber('')
    setTrxId('')
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
          shop_id: shop.id,
          package_id: payingPkg.id,
          amount: payingPkg.price,
          payer_number: payerNumber.trim(),
          trx_id: trxId.trim(),
        }),
      })
      setSuccess('আপনার পেমেন্ট রিকোয়েস্ট জমা হয়েছে। অ্যাডমিন যাচাই করার পর প্যাকেজ চালু হয়ে যাবে।')
      setPayingPkg(null)
      await load()
    } catch (e) {
      console.error(e)
      setError('রিকোয়েস্ট জমা দিতে সমস্যা হয়েছে')
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <SellerNav>
        <div style={{ color: '#888', fontSize: '14px' }}>লোড হচ্ছে...</div>
      </SellerNav>
    )
  }

  const currentPkg = shop?.seller_packages || null
  const usagePercent = currentPkg?.max_products
    ? Math.min(100, Math.round((productCount / currentPkg.max_products) * 100))
    : null

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
  }
  const labelStyle = {
    fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px', fontWeight: '500'
  }

  return (
    <SellerNav>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '4px' }}>
          সাবস্ক্রিপশন প্যাকেজ
        </h1>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
          আপনার দোকানের জন্য একটি প্যাকেজ বেছে নিন। বেশি প্যাকেজে বেশি পণ্য লিস্ট করার সুযোগ পাবেন।
        </p>

        {error && (
          <div style={{
            maxWidth: '700px', marginBottom: '16px', padding: '10px 12px',
            background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
          }}>{error}</div>
        )}
        {success && (
          <div style={{
            maxWidth: '700px', marginBottom: '16px', padding: '10px 12px',
            background: '#e8f5e9', color: '#2d6a4f', borderRadius: '8px', fontSize: '13px'
          }}>{success}</div>
        )}

        {/* Current usage */}
        <div style={{
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
          padding: '18px 22px', marginBottom: '24px', maxWidth: '700px'
        }}>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>বর্তমান প্যাকেজ</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#163a2c', marginBottom: '10px' }}>
            {currentPkg ? currentPkg.name_bn : 'নির্ধারিত নেই'}
          </div>
          <div style={{ fontSize: '13px', color: '#555', marginBottom: '6px' }}>
            পণ্য ব্যবহার: {productCount}{currentPkg?.max_products != null ? ` / ${currentPkg.max_products}` : ' / আনলিমিটেড'}
          </div>
          {usagePercent != null && (
            <div style={{ background: '#eee', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
              <div style={{
                width: `${usagePercent}%`, height: '100%',
                background: usagePercent >= 100 ? '#c62828' : usagePercent >= 80 ? '#f4a300' : '#2e7d32',
              }} />
            </div>
          )}
        </div>

        {/* bKash payment form (shown when a paid package is selected) */}
        {payingPkg && (
          <div style={{
            background: 'white', borderRadius: '12px', border: '2px solid #e2136e',
            padding: '22px', marginBottom: '24px', maxWidth: '480px'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#163a2c', marginBottom: '4px' }}>
              bKash দিয়ে পেমেন্ট করুন
            </div>
            <div style={{ fontSize: '13px', color: '#777', marginBottom: '16px' }}>
              "{payingPkg.name_bn}" প্যাকেজ — ৳{payingPkg.price}/মাস
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
                টাকা পাঠানোর পর নিচে আপনার bKash নাম্বার ও Transaction ID (Trx ID) দিন। অ্যাডমিন যাচাই করার পর প্যাকেজ চালু হয়ে যাবে।
              </div>
            </div>

            <form onSubmit={handleSubmitPayment}>
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>আপনার bKash নাম্বার (যেখান থেকে পাঠিয়েছেন)</label>
                <input style={inputStyle} value={payerNumber} onChange={e => setPayerNumber(e.target.value)} placeholder="যেমন: 01XXXXXXXXX" />
              </div>
              <div style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>Transaction ID (Trx ID)</label>
                <input style={inputStyle} value={trxId} onChange={e => setTrxId(e.target.value)} placeholder="যেমন: 8N7A6XXXXX" />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={submitting} style={{
                  background: submitting ? '#f48fb1' : '#e2136e', color: 'white', border: 'none',
                  borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600'
                }}>{submitting ? 'জমা হচ্ছে...' : 'জমা দিন'}</button>
                <button type="button" onClick={() => setPayingPkg(null)} style={{
                  background: '#f0f0f0', color: '#555', border: 'none',
                  borderRadius: '8px', padding: '10px 20px', fontSize: '14px'
                }}>বাতিল</button>
              </div>
            </form>
          </div>
        )}

        {/* Package options */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {packages.map(pkg => {
            const isCurrent = shop?.package_id === pkg.id
            const pendingReq = pendingRequestFor(pkg.id)
            return (
              <div key={pkg.id} style={{
                background: 'white', borderRadius: '12px',
                border: isCurrent ? '2px solid #2d6a4f' : '1px solid #e0e0e0',
                padding: '22px', minWidth: '240px', flex: '1 1 240px', position: 'relative'
              }}>
                {isCurrent && (
                  <span style={{
                    position: 'absolute', top: '14px', right: '14px', fontSize: '11px',
                    fontWeight: '700', color: '#2d6a4f', background: '#e8f5e9',
                    padding: '3px 10px', borderRadius: '10px'
                  }}>বর্তমান</span>
                )}
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#163a2c', marginBottom: '4px' }}>
                  {pkg.name_bn}
                </div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#2e7d32', marginBottom: '14px' }}>
                  {pkg.price > 0 ? `৳${pkg.price}` : 'ফ্রি'}
                  {pkg.price > 0 && <span style={{ fontSize: '12px', color: '#999', fontWeight: '400' }}>/মাস</span>}
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', marginBottom: '18px' }}>
                  {(pkg.features_bn || []).map((f, i) => (
                    <li key={i} style={{
                      fontSize: '13px', color: '#444', marginBottom: '8px',
                      display: 'flex', alignItems: 'flex-start', gap: '6px'
                    }}>
                      <span style={{ color: '#2e7d32' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>

                {pendingReq ? (
                  <div style={{
                    textAlign: 'center', padding: '10px', borderRadius: '8px',
                    background: '#fff3e0', color: '#f4a300', fontSize: '13px', fontWeight: '600'
                  }}>
                    যাচাইকরণ চলছে...
                  </div>
                ) : (
                  <button
                    onClick={() => handleSwitch(pkg)}
                    disabled={isCurrent || switchingId === pkg.id}
                    style={{
                      width: '100%', border: 'none', borderRadius: '8px', padding: '10px',
                      fontSize: '14px', fontWeight: '600', cursor: isCurrent ? 'default' : 'pointer',
                      background: isCurrent ? '#f0f0f0' : '#163a2c',
                      color: isCurrent ? '#999' : 'white',
                    }}
                  >
                    {isCurrent ? 'সক্রিয়' : switchingId === pkg.id ? 'পরিবর্তন হচ্ছে...' : pkg.price > 0 ? 'bKash দিয়ে নিন' : 'এই প্যাকেজ নিন'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </SellerNav>
  )
}
