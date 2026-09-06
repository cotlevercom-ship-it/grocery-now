'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, signUp, supabaseFetch } from '@/lib/supabase'
import AgreementCheckbox from '@/components/AgreementCheckbox'
import { accountLightTheme as theme } from '@/lib/accountLightTheme'
import { theme as darkTheme } from '@/lib/theme'

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
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Inline email OTP verification (signup only)
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(cooldown - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const isValidEmail = (val) => /\S+@\S+\.\S+/.test(val)

  const resetOtpState = () => {
    setOtpSent(false)
    setOtpCode('')
    setEmailVerified(false)
    setOtpError('')
  }

  const handleSendOtp = async () => {
    setOtpError('')
    if (!isValidEmail(email.trim())) {
      setOtpError('Enter a valid email first')
      return
    }
    setSendingOtp(true)
    try {
      const checkRes = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const checkData = await checkRes.json()
      if (checkRes.ok && checkData.exists) {
        setOtpError('This email is already registered. Please log in instead.')
        setSendingOtp(false)
        return
      }

      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), purpose: 'signup' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setOtpError(data.error || 'Failed to send code')
      } else {
        setOtpSent(true)
        setOtpCode('')
        setCooldown(30)
      }
    } catch (err) {
      console.error(err)
      setOtpError('Failed to send code')
    }
    setSendingOtp(false)
  }

  const handleVerifyOtp = async (codeValue) => {
    setOtpError('')
    setVerifyingOtp(true)
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: codeValue, purpose: 'signup' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setOtpError(data.error || 'Incorrect code')
      } else {
        setEmailVerified(true)
      }
    } catch (err) {
      console.error(err)
      setOtpError('Verification failed, please try again')
    }
    setVerifyingOtp(false)
  }

  // Auto-verify as soon as 6 digits are entered
  useEffect(() => {
    if (mode === 'signup' && otpSent && !emailVerified && otpCode.length === 6 && !verifyingOtp) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleVerifyOtp(otpCode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpCode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')

    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name')
      return
    }
    if (mode === 'signup' && !/^01[3-9][0-9]{8}$/.test(phone.trim())) {
      setError('Please enter a valid Bangladeshi mobile number (e.g. 01712345678)')
      return
    }
    if (mode === 'signup' && !emailVerified) {
      setError('Please verify your email first')
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
              body: JSON.stringify({ id: data.user.id, full_name: name.trim(), phone: phone.trim() }),
            })
          } catch (profileErr) {
            console.error('profile save failed', profileErr)
          }
        }
        // Email was already verified inline above — account is free to use
        // right away, no payment step.
        router.push('/feed')
      } else {
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

        try {
          await signIn(email.trim(), password)
        } catch (signInErr) {
          fetch('/api/login-attempts/record', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), success: false }),
          }).catch(() => {})
          throw signInErr
        }
        fetch('/api/login-attempts/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), success: true }),
        }).catch(() => {})
        router.push(nextUrl)
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'Something went wrong, please try again')
      setSubmitting(false)
    }
  }

  return (
    <div className="login-shell" style={{
      minHeight: '100dvh',
      '--paper': theme.paper,
      display: 'flex',
      flexDirection: 'column',
      padding: '0 16px 40px'
    }}>
      {/* Mobile-only story panel */}
      <div className="story-mobile" style={{ background: darkTheme.paper }}>
        <div className="story-mobile-eyebrow" style={{ color: '#E3A552' }}>For Bangladeshi founders</div>
        <h1 className="story-mobile-h1" style={{ color: darkTheme.ink }}>
          Every startup begins as <em style={{ color: '#E3A552', fontStyle: 'italic' }}>two people</em> who found each other.
        </h1>
        <div className="spark-signature-mobile">
          <svg width="60" height="24" viewBox="0 0 72 28">
            <path className="spark-path" d="M6,20 C 16,4 30,26 40,10 S 58,2 66,8" stroke="#E3A552" />
            <circle className="spark-node a" cx="6" cy="20" r="4" fill={darkTheme.paper} stroke={darkTheme.ink} />
            <circle className="spark-node b" cx="66" cy="8" r="4" fill={darkTheme.paper} stroke="#E3A552" />
          </svg>
          <div className="spark-caption-mobile" style={{ color: darkTheme.inkSoft }}>
            The idea finds <b style={{ color: darkTheme.ink }}>its missing piece.</b>
          </div>
        </div>
      </div>
      {/* Card */}
      <div className="login-card" style={{
        background: 'rgba(255,255,255,0.22)', borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '19px', fontWeight: '700', color: '#241512', marginBottom: '4px', textShadow: '0 1px 4px rgba(255,255,255,0.55)' }}>
            {mode === 'login' ? 'Log In' : 'Create Account'}
          </div>
          <div style={{ fontSize: '13px', color: '#4A3A35', textShadow: '0 1px 4px rgba(255,255,255,0.55)' }}>
            {mode === 'login' ? 'Welcome back! Log in to continue' : 'Create an account to get started'}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#4A3A35', fontWeight: '600', display: 'block', marginBottom: '6px', textShadow: '0 1px 4px rgba(255,255,255,0.55)' }}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="login-input"
              />
            </div>
          )}

          {mode === 'signup' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#4A3A35', fontWeight: '600', display: 'block', marginBottom: '6px', textShadow: '0 1px 4px rgba(255,255,255,0.55)' }}>Mobile Number</label>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="01712345678"
                maxLength={11}
                className="login-input"
              />
            </div>
          )}

          <div style={{ marginBottom: mode === 'signup' ? '10px' : '16px' }}>
            <label style={{ fontSize: '12px', color: '#4A3A35', fontWeight: '600', display: 'block', marginBottom: '6px', textShadow: '0 1px 4px rgba(255,255,255,0.55)' }}>{mode === 'signup' ? 'Business Email' : 'Email'}</label>

            {mode === 'signup' ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); resetOtpState() }}
                  placeholder="Enter your business e-mail"
                  className="login-input"
                  disabled={otpSent}
                  style={otpSent ? { opacity: 0.6 } : undefined}
                />
                {emailVerified ? (
                  <div style={{
                    flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '0 14px', borderRadius: '10px', background: theme.signalSoft,
                    color: theme.signal, fontSize: '12.5px', fontWeight: '700', whiteSpace: 'nowrap'
                  }}>✓ Verified</div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || (otpSent && cooldown > 0)}
                    style={{
                      flexShrink: 0, padding: '0 16px', borderRadius: '10px', border: 'none',
                      background: (sendingOtp || (otpSent && cooldown > 0)) ? theme.line : theme.brass,
                      color: 'white', fontSize: '12.5px', fontWeight: '700', whiteSpace: 'nowrap',
                      cursor: (sendingOtp || (otpSent && cooldown > 0)) ? 'default' : 'pointer'
                    }}
                  >
                    {sendingOtp ? 'Sending...' : otpSent ? (cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend OTP') : 'Send OTP'}
                  </button>
                )}
              </div>
            ) : (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="login-input"
              />
            )}

            {mode === 'signup' && !otpSent && (
              <div style={{ fontSize: '11.5px', color: '#4A3A35', marginTop: '6px', textShadow: '0 1px 4px rgba(255,255,255,0.55)' }}>
                This will be the contact email other founders see on your profile.
              </div>
            )}

            {mode === 'signup' && otpSent && !emailVerified && (
              <div style={{ marginTop: '10px' }}>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit code"
                  autoFocus
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '10px', border: `1.5px solid ${theme.line}`,
                    fontSize: '18px', fontWeight: '700', textAlign: 'center', letterSpacing: '6px',
                    boxSizing: 'border-box', background: theme.paper, color: theme.ink
                  }}
                />
                <div style={{ fontSize: '11.5px', color: '#4A3A35', marginTop: '6px', textAlign: 'center', textShadow: '0 1px 4px rgba(255,255,255,0.55)' }}>
                  {verifyingOtp ? 'Verifying...' : `Code sent to ${email.trim()}`}
                </div>
              </div>
            )}

            {otpError && (
              <div style={{ fontSize: '12px', color: theme.danger, marginTop: '6px' }}>{otpError}</div>
            )}
          </div>

          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', color: '#4A3A35', fontWeight: '600', textShadow: '0 1px 4px rgba(255,255,255,0.55)' }}>Password</label>
              {mode === 'login' && (
                <Link href="/forgot-password" style={{ fontSize: '12px', color: theme.brass, textDecoration: 'underline' }}>
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
              margin: '12px 0 0', padding: '10px 12px', background: theme.dangerSoft,
              color: theme.danger, borderRadius: '8px', fontSize: '13px'
            }}>{error}</div>
          )}
          {notice && (
            <div style={{
              margin: '12px 0 0', padding: '10px 12px', background: theme.lineSoft,
              color: theme.ink, borderRadius: '8px', fontSize: '13px'
            }}>{notice}</div>
          )}

          {mode === 'signup' && (
            <div style={{ marginTop: '16px' }}>
              <AgreementCheckbox type="customer" checked={agreed} onChange={setAgreed} accent={theme.brass} />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || (mode === 'signup' && !emailVerified)}
            style={{
              width: '100%', marginTop: '18px',
              background: (submitting || (mode === 'signup' && !emailVerified)) ? theme.line : theme.brass,
              color: 'white', padding: '13px', borderRadius: '10px', fontSize: '15px',
              fontWeight: '700', border: 'none', cursor: (submitting || (mode === 'signup' && !emailVerified)) ? 'default' : 'pointer',
              boxShadow: submitting ? 'none' : '0 4px 14px rgba(179,55,42,0.35)'
            }}>
            {submitting ? 'Please wait...' : (mode === 'login' ? 'Log In' : 'Create Account')}
          </button>

          <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: '#4A3A35', textShadow: '0 1px 4px rgba(255,255,255,0.55)' }}>
            {mode === 'login' ? (
              <>Don&apos;t have an account? <button type="button" onClick={() => { setMode('signup'); setError(''); setNotice(''); resetOtpState() }} style={{ color: theme.brass, fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign Up</button></>
            ) : (
              <>Already have an account? <button type="button" onClick={() => { setMode('login'); setError(''); setNotice(''); resetOtpState() }} style={{ color: theme.brass, fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Log In</button></>
            )}
          </div>
        </form>
      </div>

      <style jsx>{`
        .login-shell {
          align-items: center;
          background: var(--paper, #fff);
          min-height: 100dvh;
        }
        .story-mobile {
          display: block;
          margin: 0 -16px 0;
          padding: 40px 24px 30px;
        }
        .story-mobile-eyebrow {
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 14px;
        }
        .story-mobile-h1 {
          font-size: 24px;
          line-height: 1.25;
          font-weight: 600;
          margin: 0 0 20px;
          max-width: 320px;
        }
        .spark-signature-mobile {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .spark-path {
          stroke-width: 1.6;
          fill: none;
          stroke-linecap: round;
          stroke-dasharray: 220;
          stroke-dashoffset: 220;
          animation: sparkDraw 1.4s ease-out 0.2s forwards;
        }
        .spark-node {
          stroke-width: 1.4;
          opacity: 0;
          animation: sparkPop 0.5s ease-out forwards;
        }
        .spark-node.a { animation-delay: 0.1s; }
        .spark-node.b { animation-delay: 1.3s; }
        @keyframes sparkDraw { to { stroke-dashoffset: 0; } }
        @keyframes sparkPop { from { opacity: 0; transform: scale(0.4); } to { opacity: 1; transform: scale(1); } }
        .spark-caption-mobile {
          font-size: 11.5px;
          line-height: 1.5;
        }
        @media (min-width: 900px) {
          .login-shell {
            align-items: center;
            background: linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.08) 100%), url('/marketing/login-bg.png') center / cover no-repeat, var(--paper, #fff);
          }
          .story-mobile {
            display: none;
          }
        }
        .login-card {
          width: min(82vw, 300px);
          padding: 16px 14px;
          margin-top: 8px;
        }
        @media (min-width: 900px) {
          .login-card {
            width: min(92vw, 420px);
            padding: 28px 24px;
            margin-top: 32px;
          }
        }
        .login-input {
          width: 100%;
          padding: 9px 12px;
          border-radius: 10px;
          border: 1.5px solid ${theme.line};
          font-size: 13px;
          box-sizing: border-box;
          background: rgba(255,255,255,0.5);
          color: ${theme.ink};
          transition: border-color 0.15s, background 0.15s;
        }
        @media (min-width: 900px) {
          .login-input {
            padding: 12px 14px;
            font-size: 14px;
          }
        }
        .login-input::placeholder {
          color: #6B5650;
        }
        .login-input:focus {
          outline: none;
          border-color: ${theme.brass};
          background: rgba(255,255,255,0.5);
        }
      `}</style>
    </div>
  )
}
