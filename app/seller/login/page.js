'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, signUp } from '@/lib/supabase'

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
  const nextUrl = searchParams.get('next') || '/seller'

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
          setNotice('অ্যাকাউন্ট তৈরি হয়েছে। ইমেইল ভেরিফাই করার প্রয়োজন হলে, ভেরিফাই করে আবার লগইন করুন।')
          setMode('login')
          setSubmitting(false)
          return
        }
        // New seller account -> go create their shop
        router.push('/seller/create')
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
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Topbar */}
      <div style={{
        background: 'linear-gradient(135deg, #163a2c 0%, #2d6a4f 100%)', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <Link href="/">
          <div style={{ color: 'white', fontSize: '22px', lineHeight: 1 }}>←</div>
        </Link>
        <div style={{ color: 'white', fontSize: '16px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🏪</span>
          {mode === 'login' ? 'সেলার লগইন' : 'সেলার অ্যাকাউন্ট তৈরি করুন'}
        </div>
      </div>

      <div style={{ padding: '20px 16px 0', textAlign: 'center', color: '#666', fontSize: '13px' }}>
        নিজের দোকান খুলতে বা ম্যানেজ করতে এখানে লগইন করুন
      </div>

      <form onSubmit={handleSubmit} style={{
        background: 'white', margin: '16px', borderRadius: '10px',
        border: '1px solid #e0e0e0', padding: '20px'
      }}>
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>ইমেইল</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seller@example.com"
            style={{
              width: '100%', padding: '10px 12px', borderRadius: '8px',
              border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>পাসওয়ার্ড</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="কমপক্ষে ৬ ক্যারেক্টার"
            style={{
              width: '100%', padding: '10px 12px', borderRadius: '8px',
              border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
            }}
          />
        </div>

        {error && (
          <div style={{
            margin: '10px 0', padding: '10px 12px', background: '#ffebee',
            color: '#c62828', borderRadius: '8px', fontSize: '13px'
          }}>{error}</div>
        )}
        {notice && (
          <div style={{
            margin: '10px 0', padding: '10px 12px', background: '#e8f5e9',
            color: '#1b5e20', borderRadius: '8px', fontSize: '13px'
          }}>{notice}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%', marginTop: '10px', background: submitting ? '#a5d6a7' : '#163a2c',
            color: 'white', padding: '12px', borderRadius: '10px', fontSize: '14px',
            fontWeight: '600', border: 'none'
          }}>
          {submitting ? 'অপেক্ষা করুন...' : (mode === 'login' ? 'লগইন করুন' : 'সেলার অ্যাকাউন্ট তৈরি করুন')}
        </button>

        <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '13px', color: '#666' }}>
          {mode === 'login' ? (
            <>দোকান নাই এখনো? <button type="button" onClick={() => { setMode('signup'); setError(''); setNotice('') }} style={{ color: '#163a2c', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>সেলার হিসেবে সাইনআপ করুন</button></>
          ) : (
            <>আগে থেকে সেলার অ্যাকাউন্ট আছে? <button type="button" onClick={() => { setMode('login'); setError(''); setNotice('') }} style={{ color: '#163a2c', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>লগইন করুন</button></>
          )}
        </div>
      </form>

      <div style={{ padding: '0 16px 20px' }}>
        <Link href="/login" style={{
          display: 'block', textAlign: 'center', color: '#888',
          padding: '10px', fontSize: '13px'
        }}>কাস্টমার হিসেবে লগইন করতে চান? →</Link>
      </div>
    </div>
  )
}
