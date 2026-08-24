'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, supabaseFetch } from '@/lib/supabase'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password')
      return
    }
    setSubmitting(true)
    try {
      const checkRes = await fetch('/api/login-attempts/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const checkData = await checkRes.json()
      if (checkData?.locked) {
        const mins = Math.ceil((checkData.retryAfterSeconds || 0) / 60)
        setError(`Too many failed attempts. Please try again in ${mins} minute${mins === 1 ? '' : 's'}.`)
        setSubmitting(false)
        return
      }

      let data
      try {
        data = await signIn(email.trim(), password)
      } catch (signInErr) {
        fetch('/api/login-attempts/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), success: false }),
        }).catch(() => {})
        throw signInErr
      }

      const rows = await supabaseFetch(`admin_users?select=id&user_id=eq.${data.user.id}`)
      if (!rows || rows.length === 0) {
        setError('This account does not have admin access')
        setSubmitting(false)
        return
      }
      fetch('/api/login-attempts/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), success: true }),
      }).catch(() => {})
      router.replace('/admin')
    } catch (err) {
      setError(err.message || 'Login failed')
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        background: 'white', borderRadius: '16px', padding: '32px',
        width: '100%', maxWidth: '380px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🧺</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#0a0a0a' }}>Cot Lever Admin</div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Sign in to the admin panel</div>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%', padding: '12px 14px', marginBottom: '12px',
              borderRadius: '10px', border: '1px solid #ddd', fontSize: '14px'
            }}
          />
          <input
            type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: '100%', padding: '12px 14px', marginBottom: '12px',
              borderRadius: '10px', border: '1px solid #ddd', fontSize: '14px'
            }}
          />
          {error && <div style={{ color: '#c62828', fontSize: '13px', marginBottom: '12px' }}>{error}</div>}
          <button type="submit" disabled={submitting} style={{
            width: '100%',
            background: submitting ? '#ccc' : '#0a0a0a',
            color: 'white', border: 'none', borderRadius: '10px', padding: '12px',
            fontSize: '14px', fontWeight: '600', cursor: submitting ? 'default' : 'pointer'
          }}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
          <div style={{ textAlign: 'center', marginTop: '14px' }}>
            <a href="/admin/forgot-password" style={{ fontSize: '12.5px', color: '#888' }}>Forgot password?</a>
          </div>
        </form>
      </div>
    </div>
  )
}
