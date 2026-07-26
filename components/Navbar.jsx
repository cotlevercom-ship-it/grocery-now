'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getSession } from '@/lib/supabase'

export default function Navbar() {
  const [session, setSession] = useState(null)

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

  return (
    <>
      <div className="navbar-bar" style={{
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        padding: '10px 12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, textDecoration: 'none', flexShrink: 0 }}>
          <span className="navbar-logo-text" style={{
            color: '#ffffff', fontWeight: '700', fontSize: '16px',
            letterSpacing: '-0.02em', whiteSpace: 'nowrap',
          }}>Cot Lever</span>
          <span style={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: '#7ee787', flexShrink: 0,
            animation: 'dotPulse 2s ease-in-out infinite',
          }} />
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {session ? (
            <Link href="/account" style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'rgba(255,255,255,0.12)', color: '#faf7f0',
              borderRadius: '8px', padding: '6px 10px',
              fontSize: '12px', whiteSpace: 'nowrap', textDecoration: 'none',
              maxWidth: '110px', overflow: 'hidden'
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
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
                background: 'rgba(255,255,255,0.12)', color: '#faf7f0',
                borderRadius: '8px', padding: '6px 10px',
                fontSize: '12px', whiteSpace: 'nowrap'
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Login
              </div>
            </Link>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes dotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </>
  )
}
