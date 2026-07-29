'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Must match the transform used in app/seller/login/page.js — Supabase Auth
// requires a longer password than a 4-digit PIN, so it's deterministically
// padded under the hood. The seller never sees or types anything but the PIN.
function pinToPassword(pin) {
  return `sl${pin}pin`
}

export default function SellerResetPinPage() {
  return (
    <Suspense fallback={null}>
      <ResetPinForm />
    </Suspense>
  )
}

function ResetPinForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits')
      return
    }
    if (pin !== confirmPin) {
      setError('PINs do not match')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword: pinToPassword(pin), purpose: 'seller_reset' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to reset PIN')
        setSubmitting(false)
        return
      }
      setDone(true)
    } catch (err) {
      console.error(err)
      setError('Something went wrong, please try again')
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0a0a', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px'
      }}>
        <div style={{
          width: '100%', maxWidth: '380px', background: 'white', borderRadius: '16px',
          padding: '32px 26px', textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>✅</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#0a0a0a', marginBottom: '8px' }}>
            PIN Reset
          </div>
          <div style={{ fontSize: '13px', color: '#6b6b6b', marginBottom: '22px' }}>
            Your PIN has been changed. You can now log in with your new PIN.
          </div>
          <button
            onClick={() => router.push('/seller/login')}
            style={{
              width: '100%', background: '#dc2626', color: 'white', padding: '13px',
              borderRadius: '999px', fontSize: '15px', fontWeight: '700', border: 'none'
            }}
          >
            Go to Seller Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }}>
      <div style={{
        width: '100%', maxWidth: '380px', background: 'white', borderRadius: '16px',
        padding: '32px 26px'
      }}>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#0a0a0a', marginBottom: '6px' }}>
          Set New PIN
        </div>
        <div style={{ fontSize: '13px', color: '#6b6b6b', marginBottom: '22px' }}>
          For {email}
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: '12px', color: '#666', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
            New 4-digit PIN
          </label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="••••"
            style={{
              width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e8e6e2',
              fontSize: '20px', letterSpacing: '6px', textAlign: 'center',
              boxSizing: 'border-box', marginBottom: '14px'
            }}
          />

          <label style={{ fontSize: '12px', color: '#666', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
            Confirm PIN
          </label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
            placeholder="••••"
            style={{
              width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e8e6e2',
              fontSize: '20px', letterSpacing: '6px', textAlign: 'center',
              boxSizing: 'border-box', marginBottom: '14px'
            }}
          />

          {error && (
            <div style={{
              padding: '10px 12px', background: '#ffebee', color: '#c62828',
              borderRadius: '8px', fontSize: '13px', marginBottom: '14px'
            }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', background: submitting ? '#999' : '#dc2626', color: 'white',
              padding: '13px', borderRadius: '999px', fontSize: '15px', fontWeight: '700',
              border: 'none'
            }}
          >
            {submitting ? 'Saving...' : 'Reset PIN'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '18px' }}>
          <Link href="/seller/login" style={{ fontSize: '13px', color: '#999' }}>← Back to Seller Login</Link>
        </div>
      </div>
    </div>
  )
}
