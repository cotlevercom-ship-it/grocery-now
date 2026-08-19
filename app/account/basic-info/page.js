'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch } from '@/lib/supabase'
import { accountLightTheme as theme } from '@/lib/accountLightTheme'

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say']

export default function BasicInfoPage() {
  const router = useRouter()
  const [loaded, setLoaded] = useState(false)
  const [userId, setUserId] = useState(null)
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function init() {
      const session = getSession()
      if (!session?.user?.id) {
        router.replace('/login?next=/account/basic-info')
        return
      }
      setUserId(session.user.id)

      try {
        const [userRows, memberRows] = await Promise.all([
          supabaseFetch(`user_profiles?select=phone&id=eq.${session.user.id}`),
          supabaseFetch(`member_profiles?select=location,gender,age&user_id=eq.${session.user.id}`),
        ])
        setPhone(userRows?.[0]?.phone || '')
        setLocation(memberRows?.[0]?.location || '')
        setGender(memberRows?.[0]?.gender || '')
        setAge(memberRows?.[0]?.age != null ? String(memberRows[0].age) : '')
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

    let ageValue = null
    if (age.trim()) {
      const n = parseInt(age, 10)
      if (Number.isNaN(n) || n < 16 || n > 100) {
        setError('Age must be between 16 and 100')
        return
      }
      ageValue = n
    }

    setSubmitting(true)
    try {
      await Promise.all([
        supabaseFetch(`user_profiles?id=eq.${userId}`, {
          method: 'PATCH',
          body: JSON.stringify({ phone: phone.trim() || null }),
        }),
        supabaseFetch(`member_profiles?user_id=eq.${userId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            location: location.trim() || null,
            gender: gender || null,
            age: ageValue,
            updated_at: new Date().toISOString(),
          }),
        }),
      ])
      setSaved(true)
    } catch (err) {
      console.error(err)
      setError('Failed to save, please try again')
    }
    setSubmitting(false)
  }

  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', background: theme.paper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: theme.inkSoft, fontSize: '14px' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.paper, paddingBottom: '48px' }}>
      {/* Topbar */}
      <div style={{ background: theme.surface, padding: '16px', borderBottom: `1px solid ${theme.line}` }}>
        <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/account">
            <div style={{ color: theme.ink, fontSize: '21px', lineHeight: 1 }}>←</div>
          </Link>
          <div>
            <div style={{ color: theme.ink, fontSize: '15.5px', fontWeight: '700' }}>Basic Info</div>
            <div style={{ color: theme.brass, fontSize: '11px', marginTop: '1px', letterSpacing: '0.03em' }}>Update Passbook Info</div>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }}>

        <form onSubmit={handleSubmit}>
          <div style={{
            background: theme.surface, margin: '18px 16px 14px', borderRadius: '4px',
            border: `1px solid ${theme.line}`, padding: '22px 18px 6px'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '11px', color: theme.inkSoft, display: 'block', marginBottom: '6px', letterSpacing: '0.03em' }}>Mobile Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="ledger-input"
                style={{ fontFamily: theme.fontMono }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '11px', color: theme.inkSoft, display: 'block', marginBottom: '6px', letterSpacing: '0.03em' }}>Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Dhaka"
                className="ledger-input"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '11px', color: theme.inkSoft, display: 'block', marginBottom: '6px', letterSpacing: '0.03em' }}>Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="ledger-input ledger-select">
                <option value="">Select</option>
                {GENDER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '11px', color: theme.inkSoft, display: 'block', marginBottom: '6px', letterSpacing: '0.03em' }}>Age</label>
              <input
                type="number"
                inputMode="numeric"
                min="16"
                max="100"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
                className="ledger-input"
              />
            </div>
          </div>

          {error && (
            <div style={{
              margin: '0 16px 14px', padding: '11px 13px', background: theme.dangerSoft,
              color: theme.danger, borderRadius: '4px', fontSize: '13px', borderLeft: `3px solid ${theme.danger}`
            }}>{error}</div>
          )}

          {saved && (
            <div style={{
              margin: '0 16px 14px', padding: '11px 13px', background: theme.signalSoft,
              color: theme.signal, borderRadius: '4px', fontSize: '13px', borderLeft: `3px solid ${theme.signal}`
            }}>✓ Saved</div>
          )}

          <div style={{ padding: '0 16px' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%', background: submitting ? theme.line : theme.brass, color: '#FFFFFF',
                padding: '14px', borderRadius: '4px', fontSize: '14.5px', fontWeight: '700',
                border: 'none', letterSpacing: '0.02em'
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
          border-bottom: 1.5px solid ${theme.line};
          font-size: 15px;
          background: transparent;
          box-sizing: border-box;
          transition: border-color 0.15s;
          color: ${theme.ink};
        }
        .ledger-select {
          padding-bottom: 6px;
        }
        .ledger-input:focus {
          outline: none;
          border-bottom: 1.5px solid ${theme.brass};
        }
        .ledger-input::placeholder {
          color: ${theme.inkSoft};
        }
      `}</style>
    </div>
  )
}
