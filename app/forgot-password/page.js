'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { theme } from '@/lib/theme'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Please enter your email')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), purpose: 'reset' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to send code')
        setSubmitting(false)
        return
      }
      router.push(`/verify-otp?email=${encodeURIComponent(email.trim())}&purpose=reset`)
    } catch (err) {
      console.error(err)
      setError('Something went wrong, please try again')
      setSubmitting(false)
    }
  }

  return (
    <div className="fp-shell" style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, rgba(23,10,9,0.5) 0%, rgba(23,10,9,0.82) 100%), url('/marketing/forgot-password-bg.jpg') center / cover no-repeat, ${theme.paper}`,
      display: 'flex',
      flexDirection: 'column',
      padding: '0 16px 40px'
    }}>
      <div className="fp-inner">
      <div style={{ width: 'min(92vw, 420px)', padding: '18px 0 0' }}>
        <Link href="/login" style={{ color: theme.inkSoft, fontSize: '14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '18px', lineHeight: 1 }}>←</span> Back to Log In
        </Link>
      </div>
      <div style={{
        width: 'min(92vw, 420px)', background: theme.surface, borderRadius: '16px',
        padding: '32px 26px', border: `1px solid ${theme.line}`,
        boxShadow: '0 20px 50px rgba(0,0,0,0.45)', marginTop: '32px'
      }}>
        <div style={{ fontSize: '18px', fontWeight: '700', color: theme.ink, marginBottom: '6px' }}>
          Forgot Password
        </div>
        <div style={{ fontSize: '13px', color: theme.inkSoft, marginBottom: '22px', lineHeight: 1.6 }}>
          Enter your email and we&apos;ll send you a code to reset your password
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: '12px', color: theme.inkSoft, fontWeight: '600', display: 'block', marginBottom: '6px' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              width: '100%', padding: '12px 14px', borderRadius: '10px', border: `1.5px solid ${theme.line}`,
              fontSize: '14px', boxSizing: 'border-box', marginBottom: '14px',
              background: theme.paper, color: theme.ink
            }}
          />

          {error && (
            <div style={{
              padding: '10px 12px', background: theme.dangerSoft, color: theme.danger,
              borderRadius: '8px', fontSize: '13px', marginBottom: '14px'
            }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', background: submitting ? theme.line : theme.brass, color: 'white',
              padding: '13px', borderRadius: '999px', fontSize: '15px', fontWeight: '700',
              border: 'none'
            }}
          >
            {submitting ? 'Sending...' : 'Send Code'}
          </button>
        </form>
      </div>
      </div>

      <style jsx>{`
        .fp-shell {
          align-items: center;
        }
        @media (min-width: 900px) {
          .fp-inner {
            transform: translateX(-96px);
          }
        }
      `}</style>
    </div>
  )
}
