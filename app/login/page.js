'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, signUp, supabaseFetch } from '@/lib/supabase'
import AgreementCheckbox from '@/components/AgreementCheckbox'

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next') || '/'

  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')

    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name')
      return
    }
    if (mode === 'signup' && !agreed) {
      setError('Please agree to the terms to continue')
      return
    }
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'signup') {
        const data = await signUp(email.trim(), password)
        if (data?.user?.id) {
          try {
            await supabaseFetch('user_profiles', {
              method: 'POST',
              headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
              body: JSON.stringify({ id: data.user.id, full_name: name.trim() }),
            })
          } catch (profileErr) {
            console.error('profile save failed', profileErr)
          }
        }
        // Send email OTP and require verification before continuing
        try {
          await fetch('/api/otp/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), purpose: 'signup' }),
          })
        } catch (otpErr) {
          console.error('otp send failed', otpErr)
        }
        router.push(`/verify-otp?email=${encodeURIComponent(email.trim())}&purpose=signup&next=${encodeURIComponent(nextUrl)}`)
      } else {
        await signIn(email.trim(), password)
        router.push(nextUrl)
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'Something went wrong, please try again')
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #000000 0%, #f5f5f5 260px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0 16px 40px'
    }}>
      {/* Back link */}
      <div style={{ width: '100%', maxWidth: '420px', padding: '18px 0 0' }}>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '18px', lineHeight: 1 }}>←</span> Back to Home
        </Link>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: '420px', background: 'white', borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.12)', padding: '28px 24px', marginTop: '32px'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '19px', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px' }}>
            {mode === 'login' ? 'Log In' : 'Create Account'}
          </div>
          <div style={{ fontSize: '13px', color: '#888' }}>
            {mode === 'login' ? 'Welcome back! Log in to continue' : 'Create an account to get started'}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#666', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="login-input"
              />
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: '#666', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="login-input"
            />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>Password</label>
              {mode === 'login' && (
                <Link href="/forgot-password" style={{ fontSize: '12px', color: '#666', textDecoration: 'underline' }}>
                  Forgot password?
                </Link>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="login-input"
            />
          </div>

          {error && (
            <div style={{
              margin: '12px 0 0', padding: '10px 12px', background: '#ffebee',
              color: '#c62828', borderRadius: '8px', fontSize: '13px'
            }}>{error}</div>
          )}
          {notice && (
            <div style={{
              margin: '12px 0 0', padding: '10px 12px', background: '#f5f5f5',
              color: '#0a0a0a', borderRadius: '8px', fontSize: '13px'
            }}>{notice}</div>
          )}

          {mode === 'signup' && (
            <div style={{ marginTop: '16px' }}>
              <AgreementCheckbox type="customer" checked={agreed} onChange={setAgreed} accent="#000000" />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', marginTop: '18px', background: submitting ? '#555555' : '#000000',
              color: 'white', padding: '13px', borderRadius: '10px', fontSize: '15px',
              fontWeight: '700', border: 'none', cursor: submitting ? 'default' : 'pointer',
              boxShadow: submitting ? 'none' : '0 4px 12px rgba(0,0,0,0.28)'
            }}>
            {submitting ? 'Please wait...' : (mode === 'login' ? 'Log In' : 'Create Account')}
          </button>

          <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: '#666' }}>
            {mode === 'login' ? (
              <>Don't have an account? <button type="button" onClick={() => { setMode('signup'); setError(''); setNotice('') }} style={{ color: '#000000', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign Up</button></>
            ) : (
              <>Already have an account? <button type="button" onClick={() => { setMode('login'); setError(''); setNotice('') }} style={{ color: '#000000', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Log In</button></>
            )}
          </div>
        </form>
      </div>

      <style jsx>{`
        .login-input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1.5px solid #e0e0e0;
          font-size: 14px;
          box-sizing: border-box;
          background: #fafafa;
          transition: border-color 0.15s, background 0.15s;
        }
        .login-input:focus {
          outline: none;
          border-color: #000000;
          background: white;
        }
      `}</style>
    </div>
  )
}
