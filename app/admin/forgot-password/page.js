'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

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
        body: JSON.stringify({ email: email.trim(), purpose: 'admin_reset' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to send code')
        setSubmitting(false)
        return
      }
      setSent(true)
      setTimeout(() => {
        router.push(`/verify-otp?email=${encodeURIComponent(email.trim())}&purpose=admin_reset`)
      }, 600)
    } catch (err) {
      console.error(err)
      setError('Something went wrong, please try again')
      setSubmitting(false)
    }
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
          Admin Password Reset
        </div>
        <div style={{ fontSize: '13px', color: '#6b6b6b', marginBottom: '22px', lineHeight: 1.6 }}>
          Enter your admin email and we&apos;ll send a verification code to reset your password
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: '12px', color: '#666', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
            Admin email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e8e6e2',
              fontSize: '14px', boxSizing: 'border-box', marginBottom: '14px'
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
              width: '100%', background: submitting ? '#999' : '#f4a300', color: '#0a0a0a',
              padding: '13px', borderRadius: '10px', fontSize: '15px', fontWeight: '700',
              border: 'none'
            }}
          >
            {submitting ? (sent ? 'Code sent...' : 'Sending...') : 'Send Code'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '18px' }}>
          <Link href="/admin/login" style={{ fontSize: '13px', color: '#999' }}>← Back to Admin Log In</Link>
        </div>
      </div>
    </div>
  )
}
