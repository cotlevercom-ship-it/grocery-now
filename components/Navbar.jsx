'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getSession } from '@/lib/supabase'
import Logo from './Logo'

export default function Navbar() {
  const [session, setSession] = useState(null)
  const pathname = usePathname()
  const isAdminArea = pathname?.startsWith('/admin')
  const isHome = pathname === '/'

  useEffect(() => {
    setSession(getSession())
    const onAuthChanged = () => setSession(getSession())
    window.addEventListener('auth-changed', onAuthChanged)
    window.addEventListener('storage', onAuthChanged)
    return () => {
      window.removeEventListener('auth-changed', onAuthChanged)
      window.removeEventListener('storage', onAuthChanged)
    }
  }, [])

  const customerName = session?.user?.email ? session.user.email.split('@')[0] : ''

  if (isAdminArea || isHome) return null

  return (
    <div className="navbar-bar" style={{
      background: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '8px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      padding: '14px 16px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
    }}>
      <Link href="/" className="navbar-logo-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, textDecoration: 'none', flexShrink: 0 }}>
        <Logo variant="light" size="1em" />
      </Link>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {session ? (
          <Link href="/account" style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'rgba(255,255,255,0.12)', color: '#faf7f0',
            borderRadius: '8px', padding: '7px 12px',
            fontSize: '13px', whiteSpace: 'nowrap', textDecoration: 'none',
            maxWidth: '120px', overflow: 'hidden'
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {customerName || 'Account'}
            </span>
          </Link>
        ) : (
          <Link href="/login">
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: '#f4a300', color: '#0a0a0a',
              borderRadius: '8px', padding: '7px 14px',
              fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap'
            }}>
              Log In
            </div>
          </Link>
        )}
      </div>

    </div>
  )
}
