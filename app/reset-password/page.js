'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { theme } from '@/lib/theme'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const purpose = searchParams.get('purpose') || 'reset'
  const isAdmin = purpose === 'admin_reset'
  const loginHref = isAdmin ? '/admin/login' : '/login'

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword: password, purpose }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to reset password')
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
        minHeight: '100vh', background: theme.paper, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px'
      }}>
        <div style={{
          width: '100%', maxWidth: '380px', background: theme.surface, borderRadius: '16px',
          padding: '32px 26px', textAlign: 'center', border: `1px solid ${theme.line}`
        }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>✅</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: theme.ink, marginBottom: '8px' }}>
            Password Reset
          </div>
          <div style={{ fontSize: '13px', color: theme.inkSoft, marginBottom: '22px' }}>
            Your password has been changed. You can now log in with your new password.
          </div>
          <button
            onClick={() => router.push(loginHref)}
            style={{
              width: '100%', background: theme.brass, color: theme.ink, padding: '13px',
              borderRadius: '999px', fontSize: '15px', fontWeight: '700', border: 'none'
            }}
          >
            Go to Log In
          </button>
        </div>
      </div>
    )
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
          Set New Password
        </div>
        <div style={{ fontSize: '13px', color: theme.inkSoft, marginBottom: '22px' }}>
          For {email}
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: '12px', color: theme.inkSoft, fontWeight: '600', display: 'block', marginBottom: '6px' }}>
            New Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            style={{
              width: '100%', padding: '12px 14px', borderRadius: '10px', border: `1.5px solid ${theme.line}`,
              fontSize: '14px', boxSizing: 'border-box', marginBottom: '14px',
              background: theme.paper, color: theme.ink
            }}
          />

          <label style={{ fontSize: '12px', color: theme.inkSoft, fontWeight: '600', display: 'block', marginBottom: '6px' }}>
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
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
            {submitting ? 'Saving...' : 'Reset Password'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '18px' }}>
          <Link href={loginHref} style={{ fontSize: '13px', color: theme.inkSoft }}>← Back to Log In</Link>
        </div>
      </div>
    </div>
  )
}
