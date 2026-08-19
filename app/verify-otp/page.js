'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { theme } from '@/lib/theme'

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
      } else if (purpose === 'admin_reset') {
        router.push(`/reset-password?email=${encodeURIComponent(email)}&purpose=admin_reset`)
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
      minHeight: '100vh', background: theme.paper, display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }}>
      <div style={{
        width: '100%', maxWidth: '380px', background: theme.surface, borderRadius: '16px',
        padding: '32px 26px', textAlign: 'center', border: `1px solid ${theme.line}`
      }}>
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>✉️</div>
        <div style={{ fontSize: '18px', fontWeight: '700', color: theme.ink, marginBottom: '6px' }}>
          Enter Verification Code
        </div>
        <div style={{ fontSize: '13px', color: theme.inkSoft, marginBottom: '22px', lineHeight: 1.6 }}>
          We sent a 6-digit code to<br /><strong style={{ color: theme.ink }}>{email}</strong>
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
              width: '100%', padding: '14px', borderRadius: '10px', border: `1.5px solid ${theme.line}`,
              fontSize: '24px', fontWeight: '700', textAlign: 'center', letterSpacing: '8px',
              boxSizing: 'border-box', marginBottom: '16px',
              background: theme.paper, color: theme.ink
            }}
          />

          {error && (
            <div style={{
              padding: '10px 12px', background: theme.dangerSoft, color: theme.danger,
              borderRadius: '8px', fontSize: '13px', marginBottom: '14px'
            }}>{error}</div>
          )}
          {notice && (
            <div style={{
              padding: '10px 12px', background: theme.lineSoft, color: theme.ink,
              borderRadius: '8px', fontSize: '13px', marginBottom: '14px'
            }}>{notice}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', background: submitting ? theme.line : theme.brass, color: theme.ink,
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
            color: cooldown > 0 ? theme.line : theme.inkSoft, fontWeight: '600', textDecoration: 'underline'
          }}
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : resending ? 'Sending...' : "Didn't get a code? Resend"}
        </button>

        <div style={{ marginTop: '18px' }}>
          <Link href="/login" style={{ fontSize: '13px', color: theme.inkSoft }}>← Back</Link>
        </div>
      </div>
    </div>
  )
}
