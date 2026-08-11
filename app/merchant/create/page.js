'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch, createReferralIfNeeded } from '@/lib/supabase'

function CreateShopForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planParam = searchParams.get('plan')
  const pkgParam = searchParams.get('pkg')
  const refCode = searchParams.get('ref') || ''

  const [checking, setChecking] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [storeName, setStoreName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')

  const [packages, setPackages] = useState([])
  const [selectedPkgId, setSelectedPkgId] = useState('')
  const [bkashNumber, setBkashNumber] = useState('')

  const [payerNumber, setPayerNumber] = useState('')
  const [trxId, setTrxId] = useState('')
  const [copied, setCopied] = useState(false)

  const [step, setStep] = useState('form') // 'form' | 'payment' | 'done'

  useEffect(() => {
    async function init() {
      const session = getSession()
      if (!session?.user) {
        router.replace('/login?next=/merchant/create')
        return
      }
      setEmail(session.user.email || '')
      try {
        const existing = await supabaseFetch(`shops?select=id&owner_id=eq.${session.user.id}`)
        if (existing && existing.length > 0) {
          router.replace('/merchant/dashboard')
          return
        }
        const [pkgRows, settings] = await Promise.all([
          supabaseFetch(`seller_packages?select=*&is_active=eq.true&order=sort_order`),
          supabaseFetch(`app_settings?select=value&key=eq.bkash_number`),
        ])
        setPackages(pkgRows || [])
        setBkashNumber(settings?.[0]?.value || '')

        const pkgList = pkgRows || []
        let initialPkg = null
        if (pkgParam) {
          initialPkg = pkgList.find(p => p.id === pkgParam)
        } else if (planParam === 'premium') {
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
        setError('Failed to load data, please refresh the page')
      }
      setChecking(false)
    }
    init()
  }, [router, planParam, pkgParam])

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

  const validateForm = () => {
    if (!storeName.trim()) return 'Please enter your store name'
    if (!ownerName.trim()) return 'Please enter the owner name'
    if (!mobileNumber.trim()) return 'Please enter a mobile number'
    if (packages.length > 0 && !selectedPkgId) return 'Please select a package'
    return ''
  }

  const createShop = async ({ withPayment }) => {
    const session = getSession()
    const rows = await supabaseFetch('shops', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        name: storeName.trim(),
        description: null,
        location: address.trim() || null,
        owner_id: session.user.id,
        owner_name: ownerName.trim(),
        phone: mobileNumber.trim(),
        category: 'general',
        delivery_charge: 20,
        min_order_amount: 0,
        package_id: selectedPkgId || null,
        is_active: !withPayment,
        ref_code: refCode || null,
      }),
    })
    return Array.isArray(rows) ? rows[0] : rows
  }

  // Step 1: Registration form submit
  const handleContinue = async (e) => {
    e.preventDefault()
    setError('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    if (isPaidPkg) {
      // Move to the payment step; shop is created after payment info is submitted
      setStep('payment')
      return
    }

    // Free package: create the shop immediately
    setSubmitting(true)
    try {
      const shop = await createShop({ withPayment: false })
      if (shop?.id && refCode) {
        await createReferralIfNeeded(shop.id, refCode)
      }
      router.push('/merchant/dashboard')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to create shop, please try again')
      setSubmitting(false)
    }
  }

  // Step 2: Payment submit
  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!payerNumber.trim() || !trxId.trim()) {
      setError('Please enter both bKash number and Transaction ID')
      return
    }

    setSubmitting(true)
    try {
      const shop = await createShop({ withPayment: true })
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
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to submit payment, please try again')
      setSubmitting(false)
    }
  }

  if (checking) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: '#888', fontSize: '14px'
      }}>
        Loading...
      </div>
    )
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
  }
  const labelStyle = { fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }

  // ---------- Step 3: Done ----------
  if (step === 'done') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center', padding: '24px', background: '#f5f5f5'
      }}>
        <div style={{ fontSize: '44px', marginBottom: '14px' }}>✅</div>
        <div style={{ fontSize: '17px', fontWeight: '700', color: '#0a0a0a', marginBottom: '8px' }}>
          Shop created and payment submitted
        </div>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '24px', maxWidth: '340px' }}>
          Your shop will be visible to buyers once the admin verifies your Transaction ID.
        </div>
        <button onClick={() => router.push('/merchant/dashboard')} style={{
          background: '#0a0a0a', color: 'white', border: 'none', borderRadius: '10px',
          padding: '12px 24px', fontSize: '14px', fontWeight: '600'
        }}>Go to Dashboard</button>
      </div>
    )
  }

  // ---------- Step 2: Payment ----------
  if (step === 'payment') {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <div style={{
          background: '#0a0a0a', padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <button onClick={() => setStep('form')} style={{
            background: 'none', border: 'none', color: 'white', fontSize: '22px', lineHeight: 1, cursor: 'pointer'
          }}>←</button>
          <div style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>
            Payment
          </div>
        </div>

        <form onSubmit={handlePaymentSubmit} style={{
          background: 'white', margin: '16px', borderRadius: '10px',
          border: '1px solid #e0e0e0', padding: '20px'
        }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#0a0a0a', marginBottom: '4px' }}>
            {selectedPkg?.name || 'Selected Package'}
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#dc2626', marginBottom: '18px' }}>
            ৳{selectedPkg?.price}/month
          </div>

          <div style={{
            background: '#fdf1f6', border: '1px dashed #e2136e', borderRadius: '8px',
            padding: '14px', marginBottom: '18px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#e2136e', marginBottom: '8px' }}>
              bKash Payment Info
            </div>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Send "Payment" to this bKash number</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#e2136e', letterSpacing: '0.5px' }}>
                {bkashNumber || '—'}
              </div>
              <button type="button" onClick={handleCopyNumber} style={{
                background: '#e2136e', color: 'white', border: 'none', borderRadius: '6px',
                padding: '5px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
              }}>{copied ? 'Copied' : 'Copy'}</button>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Your bKash number (the one you sent from)</label>
              <input style={inputStyle} value={payerNumber} onChange={e => setPayerNumber(e.target.value)} placeholder="e.g. 01XXXXXXXXX" />
            </div>
            <div>
              <label style={labelStyle}>Transaction ID (Trx ID)</label>
              <input style={inputStyle} value={trxId} onChange={e => setTrxId(e.target.value)} placeholder="e.g. 8N7A6XXXXX" />
            </div>
            <div style={{ fontSize: '12px', color: '#f4a300', marginTop: '10px' }}>
              Your shop won't be visible to buyers until the admin verifies this payment.
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
              width: '100%', marginTop: '10px', background: submitting ? '#a9a9a9' : '#0a0a0a',
              color: 'white', padding: '12px', borderRadius: '10px', fontSize: '14px',
              fontWeight: '600', border: 'none'
            }}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    )
  }

  // ---------- Step 1: Registration form ----------
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{
        background: '#0a0a0a', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <Link href="/">
          <div style={{ color: 'white', fontSize: '22px', lineHeight: 1 }}>←</div>
        </Link>
        <div style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>
          Merchant Registration
        </div>
      </div>

      <form onSubmit={handleContinue} style={{
        background: 'white', margin: '16px', borderRadius: '10px',
        border: '1px solid #e0e0e0', padding: '20px'
      }}>
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Store Name *</label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="e.g. Rahim Store"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Owner Name *</label>
          <input
            type="text"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="e.g. Rahim Uddin"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Mobile Number *</label>
          <input
            type="tel"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="e.g. 01XXXXXXXXX"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            readOnly
            style={{ ...inputStyle, background: '#f5f5f5', color: '#888' }}
          />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>Address (optional)</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Dhaka, Chattogram, or any city/country"
            style={inputStyle}
          />
        </div>

        {packages.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <label style={{ ...labelStyle, fontSize: '13px', fontWeight: '600', color: '#0a0a0a', marginBottom: '10px' }}>
              Select a Package *
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {packages.map(pkg => {
                const isSelected = selectedPkgId === pkg.id
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPkgId(pkg.id)}
                    style={{
                      border: isSelected ? '2px solid #0a0a0a' : '1px solid #ddd',
                      borderRadius: '10px', padding: '14px', cursor: 'pointer',
                      background: isSelected ? '#f5f5f5' : 'white',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#0a0a0a' }}>
                        {pkg.name_bn}
                      </div>
                      {pkg.features_bn?.length > 0 && (
                        <div style={{ fontSize: '12px', color: '#777', marginTop: '3px' }}>
                          {pkg.features_bn.join(' · ')}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#dc2626', whiteSpace: 'nowrap' }}>
                      {pkg.price > 0 ? `৳${pkg.price}/month` : 'Free'}
                    </div>
                  </div>
                )
              })}
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
            width: '100%', marginTop: '10px', background: submitting ? '#a9a9a9' : '#0a0a0a',
            color: 'white', padding: '12px', borderRadius: '10px', fontSize: '14px',
            fontWeight: '600', border: 'none'
          }}>
          {submitting ? 'Creating...' : isPaidPkg ? 'Continue to Payment' : 'Create Shop'}
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
        Loading...
      </div>
    }>
      <CreateShopForm />
    </Suspense>
  )
}
