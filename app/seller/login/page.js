'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, signUp } from '@/lib/supabase'

const COLORS = {
  ink: '#0a0a0a',
  forest: '#0a0a0a',
  forestMid: '#2a2a2a',
  gold: '#dc2626',
  goldSoft: '#f8d7d5',
  cream: '#faf8f4',
  line: '#e7e2d8',
  textMuted: '#6b7b74',
}

const trustPoints = [
  'Easy product & order management',
  'Open your shop and start taking orders in minutes',
  'Secure payments & data protection',
]

export default function SellerLoginPage() {
  return (
    <Suspense fallback={null}>
      <SellerLoginForm />
    </Suspense>
  )
}

function SellerLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next') || '/seller/dashboard'
  const refCode = searchParams.get('ref') || ''

  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

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
        await signUp(email.trim(), password)
        try {
          await fetch('/api/otp/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), purpose: 'signup' }),
          })
        } catch (otpErr) {
          console.error('otp send failed', otpErr)
        }
        const nextAfterVerify = refCode ? `/seller/create?ref=${encodeURIComponent(refCode)}` : '/seller/create'
        router.push(`/verify-otp?email=${encodeURIComponent(email.trim())}&purpose=signup&next=${encodeURIComponent(nextAfterVerify)}`)
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

  const switchMode = (next) => {
    setMode(next)
    setError('')
  }

  return (
    <div className="seller-auth-page">
      <div className="hero-bg" />
      <div className="hero-overlay" />

      <Link href="/" className="top-back">← Back to Home</Link>

      <div className="hero-content">
        <h1>Your Shop,<br />At Thousands of Doorsteps</h1>
        <p>Join Cot Lever — sell across Bangladesh and worldwide, <span className="highlight">NO COMMISSION</span>, subscription-based plans only.</p>

        <ul className="trust-list">
          {trustPoints.map((point) => (
            <li key={point}>
              <span className="trust-dot" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="form-panel">
        <div className="form-card">
          <div className="form-heading">
            <h2>{mode === 'login' ? 'Seller Login' : 'Create Seller Account'}</h2>
            <p>{mode === 'login' ? 'Log in to manage your shop' : 'Open your shop in just a few steps'}</p>
          </div>

          <div className="mode-switch" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={mode === 'login' ? 'active' : ''}
              onClick={() => switchMode('login')}
            >
              Log In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              className={mode === 'signup' ? 'active' : ''}
              onClick={() => switchMode('signup')}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="seller-email">Email</label>
              <input
                id="seller-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seller@example.com"
                autoComplete="email"
              />
            </div>

            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label htmlFor="seller-password" style={{ marginBottom: 0 }}>Password</label>
                {mode === 'login' && (
                  <Link href="/forgot-password" style={{ fontSize: '12px', color: COLORS.textMuted, textDecoration: 'underline' }}>
                    Forgot password?
                  </Link>
                )}
              </div>
              <input
                id="seller-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting
                ? 'Please wait...'
                : mode === 'login' ? 'Log In' : 'Create Seller Account'}
            </button>
          </form>

          <div className="form-footnote">
            {mode === 'login' ? (
              <>Don't have a shop yet? <button type="button" onClick={() => switchMode('signup')}>Sign Up</button></>
            ) : (
              <>Already have an account? <button type="button" onClick={() => switchMode('login')}>Log In</button></>
            )}
          </div>

          <Link href="/login" className="customer-link">Want to log in as a customer? →</Link>
        </div>
      </div>

      <style jsx>{`
        .seller-auth-page {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 90px 5vw 40px;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 30% 20%, #2a2a2a 0%, #000000 60%);
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 26px 26px;
          mask-image: radial-gradient(circle at 20% 30%, black, transparent 70%);
        }
        .top-back {
          position: absolute;
          top: 24px;
          left: 5vw;
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          z-index: 2;
        }
        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 620px;
          color: white;
        }
        .hero-content h1 {
          font-size: clamp(34px, 5vw, 56px);
          font-weight: 800;
          line-height: 1.08;
          margin: 0 0 18px;
          text-transform: uppercase;
          letter-spacing: -0.01em;
        }
        .hero-content p {
          font-size: 16px;
          line-height: 1.6;
          color: rgba(255,255,255,0.72);
          max-width: 460px;
          margin: 0 0 28px;
        }
        .highlight {
          color: ${COLORS.gold};
          font-weight: 800;
        }
        .trust-list {
          list-style: none;
          margin: 0 0 40px;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .trust-list li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: rgba(255,255,255,0.85);
        }
        .trust-dot {
          flex-shrink: 0;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${COLORS.gold};
        }
        .form-panel {
          position: relative;
          z-index: 2;
          margin-left: auto;
        }
        .form-card {
          width: min(400px, 92vw);
          background: white;
          border-radius: 18px;
          padding: clamp(24px, 3vw, 34px);
          box-shadow: 0 32px 64px -24px rgba(0,0,0,0.55);
        }
        .form-heading h2 {
          font-size: 21px;
          font-weight: 700;
          color: ${COLORS.forest};
          margin: 0 0 4px;
        }
        .form-heading p {
          font-size: 13px;
          color: ${COLORS.textMuted};
          margin: 0 0 22px;
        }
        .mode-switch {
          display: flex;
          background: #f1efe9;
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 22px;
        }
        .mode-switch button {
          flex: 1;
          border: none;
          background: transparent;
          padding: 9px 0;
          font-size: 13px;
          font-weight: 600;
          color: ${COLORS.textMuted};
          border-radius: 8px;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .mode-switch button.active {
          background: white;
          color: ${COLORS.forest};
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .field {
          margin-bottom: 16px;
        }
        .field label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: ${COLORS.forest};
          margin-bottom: 6px;
        }
        .field input {
          width: 100%;
          padding: 11px 13px;
          border-radius: 10px;
          border: 1px solid ${COLORS.line};
          font-size: 14px;
          font-family: inherit;
          background: #fdfcfa;
          box-sizing: border-box;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .field input:focus {
          outline: none;
          border-color: ${COLORS.gold};
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.14);
          background: white;
        }
        .alert {
          font-size: 13px;
          padding: 10px 12px;
          border-radius: 8px;
          margin-bottom: 14px;
        }
        .alert-error {
          background: #fdeceb;
          color: #b3261e;
        }
        .submit-btn {
          width: 100%;
          padding: 13px;
          border-radius: 10px;
          border: none;
          background: ${COLORS.forest};
          color: white;
          font-size: 14px;
          font-weight: 700;
          margin-top: 4px;
          transition: background 0.15s ease, transform 0.1s ease;
        }
        .submit-btn:hover:not(:disabled) {
          background: ${COLORS.gold};
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(1px);
        }
        .submit-btn:disabled {
          background: #a9a9a9;
          cursor: not-allowed;
        }
        .form-footnote {
          text-align: center;
          font-size: 13px;
          color: ${COLORS.textMuted};
          margin-top: 18px;
        }
        .form-footnote button {
          background: none;
          border: none;
          color: ${COLORS.gold};
          font-weight: 700;
          font-size: 13px;
          padding: 0;
        }
        .customer-link {
          display: block;
          text-align: center;
          font-size: 13px;
          color: ${COLORS.textMuted};
          margin-top: 22px;
        }

        @media (max-width: 960px) {
          .seller-auth-page {
            flex-direction: column;
            align-items: stretch;
            padding: 80px 20px 40px;
          }
          .hero-content {
            max-width: none;
            margin-bottom: 32px;
          }
          .hero-content h1 {
            font-size: 32px;
          }
          .trust-list {
            display: none;
          }
          .form-panel {
            margin-left: 0;
            display: flex;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}
