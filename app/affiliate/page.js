'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'

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

function generateCode(name) {
  const base = (name || '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 4)
    .toUpperCase() || 'AFF'
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${base}${rand}`
}

export default function AffiliatePage() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null) // { referral_code }
  const [copied, setCopied] = useState(false)

  const referralLink = result
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/seller/login?ref=${result.referral_code}`
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
      setError('নাম এবং ফোন নাম্বার দিন')
      return
    }
    setSubmitting(true)
    try {
      const existing = await supabaseFetch(`affiliates?select=*&phone=eq.${encodeURIComponent(phone.trim())}`)
      if (existing && existing.length > 0) {
        setResult(existing[0])
        setSubmitting(false)
        return
      }

      let created = null
      for (let attempt = 0; attempt < 3 && !created; attempt++) {
        try {
          const code = generateCode(name)
          const rows = await supabaseFetch('affiliates', {
            method: 'POST',
            body: JSON.stringify({ name: name.trim(), phone: phone.trim(), referral_code: code }),
          })
          created = Array.isArray(rows) ? rows[0] : rows
        } catch (err) {
          if (attempt === 2) throw err
        }
      }
      setResult(created)
    } catch (err) {
      console.error(err)
      setError('রেজিস্ট্রেশন করতে সমস্যা হয়েছে, আবার চেষ্টা করুন')
    }
    setSubmitting(false)
  }

  return (
    <div className="affiliate-page">
      <div className="brand-panel">
        <div className="brand-panel-pattern" />
        <div className="brand-panel-inner">
          <Link href="/" className="brand-mark">
            <span className="brand-mark-badge">🧺</span>
            <span className="brand-mark-text">GroceryNow</span>
          </Link>
          <div className="brand-panel-copy">
            <span className="brand-eyebrow">অ্যাফিলিয়েট প্রোগ্রাম</span>
            <h1>নতুন সেলার নিয়ে আসুন,<br />বোনাস আয় করুন</h1>
            <p>আপনার লিংক দিয়ে কেউ নতুন দোকান খুলে অ্যাক্টিভ হলেই আপনি একটি ফিক্সড বোনাস পাবেন।</p>
          </div>
          <ul className="how-list">
            <li><span className="how-num">১</span><span>নিচের ফর্মে রেজিস্টার করে নিজের রেফারেল লিংক নিন</span></li>
            <li><span className="how-num">২</span><span>বন্ধু, পরিচিত দোকানদারদের সাথে লিংকটি শেয়ার করুন</span></li>
            <li><span className="how-num">৩</span><span>তাদের দোকান অ্যাক্টিভ হলেই বোনাস আপনার নামে জমা হবে</span></li>
          </ul>
        </div>
      </div>

      <div className="form-panel">
        <div className="form-panel-inner">
          {!result ? (
            <div className="form-card">
              <div className="form-heading">
                <h2>অ্যাফিলিয়েট হিসেবে যোগ দিন</h2>
                <p>নাম ও ফোন নাম্বার দিন, সাথে সাথে আপনার লিংক তৈরি হবে</p>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>নাম</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="আপনার নাম" />
                </div>
                <div className="field">
                  <label>ফোন নাম্বার</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
                </div>
                {error && <div className="alert">{error}</div>}
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'অপেক্ষা করুন...' : 'রেফারেল লিংক নিন'}
                </button>
              </form>
            </div>
          ) : (
            <div className="form-card">
              <div className="form-heading">
                <h2>স্বাগতম, {result.name}!</h2>
                <p>এই লিংকটি শেয়ার করুন — নতুন সেলার এখান থেকে দোকান খুললে বোনাস পাবেন</p>
              </div>
              <div className="code-box">
                <div className="code-text">{referralLink}</div>
                <button type="button" onClick={handleCopy} className="copy-btn">
                  {copied ? 'কপি হয়েছে ✓' : 'কপি করুন'}
                </button>
              </div>
              <div className="note">
                লিংকটি সংরক্ষণ করে রাখুন — পরবর্তীতে এই পেজে আবার আপনার নাম্বার (<b>{result.phone}</b>) দিয়ে এলে একই লিংক ফিরে পাবেন।
              </div>
            </div>
          )}
          <Link href="/" className="back-link">← হোমে ফিরে যান</Link>
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
          display: flex;
          align-items: center;
          justify-content: center;
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
          background: ${COLORS.cream};
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
          color: ${COLORS.textMuted};
          margin-top: 22px;
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
