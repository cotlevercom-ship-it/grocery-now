'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getSession, signOut } from '@/lib/supabase'

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

  const handleLogout = () => {
    signOut()
    setSession(null)
  }

  return (
    <>
      <div className="navbar-bar" style={{
        background: 'linear-gradient(135deg, #163a2c 0%, #2d6a4f 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        padding: '12px 16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '9px',
            background: '#f4a300', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '17px', flexShrink: 0,
          }}>🧺</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
            <span className="navbar-logo-text" style={{
              color: '#faf7f0', fontWeight: '700',
              letterSpacing: '-0.02em', whiteSpace: 'nowrap',
            }}>GroceryNow</span>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#7ee787', flexShrink: 0,
              animation: 'dotPulse 2s ease-in-out infinite',
            }} />
          </div>
        </div>

        {session ? (
          <button onClick={handleLogout} style={{
            background: 'rgba(255,255,255,0.12)', color: '#faf7f0',
            border: 'none', borderRadius: '8px', padding: '7px 12px',
            fontSize: '12px', whiteSpace: 'nowrap', cursor: 'pointer'
          }}>লগআউট</button>
        ) : (
          <Link href="/login">
            <div style={{
              background: 'rgba(255,255,255,0.12)', color: '#faf7f0',
              borderRadius: '8px', padding: '7px 12px',
              fontSize: '12px', whiteSpace: 'nowrap'
            }}>লগইন</div>
          </Link>
        )}
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
