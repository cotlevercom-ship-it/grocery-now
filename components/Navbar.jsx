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
        background: 'linear-gradient(135deg, #163a2c 0%, #2d6a4f 100%)',
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
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: '#f4a300', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '15px', flexShrink: 0,
          }}>🧺</div>
          <span className="navbar-logo-text" style={{
            color: '#faf7f0', fontWeight: '700', fontSize: '15px',
            letterSpacing: '-0.02em', whiteSpace: 'nowrap',
          }}>GroceryNow</span>
          <span style={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: '#7ee787', flexShrink: 0,
            animation: 'dotPulse 2s ease-in-out infinite',
          }} />
        </Link>

        <Link href="/shops" style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          background: 'rgba(255,255,255,0.12)', border: 'none',
          borderRadius: '8px', padding: '6px 10px', cursor: 'pointer',
          color: '#faf7f0', fontSize: '12px', fontWeight: '600',
          textDecoration: 'none', whiteSpace: 'nowrap',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 002 2M9 21a1 1 0 100-2 1 1 0 000 2zM20 21a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
          <span>সব দোকান</span>
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
                {customerName || 'একাউন্ট'}
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
                লগইন
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
