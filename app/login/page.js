'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, signUp } from '@/lib/supabase'

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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')

    if (!email.trim() || !password.trim()) {
      setError('ইমেইল এবং পাসওয়ার্ড দিন')
      return
    }
    if (password.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হতে হবে')
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'signup') {
        const data = await signUp(email.trim(), password)
        if (!data.access_token) {
          // Email confirmation may be required depending on project settings
          setNotice('অ্যাকাউন্ট তৈরি হয়েছে। ইমেইল ভেরিফাই করার প্রয়োজন হলে, ভেরিফাই করে আবার লগইন করুন।')
          setMode('login')
          setSubmitting(false)
          return
        }
        router.push(nextUrl)
      } else {
        await signIn(email.trim(), password)
        router.push(nextUrl)
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন')
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #163a2c 0%, #f5f5f5 260px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0 16px 40px'
    }}>
      {/* Back link */}
      <div style={{ width: '100%', maxWidth: '420px', padding: '18px 0 0' }}>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '18px', lineHeight: 1 }}>←</span> হোমে ফিরুন
        </Link>
      </div>

      {/* Logo */}
      <div style={{ marginTop: '18px', marginBottom: '28px', textAlign: 'center' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '16px', background: '#f4a300',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
          margin: '0 auto 10px', boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
        }}>🧺</div>
        <div style={{ color: 'white', fontWeight: '700', fontSize: '18px', letterSpacing: '-0.02em' }}>GroceryNow</div>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: '420px', background: 'white', borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.12)', padding: '28px 24px'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '19px', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px' }}>
            {mode === 'login' ? 'লগইন করুন' : 'অ্যাকাউন্ট তৈরি করুন'}
          </div>
          <div style={{ fontSize: '13px', color: '#888' }}>
            {mode === 'login' ? 'আবার স্বাগতম! চালিয়ে যেতে লগইন করুন' : 'কেনাকাটা শুরু করতে একাউন্ট বানান'}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: '#666', fontWeight: '600', display: 'block', marginBottom: '6px' }}>ইমেইল</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="login-input"
            />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', color: '#666', fontWeight: '600', display: 'block', marginBottom: '6px' }}>পাসওয়ার্ড</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="কমপক্ষে ৬ ক্যারেক্টার"
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
              margin: '12px 0 0', padding: '10px 12px', background: '#e8f5e9',
              color: '#1b5e20', borderRadius: '8px', fontSize: '13px'
            }}>{notice}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', marginTop: '18px', background: submitting ? '#a5d6a7' : '#2e7d32',
              color: 'white', padding: '13px', borderRadius: '10px', fontSize: '15px',
              fontWeight: '700', border: 'none', cursor: submitting ? 'default' : 'pointer',
              boxShadow: submitting ? 'none' : '0 4px 12px rgba(46,125,50,0.28)'
            }}>
            {submitting ? 'অপেক্ষা করুন...' : (mode === 'login' ? 'লগইন করুন' : 'অ্যাকাউন্ট তৈরি করুন')}
          </button>

          <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: '#666' }}>
            {mode === 'login' ? (
              <>অ্যাকাউন্ট নাই? <button type="button" onClick={() => { setMode('signup'); setError(''); setNotice('') }} style={{ color: '#2e7d32', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>সাইনআপ করুন</button></>
            ) : (
              <>আগে থেকে অ্যাকাউন্ট আছে? <button type="button" onClick={() => { setMode('login'); setError(''); setNotice('') }} style={{ color: '#2e7d32', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>লগইন করুন</button></>
            )}
          </div>
        </form>
      </div>

      {/* Seller login */}
      <div style={{ width: '100%', maxWidth: '420px', marginTop: '18px' }}>
        <Link href="/seller/login" style={{
          display: 'block', textAlign: 'center', color: '#666',
          padding: '10px', fontSize: '13px', textDecoration: 'none'
        }}>দোকান মালিক? সেলার লগইন →</Link>
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
          border-color: #2e7d32;
          background: white;
        }
      `}</style>
    </div>
  )
}
