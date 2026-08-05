'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, signUp, signOut, setAccountType, verifyAccountType, getSession, supabaseFetch, createReferralIfNeeded } from '@/lib/supabase'
import AgreementCheckbox from '@/components/AgreementCheckbox'

// Supabase Auth requires a longer password than a 4-digit PIN, so the PIN is
// deterministically padded into one under the hood. The merchant never sees
// or types anything but their 4-digit PIN.
function pinToPassword(pin) {
  return `sl${pin}pin`
}

const COLORS = {
  ink: '#0a0a0a',
  forest: '#0a0a0a',
  forestMid: '#2a2a2a',
  gold: '#f4a300',
  goldSoft: '#fdf1d9',
  cream: '#faf8f4',
  line: '#e7e2d8',
  textMuted: '#6b7b74',
}

export default function MerchantLoginPage() {
  return (
    <Suspense fallback={null}>
      <MerchantLoginForm />
    </Suspense>
  )
}

function MerchantLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next') || '/merchant/dashboard'
  const refCode = searchParams.get('ref') || ''
  const pkgParam = searchParams.get('pkg') || ''

  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' || pkgParam ? 'signup' : 'login') // 'login' | 'signup'

  // ---------- Login state ----------
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPin, setLoginPin] = useState('')
  const [loginSubmitting, setLoginSubmitting] = useState(false)
  const [loginError, setLoginError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')

    if (!loginEmail.trim() || !loginPin.trim()) {
      setLoginError('Please enter email and PIN')
      return
    }
    if (!/^\d{4}$/.test(loginPin)) {
      setLoginError('PIN must be exactly 4 digits')
      return
    }

    setLoginSubmitting(true)
    try {
      const checkRes = await fetch('/api/login-attempts/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim() }),
      })
      const checkData = await checkRes.json()
      if (checkData.locked) {
        const minutes = Math.ceil(checkData.retryAfterSeconds / 60)
        setLoginError(`Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`)
        setLoginSubmitting(false)
        return
      }

      try {
        await signIn(loginEmail.trim(), pinToPassword(loginPin))
      } catch (signInErr) {
        const recordRes = await fetch('/api/login-attempts/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginEmail.trim(), success: false }),
        })
        const recordData = await recordRes.json()
        if (recordData.locked) {
          const minutes = Math.ceil(recordData.retryAfterSeconds / 60)
          setLoginError(`Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`)
        } else {
          setLoginError(`Incorrect email or PIN. ${recordData.attemptsRemaining} attempt${recordData.attemptsRemaining === 1 ? '' : 's'} remaining.`)
        }
        setLoginSubmitting(false)
        return
      }

      fetch('/api/login-attempts/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), success: true }),
      }).catch(() => {})

      const ok = await verifyAccountType('seller')
      if (!ok) {
        signOut()
        setLoginError('This email is registered as a customer account. Please use the customer login instead.')
        setLoginSubmitting(false)
        return
      }
      router.push(nextUrl)
    } catch (err) {
      console.error(err)
      setLoginError('Incorrect email or PIN, please try again')
      setLoginSubmitting(false)
    }
  }

  // ---------- Signup / registration state ----------
  const [storeName, setStoreName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')

  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpVerified, setOtpVerified] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [otpMessage, setOtpMessage] = useState('')

  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')

  const [registerSubmitting, setRegisterSubmitting] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [agreed, setAgreed] = useState(false)

  const [nameStatus, setNameStatus] = useState('idle') // 'idle' | 'checking' | 'available' | 'taken'

  useEffect(() => {
    const trimmed = storeName.trim()
    if (!trimmed) {
      setNameStatus('idle')
      return
    }
    setNameStatus('checking')
    const timer = setTimeout(async () => {
      try {
        const rows = await supabaseFetch(`shops?select=id&name=ilike.${encodeURIComponent(trimmed)}`)
        setNameStatus(rows && rows.length > 0 ? 'taken' : 'available')
      } catch (e) {
        console.error(e)
        setNameStatus('idle')
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [storeName])

  const handleSendOtp = async () => {
    setOtpMessage('')
    if (!email.trim()) {
      setOtpMessage('Enter your email first')
      return
    }
    setSendingOtp(true)
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), purpose: 'signup' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setOtpMessage(data.error || 'Failed to send code')
      } else {
        setOtpSent(true)
        setOtpMessage('Code sent to your email')
      }
    } catch (e) {
      console.error(e)
      setOtpMessage('Failed to send code')
    }
    setSendingOtp(false)
  }

  const handleVerifyOtp = async () => {
    setOtpMessage('')
    if (!/^\d{6}$/.test(otpCode)) {
      setOtpMessage('Enter the 6-digit code')
      return
    }
    setVerifyingOtp(true)
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: otpCode.trim(), purpose: 'signup' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setOtpMessage(data.error || 'Incorrect code')
      } else {
        setOtpVerified(true)
        setOtpMessage('Email verified ✓')
      }
    } catch (e) {
      console.error(e)
      setOtpMessage('Failed to verify code')
    }
    setVerifyingOtp(false)
  }

  const createShop = async () => {
    const session = getSession()
    const rows = await supabaseFetch('shops', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        name: storeName.trim(),
        description: null,
        location: address.trim() || null,
        owner_id: session.user.id,
        owner_name: ownerName.trim(),
        phone: mobileNumber.trim(),
        category: 'general',
        delivery_charge: 20,
        min_order_amount: 0,
        package_id: null,
        is_active: true,
        ref_code: refCode || null,
      }),
    })
    return Array.isArray(rows) ? rows[0] : rows
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setRegisterError('')

    if (!storeName.trim()) return setRegisterError('Please enter your store name')
    if (nameStatus === 'taken') return setRegisterError('This store name is already taken, please choose another')
    if (!ownerName.trim()) return setRegisterError('Please enter the owner name')
    if (!mobileNumber.trim()) return setRegisterError('Please enter a mobile number')
    if (!/^01\d{9}$/.test(mobileNumber.trim())) return setRegisterError('Enter a valid 11-digit Bangladeshi mobile number starting with 01')
    if (!email.trim()) return setRegisterError('Please enter your email')
    if (!otpVerified) return setRegisterError('Please verify your email with the OTP code first')
    if (!/^\d{4}$/.test(pin)) return setRegisterError('PIN must be exactly 4 digits')
    if (pin !== confirmPin) return setRegisterError('PIN and Confirm PIN do not match')
    if (!agreed) return setRegisterError('Please agree to the Merchant Agreement to continue')

    setRegisterSubmitting(true)
    try {
      await signUp(email.trim(), pinToPassword(pin))
      await setAccountType('seller')

      const shop = await createShop()
      if (shop?.id && refCode) {
        await createReferralIfNeeded(shop.id, refCode)
      }
      router.push('/merchant/dashboard')
    } catch (err) {
      console.error(err)
      const msg = err.message || ''
      if (/already registered|already exists/i.test(msg)) {
        setRegisterError('This email already has an account (as a customer or merchant). Please use a different email to register — you\'ll need to verify it with a new OTP.')
        setOtpSent(false)
        setOtpVerified(false)
        setOtpCode('')
      } else {
        setRegisterError(msg || 'Registration failed, please try again')
      }
      setRegisterSubmitting(false)
    }
  }

  const switchMode = (next) => {
    setMode(next)
    setLoginError('')
    setRegisterError('')
  }

  const inputStyle = {
    width: '100%', padding: '11px 13px', borderRadius: '10px',
    border: `1px solid ${COLORS.line}`, fontSize: '14px', fontFamily: 'inherit',
    background: '#fdfcfa', boxSizing: 'border-box',
  }
  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '600', color: COLORS.forest, marginBottom: '6px' }

  return (
    <div className="merchant-auth-page">
      <div className="hero-bg" />
      <div className="hero-overlay" />

      <Link href="/" className="top-back">← Back to Home</Link>

      <div className="hero-content">
        <h1>Your Shop,<br />At Thousands of Doorsteps</h1>
        <p>Join Cot Lever — sell across Bangladesh and worldwide, <span className="highlight">NO COMMISSION</span>.</p>

        <ul className="pitch-list">
          <li>
            <span className="pitch-icon">🌍</span>
            <div>
              <strong>Sell globally, we handle shipping</strong>
              <span>Cross-border delivery via DHL, EMS &amp; more — you just pack the order</span>
            </div>
          </li>
          <li>
            <span className="pitch-icon">✓</span>
            <div>
              <strong>Reach verified buyers</strong>
              <span>Your shop gets listed to a trusted, growing buyer network</span>
            </div>
          </li>
          <li>
            <span className="pitch-icon">📊</span>
            <div>
              <strong>One dashboard, full control</strong>
              <span>Manage products, orders and B2B/wholesale pricing in one place</span>
            </div>
          </li>
        </ul>
      </div>

      <div className="form-panel">
        <div className="form-card">
          {mode === 'login' ? (
            <>
              <div className="form-heading">
                <h2>Merchant Login</h2>
                <p>Log in to manage your shop</p>
              </div>

              <div className="mode-switch" role="tablist">
                <button type="button" role="tab" aria-selected="true" className="active" onClick={() => switchMode('login')}>Log In</button>
                <button type="button" role="tab" aria-selected="false" onClick={() => switchMode('signup')}>Sign Up</button>
              </div>

              <form onSubmit={handleLogin}>
                <div className="field">
                  <label htmlFor="login-email">Email</label>
                  <input id="login-email" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="merchant@example.com" autoComplete="email" />
                </div>
                <div className="field">
                  <label htmlFor="login-pin">4-digit PIN</label>
                  <input id="login-pin" type="password" inputMode="numeric" value={loginPin} onChange={e => setLoginPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="e.g. 1234" maxLength={4} autoComplete="off" />
                </div>
                <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '14px' }}>
                  <Link href="/merchant/forgot-pin" style={{ fontSize: '12px', color: '#666' }}>Forgot PIN?</Link>
                </div>
                {loginError && <div className="alert alert-error">{loginError}</div>}
                <button type="submit" className="submit-btn" disabled={loginSubmitting}>
                  {loginSubmitting ? 'Please wait...' : 'Log In'}
                </button>
              </form>

              <div className="form-footnote">
                Don't have a shop yet? <button type="button" onClick={() => switchMode('signup')}>Sign Up</button>
              </div>
              <Link href="/login" className="customer-link">Want to log in as a customer? →</Link>
            </>
          ) : (
            <>
              <div className="form-heading">
                <h2>Merchant Registration</h2>
                <p>Open your shop in just a few steps</p>
              </div>

              <div className="mode-switch" role="tablist">
                <button type="button" role="tab" aria-selected="false" onClick={() => switchMode('login')}>Log In</button>
                <button type="button" role="tab" aria-selected="true" className="active" onClick={() => switchMode('signup')}>Sign Up</button>
              </div>

              <form onSubmit={handleRegisterSubmit}>
                <div className="field">
                  <label>Store Name *</label>
                  <input style={inputStyle} value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="e.g. Rahim Store" />
                  {nameStatus === 'checking' && (
                    <div style={{ fontSize: '12px', marginTop: '5px', color: COLORS.textMuted }}>Checking...</div>
                  )}
                  {nameStatus === 'available' && (
                    <div style={{ fontSize: '12px', marginTop: '5px', color: '#1a9d4a', fontWeight: '600' }}>✓ Available</div>
                  )}
                  {nameStatus === 'taken' && (
                    <div style={{ fontSize: '12px', marginTop: '5px', color: '#d32f2f', fontWeight: '600' }}>✗ This name is already taken</div>
                  )}
                </div>
                <div className="field">
                  <label>Owner Name *</label>
                  <input style={inputStyle} value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="e.g. Rahim Uddin" />
                </div>
                <div className="field">
                  <label>Mobile Number *</label>
                  <input
                    style={inputStyle}
                    type="tel"
                    inputMode="numeric"
                    value={mobileNumber}
                    onChange={e => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="e.g. 01XXXXXXXXX"
                    maxLength={11}
                  />
                  {mobileNumber && !/^01\d{9}$/.test(mobileNumber) && (
                    <div style={{ fontSize: '12px', marginTop: '5px', color: '#d32f2f', fontWeight: '600' }}>
                      Enter a valid 11-digit Bangladeshi number starting with 01
                    </div>
                  )}
                </div>

                <div className="field">
                  <label>Email *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      style={{ ...inputStyle, flex: 1 }}
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setOtpSent(false); setOtpVerified(false); setOtpMessage('') }}
                      placeholder="merchant@example.com"
                      disabled={otpVerified}
                    />
                    {!otpVerified && (
                      <button type="button" className="otp-btn" onClick={handleSendOtp} disabled={sendingOtp}>
                        {sendingOtp ? '...' : otpSent ? 'Resend' : 'Send OTP'}
                      </button>
                    )}
                  </div>
                  {otpSent && !otpVerified && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <input
                        style={{ ...inputStyle, flex: 1 }}
                        inputMode="numeric"
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="6-digit code"
                        maxLength={6}
                      />
                      <button type="button" className="otp-btn" onClick={handleVerifyOtp} disabled={verifyingOtp}>
                        {verifyingOtp ? '...' : 'Verify'}
                      </button>
                    </div>
                  )}
                  {otpMessage && (
                    <div style={{ fontSize: '12px', marginTop: '6px', color: otpVerified ? '#0a0a0a' : COLORS.textMuted }}>
                      {otpMessage}
                    </div>
                  )}
                </div>

                <div className="field">
                  <label>Address (optional)</label>
                  <input style={inputStyle} value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. Dhaka, Chattogram, or any city/country" />
                </div>

                <div className="field">
                  <label>Set PIN *</label>
                  <input style={inputStyle} type="password" inputMode="numeric" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="4-digit PIN" maxLength={4} autoComplete="off" />
                </div>
                <div className="field">
                  <label>Confirm PIN *</label>
                  <input style={inputStyle} type="password" inputMode="numeric" value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="Re-enter PIN" maxLength={4} autoComplete="off" />
                </div>

                {registerError && <div className="alert alert-error">{registerError}</div>}

                <div style={{ margin: '4px 0 14px' }}>
                  <AgreementCheckbox type="merchant" checked={agreed} onChange={setAgreed} />
                </div>

                <button type="submit" className="submit-btn" disabled={registerSubmitting}>
                  {registerSubmitting ? 'Please wait...' : 'Create Shop'}
                </button>
              </form>

              <div className="form-footnote">
                Already have an account? <button type="button" onClick={() => switchMode('login')}>Log In</button>
              </div>
              <Link href="/login" className="customer-link">Want to log in as a customer? →</Link>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .merchant-auth-page {
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
        .pitch-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .pitch-list li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .pitch-icon {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        .pitch-list strong {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: white;
          margin-bottom: 2px;
        }
        .pitch-list span {
          display: block;
          font-size: 12.5px;
          line-height: 1.5;
          color: rgba(255,255,255,0.6);
        }
        .form-panel {
          position: relative;
          z-index: 2;
          margin-left: auto;
        }
        .form-card {
          width: min(420px, 92vw);
          max-height: 88vh;
          overflow-y: auto;
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
        }
        .field input:focus {
          outline: none;
          border-color: ${COLORS.gold};
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.14);
          background: white;
        }
        .otp-btn {
          flex-shrink: 0;
          background: ${COLORS.forest};
          color: white;
          border: none;
          border-radius: 10px;
          padding: 0 14px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }
        .otp-btn:disabled {
          background: #a9a9a9;
        }
        .pkg-card {
          border: 1px solid ${COLORS.line};
          border-radius: 10px;
          padding: 12px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .pkg-card.selected {
          border: 2px solid ${COLORS.gold};
          background: #fdf1f0;
        }
        .pkg-name {
          font-size: 13px;
          font-weight: 700;
          color: ${COLORS.forest};
        }
        .pkg-features {
          font-size: 11px;
          color: ${COLORS.textMuted};
          margin-top: 2px;
        }
        .pkg-price {
          font-size: 14px;
          font-weight: 700;
          color: ${COLORS.gold};
          white-space: nowrap;
        }
        .pay-box {
          background: #fdf1f6;
          border: 1px dashed #e2136e;
          border-radius: 8px;
          padding: 14px;
          margin-bottom: 14px;
        }
        .pay-label {
          font-size: 12px;
          color: #888;
          margin-bottom: 6px;
        }
        .pay-number-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .pay-number {
          font-size: 18px;
          font-weight: 700;
          color: #e2136e;
          letter-spacing: 0.5px;
        }
        .copy-btn {
          background: #e2136e;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 600;
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
        }
        .submit-btn:hover:not(:disabled) {
          background: ${COLORS.gold};
        }
        .submit-btn:disabled {
          background: #a9a9a9;
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
        .done-state {
          text-align: center;
        }
        .done-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #f5f5f5;
          color: #0a0a0a;
          font-size: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        @media (max-width: 960px) {
          .merchant-auth-page {
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
