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
    <div style={{
      minHeight: '100vh', background: theme.paper, display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }}>
      <div style={{
        width: '100%', maxWidth: '380px', background: theme.surface, borderRadius: '16px',
        padding: '32px 26px', border: `1px solid ${theme.line}`
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
              width: '100%', background: submitting ? theme.line : theme.brass, color: theme.ink,
              padding: '13px', borderRadius: '999px', fontSize: '15px', fontWeight: '700',
              border: 'none'
            }}
          >
            {submitting ? 'Sending...' : 'Send Code'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '18px' }}>
          <Link href="/login" style={{ fontSize: '13px', color: theme.inkSoft }}>← Back to Log In</Link>
        </div>
      </div>
    </div>
  )
}
