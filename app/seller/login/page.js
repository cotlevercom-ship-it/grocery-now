'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, signUp } from '@/lib/supabase'

const COLORS = {
  ink: '#0f2a20',
  forest: '#123024',
  forestMid: '#1f5b41',
  gold: '#d99a1b',
  goldSoft: '#f4e3c1',
  cream: '#faf8f4',
  line: '#e7e2d8',
  textMuted: '#6b7b74',
}

const trustPoints = [
  {
    label: 'Easy product & order management',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4 7L12 3L20 7V17L12 21L4 17V7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M4 7L12 11L20 7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M12 11V21" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    label: 'Open your shop and start taking orders in minutes',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L4 14H11L10 22L20 9H13L13 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Secure payments & data protection',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L20 5V11C20 16 16.5 20 12 22C7.5 20 4 16 4 11V5L12 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 12L11.2 14.2L15.5 9.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
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
      {/* Brand / info panel */}
      <div className="brand-panel">
        <div className="brand-panel-pattern" />
        <div className="brand-panel-inner">
          <Link href="/" className="brand-mark">
            <span className="brand-mark-badge">C</span>
            <span className="brand-mark-text">Cot Lever</span>
          </Link>

          <div className="brand-panel-copy">
            <span className="brand-eyebrow">Seller Portal</span>
            <h1>Your Shop,<br />At Thousands of Doorsteps</h1>
            <p>Join Cot Lever — sell across Bangladesh and worldwide, no commission, subscription-based plans only.</p>
          </div>

          <ul className="trust-list">
            {trustPoints.map((point) => (
              <li key={point.label}>
                <span className="trust-icon">{point.icon}</span>
                <span>{point.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form panel */}
      <div className="form-panel">
        <div className="form-panel-inner">
          <Link href="/" className="mobile-back">← Back to Home</Link>

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
          </div>

          <Link href="/login" className="customer-link">Want to log in as a customer? →</Link>
        </div>
      </div>

      <style jsx>{`
        .seller-auth-page {
          min-height: 100vh;
          display: flex;
          background: ${COLORS.cream};
        }

        /* ---------- Brand panel ---------- */
        .brand-panel {
          position: relative;
          flex: 1 1 44%;
          max-width: 560px;
          background: linear-gradient(160deg, ${COLORS.ink} 0%, ${COLORS.forestMid} 100%);
          color: white;
          overflow: hidden;
          display: flex;
        }
        .brand-panel-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 22px 22px;
          mask-image: radial-gradient(circle at 30% 20%, black, transparent 75%);
          opacity: 0.9;
        }
        .brand-panel-inner {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: clamp(28px, 4vw, 56px);
          width: 100%;
        }
        .brand-mark {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          width: fit-content;
        }
        .brand-mark-badge {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: ${COLORS.gold};
          color: ${COLORS.ink};
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 17px;
        }
        .brand-mark-text {
          font-weight: 700;
          font-size: 17px;
          color: white;
        }
        .brand-panel-copy {
          margin-top: clamp(28px, 6vh, 64px);
        }
        .brand-eyebrow {
          display: inline-block;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: ${COLORS.goldSoft};
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.16);
          padding: 5px 12px;
          border-radius: 999px;
          margin-bottom: 18px;
        }
        .brand-panel-copy h1 {
          font-size: clamp(26px, 3vw, 34px);
          font-weight: 700;
          line-height: 1.28;
          margin: 0 0 14px;
        }
        .brand-panel-copy p {
          font-size: 15px;
          line-height: 1.6;
          color: rgba(255,255,255,0.78);
          max-width: 380px;
          margin: 0;
        }
        .trust-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .trust-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: rgba(255,255,255,0.92);
        }
        .trust-icon {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.14);
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${COLORS.goldSoft};
        }

        /* ---------- Form panel ---------- */
        .form-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(20px, 5vw, 48px);
        }
        .form-panel-inner {
          width: 100%;
          max-width: 400px;
        }
        .mobile-back {
          display: none;
          font-size: 13px;
          color: ${COLORS.textMuted};
          margin-bottom: 18px;
        }
        .form-card {
          background: white;
          border: 1px solid ${COLORS.line};
          border-radius: 18px;
          padding: clamp(24px, 3vw, 34px);
          box-shadow: 0 24px 48px -28px rgba(15, 42, 32, 0.28);
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
          box-shadow: 0 2px 6px rgba(15, 42, 32, 0.1);
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
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .field input:focus {
          border-color: ${COLORS.forestMid};
          box-shadow: 0 0 0 3px rgba(31, 91, 65, 0.14);
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
          background: ${COLORS.forestMid};
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(1px);
        }
        .submit-btn:disabled {
          background: #a9c2b7;
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
          color: ${COLORS.forestMid};
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

        @media (max-width: 860px) {
          .seller-auth-page {
            flex-direction: column;
          }
          .brand-panel {
            max-width: none;
            flex: none;
          }
          .brand-panel-inner {
            padding: 24px 22px 32px;
          }
          .brand-panel-copy {
            margin-top: 22px;
          }
          .brand-panel-copy h1 {
            font-size: 22px;
          }
          .trust-list {
            display: none;
          }
          .form-panel {
            padding: 24px 20px 40px;
          }
          .mobile-back {
            display: inline-block;
          }
        }
      `}</style>
    </div>
  )
}
