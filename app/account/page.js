'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch, signOut } from '@/lib/supabase'
import { theme } from '@/lib/theme'

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

export default function AccountPage() {
  const router = useRouter()
  const [loaded, setLoaded] = useState(false)
  const [profile, setProfile] = useState(null)
  const [memberProfile, setMemberProfile] = useState(null)
  const [sentRequests, setSentRequests] = useState([])

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
        const memberRows = await supabaseFetch(`member_profiles?select=display_name,skills&user_id=eq.${session.user.id}`)
        setMemberProfile(memberRows?.[0] || null)
      } catch (e) {
        console.error(e)
      }

      try {
        const requests = await supabaseFetch(
          `connection_requests?select=id,to_user_id,status,created_at&from_user_id=eq.${session.user.id}&order=created_at.desc`
        )
        if (requests?.length) {
          const toIds = [...new Set(requests.map(r => r.to_user_id))].join(',')
          const toProfiles = await supabaseFetch(`member_profiles?select=user_id,display_name&user_id=in.(${toIds})`)
          const nameById = Object.fromEntries((toProfiles || []).map(p => [p.user_id, p.display_name]))
          setSentRequests(requests.map(r => ({ ...r, toName: nameById[r.to_user_id] || 'A member' })))
        } else {
          setSentRequests([])
        }
      } catch (e) {
        console.error(e)
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

  const isProfileComplete = !!(memberProfile?.display_name?.trim() && (memberProfile?.skills || []).length > 0)

  const rows = [
    {
      href: '/account/profile',
      icon: '👤',
      title: 'Edit Profile',
      subtitle: 'Name and phone number',
      tag: null,
    },
    {
      href: '/members/new',
      icon: '🤝',
      title: 'Profile',
      subtitle: isProfileComplete ? 'Skills, bio, and more' : 'Add your skills and bio to get discovered',
      tag: isProfileComplete ? null : 'INCOMPLETE',
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: theme.paper, paddingBottom: '48px' }}>
      {/* Passbook cover */}
      <div style={{ background: `linear-gradient(155deg, ${theme.paper} 0%, ${theme.surface} 60%, ${theme.lineSoft} 100%)` }}>
        <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '18px 18px 26px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.8)', fontSize: '13px', textDecoration: 'none', marginBottom: '20px' }}>
            <span style={{ fontSize: '17px', lineHeight: 1 }}>←</span> Back to Home
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '18px' }}>
            <span style={{ fontSize: '13px', letterSpacing: '0.04em', color: theme.brass, fontWeight: '700' }}>COT LEVER</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginLeft: '8px' }}>My Passbook</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link href={`/members/${profile?.id}`} style={{
              width: '54px', height: '54px', borderRadius: '50%', background: theme.brass,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: '700', color: theme.ink, flexShrink: 0,
              border: '2px solid rgba(255,255,255,0.25)', textDecoration: 'none'
            }}>{initial}</Link>
            <div style={{ minWidth: 0 }}>
              <Link href={`/members/${profile?.id}`} style={{
                color: theme.ink, fontSize: '18px', fontWeight: '700', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none', display: 'block'
              }}>
                {profile?.full_name || 'Guest User'}
              </Link>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', marginTop: '2px', fontFamily: '"Courier New", monospace' }}>
                {profile?.phone || 'No phone number added'}
              </div>
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

        {sentRequests.length > 0 && (
          <div style={{
            background: theme.surface, borderRadius: '4px', border: `1px solid ${theme.line}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.25)', overflow: 'hidden', marginBottom: '18px'
          }}>
            <div style={{
              padding: '13px 16px 10px', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase',
              color: theme.brass, fontWeight: '700'
            }}>Connection Requests Sent</div>
            {sentRequests.map((r, i) => (
              <Link key={r.id} href={`/members/${r.to_user_id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '13px', padding: '13px 16px',
                  borderTop: `1px dashed ${theme.line}`
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: '600', color: theme.ink }}>{r.toName}</div>
                    <div style={{ fontSize: '11px', color: theme.inkSoft, marginTop: '2px' }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.03em',
                    color: theme.inkSoft, background: theme.paper, border: `1px solid ${theme.line}`,
                    padding: '3px 9px', borderRadius: '20px', whiteSpace: 'nowrap'
                  }}>{r.status || 'sent'}</div>
                </div>
              </Link>
            ))}
          </div>
        )}

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
