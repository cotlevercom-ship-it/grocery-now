'use client'
import { useState, useEffect } from 'react'
import { getSession, supabaseFetch } from '@/lib/supabase'
import MerchantNav from '@/components/MerchantNav'

export default function MerchantPackagePage() {
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
      setError('Failed to load data')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const pendingRequestFor = (pkgId) =>
    requests.find(r => r.package_id === pkgId && r.status === 'pending')

  const handleSwitch = async (pkg) => {
    if (!shop || pkg.id === shop.package_id) return
    if (pkg.max_products != null && productCount > pkg.max_products) {
      setError(`This package allows a maximum of ${pkg.max_products} products, but you currently have ${productCount}. Please remove some products before switching.`)
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
        setSuccess(`Your package has been switched to "${pkg.name_bn}"`)
        await load()
      } catch (e) {
        console.error(e)
        setError('Failed to switch package')
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
      setError('Please enter both payer number and Transaction ID')
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
      setSuccess('Your payment request has been submitted. Your package will activate once the admin verifies it.')
      setPayingPkg(null)
      await load()
    } catch (e) {
      console.error(e)
      setError('Failed to submit request')
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <MerchantNav>
        <div style={{ color: '#888', fontSize: '14px' }}>Loading...</div>
      </MerchantNav>
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
    <MerchantNav>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '4px' }}>
          Subscription Package
        </h1>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
          Choose a package for your shop. Higher packages let you list more products.
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
            background: '#f5f5f5', color: '#2d6a4f', borderRadius: '8px', fontSize: '13px'
          }}>{success}</div>
        )}

        {/* Current usage */}
        <div style={{
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
          padding: '18px 22px', marginBottom: '24px', maxWidth: '700px'
        }}>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>Current Package</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#163a2c', marginBottom: '10px' }}>
            {currentPkg ? currentPkg.name_bn : 'Not set'}
          </div>
          <div style={{ fontSize: '13px', color: '#555', marginBottom: '6px' }}>
            Product usage: {productCount}{currentPkg?.max_products != null ? ` / ${currentPkg.max_products}` : ' / Unlimited'}
          </div>
          {usagePercent != null && (
            <div style={{ background: '#eee', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
              <div style={{
                width: `${usagePercent}%`, height: '100%',
                background: usagePercent >= 100 ? '#c62828' : usagePercent >= 80 ? '#f4a300' : '#0a0a0a',
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
              Pay with bKash
            </div>
            <div style={{ fontSize: '13px', color: '#777', marginBottom: '16px' }}>
              "{payingPkg.name_bn}" package — ৳{payingPkg.price}/month
            </div>

            <div style={{
              background: '#fdf1f6', border: '1px dashed #e2136e', borderRadius: '8px',
              padding: '14px', marginBottom: '16px'
            }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Send "Payment" to this bKash number</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#e2136e', letterSpacing: '0.5px' }}>
                  {bkashNumber || '—'}
                </div>
                <button type="button" onClick={handleCopyNumber} style={{
                  background: '#e2136e', color: 'white', border: 'none', borderRadius: '6px',
                  padding: '5px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                }}>{copied ? 'Copied' : 'Copy'}</button>
              </div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
                After sending payment, enter your bKash number and Transaction ID (Trx ID) below. Your package will activate once the admin verifies it.
              </div>
            </div>

            <form onSubmit={handleSubmitPayment}>
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Your bKash number (the one you sent from)</label>
                <input style={inputStyle} value={payerNumber} onChange={e => setPayerNumber(e.target.value)} placeholder="e.g. 01XXXXXXXXX" />
              </div>
              <div style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>Transaction ID (Trx ID)</label>
                <input style={inputStyle} value={trxId} onChange={e => setTrxId(e.target.value)} placeholder="e.g. 8N7A6XXXXX" />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={submitting} style={{
                  background: submitting ? '#f48fb1' : '#e2136e', color: 'white', border: 'none',
                  borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600'
                }}>{submitting ? 'Submitting...' : 'Submit'}</button>
                <button type="button" onClick={() => setPayingPkg(null)} style={{
                  background: '#f0f0f0', color: '#555', border: 'none',
                  borderRadius: '8px', padding: '10px 20px', fontSize: '14px'
                }}>Cancel</button>
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
                    fontWeight: '700', color: '#2d6a4f', background: '#f5f5f5',
                    padding: '3px 10px', borderRadius: '10px'
                  }}>Current</span>
                )}
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#163a2c', marginBottom: '4px' }}>
                  {pkg.name_bn}
                </div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#0a0a0a', marginBottom: '14px' }}>
                  {pkg.price > 0 ? `৳${pkg.price}` : 'Free'}
                  {pkg.price > 0 && <span style={{ fontSize: '12px', color: '#999', fontWeight: '400' }}>/month</span>}
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', marginBottom: '18px' }}>
                  {(pkg.features_bn || []).map((f, i) => (
                    <li key={i} style={{
                      fontSize: '13px', color: '#444', marginBottom: '8px',
                      display: 'flex', alignItems: 'flex-start', gap: '6px'
                    }}>
                      <span style={{ color: '#0a0a0a' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>

                {pendingReq ? (
                  <div style={{
                    textAlign: 'center', padding: '10px', borderRadius: '8px',
                    background: '#fff3e0', color: '#f4a300', fontSize: '13px', fontWeight: '600'
                  }}>
                    Verification in progress...
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
                    {isCurrent ? 'Active' : switchingId === pkg.id ? 'Switching...' : pkg.price > 0 ? 'Pay with bKash' : 'Choose this Package'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </MerchantNav>
  )
}
