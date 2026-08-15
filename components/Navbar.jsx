'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getSession } from '@/lib/supabase'
import { theme } from '@/lib/theme'

const MENU_LINKS = [
  { href: '/why-use-cotlever', label: 'Why Use Cot Lever' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/resources', label: 'Articles' },
]

function NavMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
        style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px',
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '8px 6px', flexShrink: 0,
        }}
      >
        <span style={{ width: '20px', height: '2px', background: theme.ink, borderRadius: '2px' }} />
        <span style={{ width: '20px', height: '2px', background: theme.ink, borderRadius: '2px' }} />
        <span style={{ width: '20px', height: '2px', background: theme.ink, borderRadius: '2px' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', left: 0, minWidth: '176px',
          background: theme.surface, borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(20,33,61,0.08)', overflow: 'hidden', zIndex: 50,
          padding: '6px',
        }}>
          {MENU_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{
                display: 'block', padding: '9px 10px', borderRadius: '6px',
                fontSize: '13px', color: theme.inkSoft, textDecoration: 'none',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const [session, setSession] = useState(null)
  const pathname = usePathname()
  const isAdminArea = pathname?.startsWith('/admin')

  useEffect(() => {
    // getSession() reads localStorage, which doesn't exist during SSR — must
    // run client-side only in an effect, not a lazy useState initializer
    // (that would mismatch what the server rendered on hydration).
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      <NavMenu />

      <Link href="/" style={{
        fontFamily: theme.fontDisplay, fontSize: 'clamp(18px,1.6vw,22px)', fontWeight: '600',
        color: theme.ink, textDecoration: 'none', flexShrink: 0
      }}>
        Cot<span style={{ color: theme.brass }}>Lever</span>
      </Link>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
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
