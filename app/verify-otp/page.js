'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpForm />
    </Suspense>
  )
}

function VerifyOtpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const purpose = searchParams.get('purpose') || 'signup'
  const next = searchParams.get('next') || '/'

  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(cooldown - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    if (!code.trim() || code.trim().length !== 6) {
      setError('Please enter the 6-digit code')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: code.trim(), purpose }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Verification failed')
        setSubmitting(false)
        return
      }
      if (purpose === 'reset') {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`)
      } else if (purpose === 'merchant_reset') {
        router.push(`/merchant/reset-pin?email=${encodeURIComponent(email)}`)
      } else {
        router.push(next)
      }
    } catch (err) {
      console.error(err)
      setError('Something went wrong, please try again')
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setNotice('')
    setResending(true)
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to resend code')
      } else {
        setNotice('A new code has been sent to your email')
        setCooldown(30)
      }
    } catch (err) {
      console.error(err)
      setError('Failed to resend code')
    }
    setResending(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }}>
      <div style={{
        width: '100%', maxWidth: '380px', background: 'white', borderRadius: '16px',
        padding: '32px 26px', textAlign: 'center'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>✉️</div>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#0a0a0a', marginBottom: '6px' }}>
          Enter Verification Code
        </div>
        <div style={{ fontSize: '13px', color: '#6b6b6b', marginBottom: '22px', lineHeight: 1.6 }}>
          We sent a 6-digit code to<br /><strong>{email}</strong>
        </div>

        <form onSubmit={handleVerify}>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            style={{
              width: '100%', padding: '14px', borderRadius: '10px', border: '1.5px solid #e8e6e2',
              fontSize: '24px', fontWeight: '700', textAlign: 'center', letterSpacing: '8px',
              boxSizing: 'border-box', marginBottom: '16px'
            }}
          />

          {error && (
            <div style={{
              padding: '10px 12px', background: '#ffebee', color: '#c62828',
              borderRadius: '8px', fontSize: '13px', marginBottom: '14px'
            }}>{error}</div>
          )}
          {notice && (
            <div style={{
              padding: '10px 12px', background: '#f5f5f5', color: '#0a0a0a',
              borderRadius: '8px', fontSize: '13px', marginBottom: '14px'
            }}>{notice}</div>
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
            {submitting ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        <button
          onClick={handleResend}
          disabled={resending || cooldown > 0}
          style={{
            marginTop: '16px', background: 'none', border: 'none', fontSize: '13px',
            color: cooldown > 0 ? '#bbb' : '#0a0a0a', fontWeight: '600', textDecoration: 'underline'
          }}
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : resending ? 'Sending...' : "Didn't get a code? Resend"}
        </button>

        <div style={{ marginTop: '18px' }}>
          <Link href="/login" style={{ fontSize: '13px', color: '#999' }}>← Back</Link>
        </div>
      </div>
    </div>
  )
}
