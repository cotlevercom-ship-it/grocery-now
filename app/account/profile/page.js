'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch } from '@/lib/supabase'

export default function ProfilePage() {
  const router = useRouter()
  const [loaded, setLoaded] = useState(false)
  const [userId, setUserId] = useState(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function init() {
      const session = getSession()
      if (!session?.user?.id) {
        router.replace('/login?next=/account/profile')
        return
      }
      setUserId(session.user.id)

      try {
        const profiles = await supabaseFetch(`user_profiles?select=*&id=eq.${session.user.id}`)
        const profile = profiles?.[0]
        if (profile) {
          setName(profile.full_name || '')
          setPhone(profile.phone || '')
        }
      } catch (e) {
        console.error(e)
      }
      setLoaded(true)
    }
    init()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaved(false)

    if (!name.trim() || !phone.trim()) {
      setError('নাম এবং ফোন নম্বর অবশ্যই দিতে হবে')
      return
    }

    setSubmitting(true)
    try {
      await supabaseFetch('user_profiles', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify({
          id: userId,
          full_name: name.trim(),
          phone: phone.trim(),
        }),
      })
      setSaved(true)
    } catch (err) {
      console.error(err)
      setError('সেভ করতে সমস্যা হয়েছে, আবার চেষ্টা করুন')
    }
    setSubmitting(false)
  }

  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#999', fontSize: '14px' }}>লোড হচ্ছে...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', paddingBottom: '40px' }}>
      {/* Topbar */}
      <div style={{
        background: '#2e7d32', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/account">
            <div style={{ color: 'white', fontSize: '22px', lineHeight: 1 }}>←</div>
          </Link>
          <div style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>প্রোফাইল এডিট</div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }}>

      <form onSubmit={handleSubmit}>
        <div style={{
          background: 'white', margin: '16px 16px 14px', borderRadius: '10px',
          border: '1px solid #e0e0e0', padding: '16px'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>নাম *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="আপনার নাম লিখুন"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>ফোন নম্বর *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="০১৭XXXXXXXX"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <div style={{ margin: '0 16px 14px' }}>
          <Link href="/account/addresses" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px',
            padding: '14px 16px', textDecoration: 'none'
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>ডেলিভারি ঠিকানা</div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>ঠিকানা যোগ বা এডিট করতে এখানে যান</div>
            </div>
            <span style={{ color: '#2e7d32', fontSize: '16px' }}>›</span>
          </Link>
        </div>

        {error && (
          <div style={{
            margin: '0 16px 14px', padding: '10px 12px', background: '#ffebee',
            color: '#c62828', borderRadius: '8px', fontSize: '13px'
          }}>{error}</div>
        )}

        {saved && (
          <div style={{
            margin: '0 16px 14px', padding: '10px 12px', background: '#e8f5e9',
            color: '#2e7d32', borderRadius: '8px', fontSize: '13px'
          }}>প্রোফাইল সেভ হয়েছে</div>
        )}

        <div style={{ padding: '0 16px' }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', background: submitting ? '#a5d6a7' : '#2e7d32', color: 'white',
              padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: '600',
              border: 'none'
            }}>
            {submitting ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
          </button>
        </div>
      </form>

      </div>
    </div>
  )
}
