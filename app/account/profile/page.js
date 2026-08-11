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
      setError('Name and phone number are required')
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
      setError('Failed to save, please try again')
    }
    setSubmitting(false)
  }

  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#999', fontSize: '14px' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0', paddingBottom: '48px' }}>
      {/* Topbar */}
      <div style={{ background: '#0a0a0a', padding: '16px' }}>
        <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/account">
            <div style={{ color: 'white', fontSize: '21px', lineHeight: 1 }}>←</div>
          </Link>
          <div>
            <div style={{ color: 'white', fontSize: '15.5px', fontWeight: '700' }}>Update Passbook Info</div>
            <div style={{ color: 'rgba(220,38,38,0.9)', fontSize: '11px', marginTop: '1px', letterSpacing: '0.03em' }}>Profile Entry</div>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }}>

        <form onSubmit={handleSubmit}>
          <div style={{
            background: '#fffdf8', margin: '18px 16px 14px', borderRadius: '4px',
            border: '1px solid #e6ded0', padding: '22px 18px 6px'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '11px', color: '#9a9182', display: 'block', marginBottom: '6px', letterSpacing: '0.03em' }}>Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="ledger-input"
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '11px', color: '#9a9182', display: 'block', marginBottom: '6px', letterSpacing: '0.03em' }}>Phone Number *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="ledger-input"
                style={{ fontFamily: '"Courier New", monospace' }}
              />
            </div>
          </div>

          {error && (
            <div style={{
              margin: '0 16px 14px', padding: '11px 13px', background: '#fbe9e4',
              color: '#a6402b', borderRadius: '4px', fontSize: '13px', borderLeft: '3px solid #a6402b'
            }}>{error}</div>
          )}

          {saved && (
            <div style={{
              margin: '0 16px 14px', padding: '11px 13px', background: '#fde8e8',
              color: '#7a1414', borderRadius: '4px', fontSize: '13px', borderLeft: '3px solid #dc2626'
            }}>✓ Profile saved</div>
          )}

          <div style={{ padding: '0 16px' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%', background: submitting ? '#999' : '#0a0a0a', color: 'white',
                padding: '14px', borderRadius: '4px', fontSize: '14.5px', fontWeight: '700',
                border: '1px solid rgba(255,255,255,0.15)', letterSpacing: '0.02em'
              }}>
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>

      </div>

      <style jsx>{`
        .ledger-input {
          width: 100%;
          padding: 2px 2px 8px;
          border: none;
          border-bottom: 1.5px solid #d9cfb8;
          font-size: 15px;
          background: transparent;
          box-sizing: border-box;
          transition: border-color 0.15s;
          color: #1a1a1a;
        }
        .ledger-input:focus {
          outline: none;
          border-bottom: 1.5px solid #dc2626;
        }
        .ledger-input::placeholder {
          color: #c3baa7;
        }
      `}</style>
    </div>
  )
}
