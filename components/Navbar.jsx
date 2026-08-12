'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getSession } from '@/lib/supabase'
import { theme } from '@/lib/theme'

export default function Navbar() {
  const [session, setSession] = useState(null)
  const pathname = usePathname()
  const isAdminArea = pathname?.startsWith('/admin')

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

  if (isAdminArea) return null

  return (
    <div style={{
      background: theme.paper,
      borderBottom: `1px solid ${theme.line}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '8px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      padding: 'clamp(12px,1.6vw,18px) clamp(16px,3vw,56px)',
    }}>
      <Link href="/" style={{
        fontFamily: theme.fontDisplay, fontSize: 'clamp(18px,1.6vw,22px)', fontWeight: '600',
        color: theme.ink, textDecoration: 'none', flexShrink: 0
      }}>
        Cot<span style={{ color: theme.brass }}>Lever</span>
      </Link>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <Link href="/members" style={{
          fontSize: '13.5px', fontWeight: '600', color: theme.inkSoft, textDecoration: 'none',
          padding: '9px 10px'
        }}>Find Co-founders</Link>

        <Link href="/resources" style={{
          fontSize: '13.5px', fontWeight: '600', color: theme.inkSoft, textDecoration: 'none',
          padding: '9px 10px', display: 'none'
        }} className="nav-resources-link">Resources</Link>

        {session ? (
          <Link href="/account" style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: theme.surface, color: theme.ink, border: `1px solid ${theme.line}`,
            borderRadius: '7px', padding: '8px 12px',
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
          <Link href="/login" style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: theme.surface, color: theme.ink, border: `1px solid ${theme.line}`,
            borderRadius: '7px', padding: '9px 14px',
            fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', textDecoration: 'none'
          }}>Log In</Link>
        )}
      </div>
    </div>
  )
}
