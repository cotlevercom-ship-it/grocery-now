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

  const [storeName, setStoreName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')

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
      } catch (e) {
        console.error(e)
        setError('Failed to load data, please refresh the page')
      }
      setChecking(false)
    }
    init()
  }, [router])

  const validateForm = () => {
    if (!storeName.trim()) return 'Please enter your store name'
    if (!ownerName.trim()) return 'Please enter the owner name'
    if (!mobileNumber.trim()) return 'Please enter a mobile number'
    return ''
  }

  const handleContinue = async (e) => {
    e.preventDefault()
    setError('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    try {
      const session = getSession()
      await supabaseFetch('shops', {
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
          is_active: true,
        }),
      })
      router.push('/merchant/dashboard')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to create shop, please try again')
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
          {submitting ? 'Creating...' : 'Create Shop — It\'s Free'}
        </button>
      </form>
    </div>
  )
}
