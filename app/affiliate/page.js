'use client'
import { useState } from 'react'
import Link from 'next/link'
import { hashPin } from '@/lib/supabase'
import AgreementCheckbox from '@/components/AgreementCheckbox'

const COLORS = {
  ink: '#000000',
  forest: '#000000',
  forestMid: '#2a2a2a',
  gold: '#f4a300',
  goldSoft: '#fdf1d9',
  cream: '#000000',
  line: '#e7e2d8',
  textMuted: '#6b7b74',
}

export default function AffiliatePage() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null) // { referral_code }
  const [copied, setCopied] = useState(false)

  const referralLink = result
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/merchant/login?ref=${result.referral_code}`
    : ''

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim() || !phone.trim()) {
      setError('Please enter your name and phone number')
      return
    }
    if (!/^\d{4}$/.test(pin)) {
      setError('Enter a 4-digit PIN (numbers only)')
      return
    }
    if (!agreed) {
      setError('Please agree to the Affiliate Agreement to continue')
      return
    }
    setSubmitting(true)
    try {
      const pinHash = await hashPin(pin)
      const res = await fetch('/api/affiliate/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), pinHash }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registration failed, please try again')
        setSubmitting(false)
        return
      }
      setResult(data)
    } catch (err) {
      console.error(err)
      setError('Registration failed, please try again')
    }
    setSubmitting(false)
  }

  return (
    <div className="affiliate-page">
      <div className="brand-panel">
        <div className="brand-panel-pattern" />
        <div className="brand-panel-inner">
          <div className="brand-panel-copy">
            <h1>Bring in new merchants,<br />earn a bonus</h1>
            <p>Earn a fixed bonus whenever someone opens a new store using your link and it becomes active.</p>
          </div>
          <ul className="how-list">
            <li><span className="how-num">1</span><span>Register in the form below to get your referral link</span></li>
            <li><span className="how-num">2</span><span>Share the link with friends and shop owners you know</span></li>
            <li><span className="how-num">3</span><span>Once their store becomes active, the bonus is credited to you</span></li>
          </ul>
        </div>
      </div>

      <div className="form-panel">
        <div className="form-panel-inner">
          {!result ? (
            <div className="form-card">
              <div className="form-heading">
                <h2>Join as an Affiliate</h2>
                <p>Enter your name and phone number to get your link instantly</p>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="field">
                  <label>Phone Number</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
                </div>
                <div className="field">
                  <label>4-digit PIN (for dashboard login)</label>
                  <input
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="e.g. 1234"
                    inputMode="numeric"
                    maxLength={4}
                    type="password"
                  />
                </div>
                {error && <div className="alert">{error}</div>}
                <div style={{ margin: '4px 0 14px' }}>
                  <AgreementCheckbox type="affiliate" checked={agreed} onChange={setAgreed} />
                </div>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Please wait...' : 'Get Referral Link'}
                </button>
              </form>
            </div>
          ) : (
            <div className="form-card">
              <div className="form-heading">
                <h2>Welcome, {result.name}!</h2>
                <p>Share this link — you'll earn a bonus when a new merchant opens a store through it</p>
              </div>
              <div className="code-box">
                <div className="code-text">{referralLink}</div>
                <button type="button" onClick={handleCopy} className="copy-btn">
                  {copied ? 'Copied ✓' : 'Copy'}
                </button>
              </div>
              <div className="note">
                Save this link — if you return to this page later with your number and PIN, you'll get the same link back.
              </div>
              <Link href="/affiliate/dashboard" className="dashboard-link">View My Earnings Dashboard →</Link>
            </div>
          )}
          <Link href="/" className="back-link">← Back to Home</Link>
        </div>
      </div>

      <style jsx>{`
        .affiliate-page {
          min-height: 100vh;
          display: flex;
          background: ${COLORS.cream};
        }
        .brand-panel {
          position: relative;
          flex: 1 1 46%;
          max-width: 580px;
          background: #000000;
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
          font-size: clamp(24px, 3vw, 32px);
          font-weight: 700;
          line-height: 1.3;
          margin: 0 0 14px;
        }
        .brand-panel-copy p {
          font-size: 15px;
          line-height: 1.6;
          color: rgba(255,255,255,0.78);
          max-width: 380px;
          margin: 0;
        }
        .how-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .how-list li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 13.5px;
          line-height: 1.5;
          color: rgba(255,255,255,0.9);
        }
        .how-num {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: ${COLORS.goldSoft};
        }

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
        .form-card {
          background: white;
          border: 1px solid ${COLORS.line};
          border-radius: 18px;
          padding: clamp(24px, 3vw, 34px);
          box-shadow: 0 24px 48px -28px rgba(15, 42, 32, 0.28);
        }
        .form-heading h2 {
          font-size: 20px;
          font-weight: 700;
          color: ${COLORS.forest};
          margin: 0 0 4px;
        }
        .form-heading p {
          font-size: 13px;
          color: ${COLORS.textMuted};
          margin: 0 0 22px;
          line-height: 1.5;
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
          border-color: ${COLORS.forestMid};
          box-shadow: 0 0 0 3px rgba(31, 91, 65, 0.14);
          background: white;
        }
        .alert {
          font-size: 13px;
          padding: 10px 12px;
          border-radius: 8px;
          margin-bottom: 14px;
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
        .submit-btn:disabled {
          background: #a9c2b7;
        }
        .code-box {
          background: #faf8f4;
          border: 1px dashed ${COLORS.gold};
          border-radius: 10px;
          padding: 14px;
          margin-bottom: 14px;
        }
        .code-text {
          font-size: 13px;
          color: ${COLORS.forest};
          word-break: break-all;
          margin-bottom: 10px;
        }
        .copy-btn {
          width: 100%;
          background: ${COLORS.gold};
          color: ${COLORS.ink};
          border: none;
          border-radius: 8px;
          padding: 10px;
          font-size: 13px;
          font-weight: 700;
        }
        .note {
          font-size: 12px;
          color: ${COLORS.textMuted};
          line-height: 1.6;
        }
        .back-link {
          display: block;
          text-align: center;
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          margin-top: 22px;
        }
        .dashboard-link {
          display: block;
          text-align: center;
          font-size: 13px;
          font-weight: 700;
          color: ${COLORS.forestMid};
          margin-top: 16px;
        }

        @media (max-width: 860px) {
          .affiliate-page {
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
          .how-list {
            display: none;
          }
          .form-panel {
            padding: 24px 20px 40px;
          }
        }
      `}</style>
    </div>
  )
}
