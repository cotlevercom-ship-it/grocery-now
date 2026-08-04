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
      setError('ইমেইল এবং পাসওয়ার্ড দিন')
      return
    }
    setSubmitting(true)
    try {
      const data = await signIn(email.trim(), password)
      const rows = await supabaseFetch(`admin_users?select=id&user_id=eq.${data.user.id}`)
      if (!rows || rows.length === 0) {
        setError('এই একাউন্টের admin অ্যাক্সেস নেই')
        setSubmitting(false)
        return
      }
      router.replace('/admin')
    } catch (err) {
      setError(err.message || 'লগইন ব্যর্থ হয়েছে')
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #163a2c 0%, #2d6a4f 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        background: 'white', borderRadius: '16px', padding: '32px',
        width: '100%', maxWidth: '380px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🧺</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#163a2c' }}>GroceryNow Admin</div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>এডমিন প্যানেলে লগইন করুন</div>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="email" placeholder="ইমেইল" value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%', padding: '12px 14px', marginBottom: '12px',
              borderRadius: '10px', border: '1px solid #ddd', fontSize: '14px'
            }}
          />
          <input
            type="password" placeholder="পাসওয়ার্ড" value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: '100%', padding: '12px 14px', marginBottom: '12px',
              borderRadius: '10px', border: '1px solid #ddd', fontSize: '14px'
            }}
          />
          {error && <div style={{ color: '#c62828', fontSize: '13px', marginBottom: '12px' }}>{error}</div>}
          <button type="submit" disabled={submitting} style={{
            width: '100%',
            background: submitting ? '#ccc' : 'linear-gradient(135deg, #163a2c 0%, #2d6a4f 100%)',
            color: 'white', border: 'none', borderRadius: '10px', padding: '12px',
            fontSize: '14px', fontWeight: '600', cursor: submitting ? 'default' : 'pointer'
          }}>
            {submitting ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
          </button>
          <div style={{ textAlign: 'center', marginTop: '14px' }}>
            <a href="/admin/forgot-password" style={{ fontSize: '12.5px', color: '#888' }}>Forgot password?</a>
          </div>
        </form>
      </div>
    </div>
  )
}
