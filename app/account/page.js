'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch, signOut } from '@/lib/supabase'

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

      setLoaded(true)
    }
    init()
  }, [router])

  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#999', fontSize: '14px' }}>Loading...</div>
      </div>
    )
  }

  const initial = (profile?.full_name || '?').trim().charAt(0).toUpperCase()

  const rows = [
    {
      href: '/members/new',
      icon: '📋',
      title: 'My Co-founder Profile',
      subtitle: 'Edit what other founders see about you',
      tag: null,
    },
    {
      href: '/account/profile',
      icon: '👤',
      title: 'Edit Profile',
      subtitle: 'Name and phone number',
      tag: null,
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0', paddingBottom: '48px' }}>
      {/* Passbook cover */}
      <div style={{ background: 'linear-gradient(155deg, #0a0a0a 0%, #1a1a1a 60%, #262626 100%)' }}>
        <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '18px 18px 26px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.8)', fontSize: '13px', textDecoration: 'none', marginBottom: '20px' }}>
            <span style={{ fontSize: '17px', lineHeight: 1 }}>←</span> Back to Home
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '18px' }}>
            <span style={{ fontSize: '13px', letterSpacing: '0.04em', color: 'rgba(220,38,38,0.9)', fontWeight: '700' }}>COT LEVER</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginLeft: '8px' }}>My Passbook</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '54px', height: '54px', borderRadius: '50%', background: '#dc2626',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: '700', color: 'white', flexShrink: 0,
              border: '2px solid rgba(255,255,255,0.25)'
            }}>{initial}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: 'white', fontSize: '18px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.full_name || 'Guest User'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', marginTop: '2px', fontFamily: '"Courier New", monospace' }}>
                {profile?.phone || 'No phone number added'}
              </div>
            </div>
          </div>
        </div>
        <ZigzagEdge fill="#f5f5f0" />
      </div>

      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '18px 16px 0' }}>

        {/* Ledger entries */}
        <div style={{
          background: '#fffdf8', borderRadius: '4px', border: '1px solid #e6ded0',
          boxShadow: '0 1px 3px rgba(22,58,44,0.05)', overflow: 'hidden', marginBottom: '18px'
        }}>
          {rows.map((row, i) => (
            <Link key={row.href} href={row.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '13px', padding: '15px 16px',
                borderBottom: i < rows.length - 1 ? '1px dashed #e6ded0' : 'none'
              }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '8px', background: '#f2ede0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0
                }}>{row.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>{row.title}</div>
                  <div style={{ fontSize: '11.5px', color: '#9a9182', marginTop: '2px' }}>{row.subtitle}</div>
                </div>
                {row.tag && (
                  <div style={{
                    fontSize: '10.5px', fontWeight: '700', color: '#b91c1c', background: '#fde8e8',
                    padding: '3px 8px', borderRadius: '20px', whiteSpace: 'nowrap'
                  }}>{row.tag}</div>
                )}
                <span style={{ color: '#cabfa9', fontSize: '15px' }}>›</span>
              </div>
            </Link>
          ))}
        </div>

        <button onClick={handleLogout} style={{
          display: 'block', width: '100%', textAlign: 'center', background: 'transparent',
          color: '#a6402b', padding: '13px', borderRadius: '4px', fontSize: '13.5px',
          fontWeight: '700', border: '1.5px dashed #d9a793', cursor: 'pointer',
          letterSpacing: '0.02em'
        }}>Log Out</button>
      </div>
    </div>
  )
}
