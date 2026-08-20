'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch, signOut } from '@/lib/supabase'
import { accountLightTheme as theme } from '@/lib/accountLightTheme'

function ZigzagEdge({ fill }) {
  return (
    <svg viewBox="0 0 320 14" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '14px' }}>
      <path
        d="M0,0 L20,14 L40,0 L60,14 L80,0 L100,14 L120,0 L140,14 L160,0 L180,14 L200,0 L220,14 L240,0 L260,14 L280,0 L300,14 L320,0 L320,14 L0,14 Z"
        fill={fill}
      />
    </svg>
  )
}

function isFilled(v) {
  if (Array.isArray(v)) return v.length > 0
  if (v === null || v === undefined) return false
  return String(v).trim().length > 0
}

export default function AccountPage() {
  const router = useRouter()
  const [loaded, setLoaded] = useState(false)
  const [profile, setProfile] = useState(null)
  const [memberProfile, setMemberProfile] = useState(null)

  const handleLogout = () => {
    signOut()
    router.push('/')
  }

  useEffect(() => {
    async function init() {
      const session = getSession()
      if (!session?.user?.id) {
        router.replace('/login?next=/account')
        return
      }

      try {
        const profiles = await supabaseFetch(`user_profiles?select=*&id=eq.${session.user.id}`)
        setProfile(profiles?.[0] || { id: session.user.id, full_name: '', phone: '' })
      } catch (e) {
        console.error(e)
        setProfile({ id: session.user.id, full_name: '', phone: '' })
      }

      try {
        const members = await supabaseFetch(
          `member_profiles?select=role_title,experience,location,gender,age,interests,skills,languages&user_id=eq.${session.user.id}`
        )
        setMemberProfile(members?.[0] || {})
      } catch (e) {
        console.error(e)
        setMemberProfile({})
      }

      setLoaded(true)
    }
    init()
  }, [router])

  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', background: theme.paper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: theme.inkSoft, fontSize: '14px' }}>Loading...</div>
      </div>
    )
  }

  const initial = (profile?.full_name || '?').trim().charAt(0).toUpperCase()

  const mp = memberProfile || {}
  const basicFields = [profile?.phone, mp.location, mp.gender, mp.age]
  const professionFields = [mp.role_title, mp.experience, mp.interests, mp.skills, mp.languages]
  const basicFilled = basicFields.filter(isFilled).length
  const professionFilled = professionFields.filter(isFilled).length
  const totalFields = basicFields.length + professionFields.length
  const totalFilled = basicFilled + professionFilled
  const completionPct = Math.round((totalFilled / totalFields) * 100)

  const rows = [
    {
      href: '/account/basic-info',
      icon: '🧾',
      title: 'Basic Info',
      subtitle: 'Mobile number, location, gender, age',
      tag: null,
      filled: basicFilled,
      total: basicFields.length,
    },
    {
      href: '/account/profession',
      icon: '💼',
      title: 'Profession',
      subtitle: 'Job, experience, interests, skills, languages',
      tag: null,
      filled: professionFilled,
      total: professionFields.length,
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: theme.paper, paddingBottom: '48px' }}>
      {/* Passbook cover */}
      <div style={{ background: `linear-gradient(155deg, ${theme.paper} 0%, ${theme.surface} 60%, ${theme.lineSoft} 100%)` }}>
        <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '18px 18px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link href={`/members/${profile?.id}`} style={{
              width: '54px', height: '54px', borderRadius: '50%', background: theme.brass,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: '700', color: '#FFFFFF', flexShrink: 0,
              border: '2px solid rgba(255,255,255,0.25)', textDecoration: 'none'
            }}>{initial}</Link>
            <div style={{ minWidth: 0, flex: 1 }}>
              <Link href={`/members/${profile?.id}`} style={{
                color: theme.ink, fontSize: '18px', fontWeight: '700', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none', display: 'block'
              }}>
                {profile?.full_name || 'Guest User'}
              </Link>
            </div>
          </div>

          {/* Profile completion meter */}
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: '700', color: theme.inkSoft, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                Profile Completion
              </span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: theme.brass }}>
                {completionPct}%
              </span>
            </div>
            <div style={{
              width: '100%', height: '7px', borderRadius: '20px',
              background: 'rgba(255,255,255,0.18)', overflow: 'hidden'
            }}>
              <div style={{
                width: `${completionPct}%`, height: '100%', borderRadius: '20px',
                background: theme.brass, transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        </div>
        <ZigzagEdge fill={theme.paper} />
      </div>

      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '18px 16px 0' }}>

        {/* Ledger entries */}
        <div style={{
          background: theme.surface, borderRadius: '4px', border: `1px solid ${theme.line}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)', overflow: 'hidden', marginBottom: '18px'
        }}>
          {rows.map((row, i) => (
            <Link key={row.href} href={row.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '13px', padding: '15px 16px',
                borderBottom: i < rows.length - 1 ? `1px dashed ${theme.line}` : 'none'
              }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '8px', background: theme.lineSoft,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0
                }}>{row.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: theme.ink }}>{row.title}</div>
                  <div style={{ fontSize: '11.5px', color: theme.inkSoft, marginTop: '2px' }}>{row.subtitle}</div>
                </div>
                <div style={{
                  fontSize: '10.5px', fontWeight: '700', color: row.filled === row.total ? theme.brass : theme.inkSoft,
                  background: theme.paper, border: `1px solid ${theme.line}`,
                  padding: '3px 9px', borderRadius: '20px', whiteSpace: 'nowrap'
                }}>{row.filled}/{row.total}</div>
                {row.tag && (
                  <div style={{
                    fontSize: '10.5px', fontWeight: '700', color: theme.danger, background: theme.dangerSoft,
                    padding: '3px 8px', borderRadius: '20px', whiteSpace: 'nowrap'
                  }}>{row.tag}</div>
                )}
                <span style={{ color: theme.inkSoft, fontSize: '15px' }}>›</span>
              </div>
            </Link>
          ))}
        </div>

        <button onClick={handleLogout} style={{
          display: 'block', width: '100%', textAlign: 'center', background: 'transparent',
          color: theme.danger, padding: '13px', borderRadius: '4px', fontSize: '13.5px',
          fontWeight: '700', border: `1.5px dashed ${theme.danger}`, cursor: 'pointer',
          letterSpacing: '0.02em'
        }}>Log Out</button>
      </div>
    </div>
  )
}
