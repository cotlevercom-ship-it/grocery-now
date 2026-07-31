'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getSession } from '@/lib/supabase'
import Image from 'next/image'

export default function Navbar() {
  const [session, setSession] = useState(null)
  const pathname = usePathname()
  const isSellerArea = pathname?.startsWith('/seller')

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
        padding: '14px 16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ position: 'relative', display: 'inline-block', height: '42px', width: '143px' }}>
            <Image src="/logo-text.png" alt="Cot Lever" fill priority
              style={{ objectFit: 'contain', objectPosition: 'left center' }} />
            <svg
              viewBox="0 0 1220 358"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              preserveAspectRatio="xMidYMid meet"
            >
              <path
                className="logo-underline-path"
                d="M 40 300
                   C 150 300, 260 300, 350 292
                   C 460 282, 480 190, 560 155
                   C 610 133, 660 210, 700 270
                   C 730 312, 760 308, 800 285
                   C 850 256, 870 175, 940 152
                   C 995 133, 1010 240, 1060 285
                   C 1100 320, 1140 305, 1180 296"
                fill="none"
                stroke="#dc2626"
                strokeWidth="16"
                strokeLinecap="round"
                pathLength="1"
              />
            </svg>
          </span>
          {isSellerArea && (
            <span style={{
              color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '600',
              borderLeft: '1px solid rgba(255,255,255,0.25)', paddingLeft: '8px',
              whiteSpace: 'nowrap',
            }}>Seller Centre</span>
          )}
        </Link>

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
                background: 'rgba(255,255,255,0.12)', color: '#faf7f0',
                borderRadius: '8px', padding: '7px 12px',
                fontSize: '13px', whiteSpace: 'nowrap'
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        .logo-underline-path {
          stroke-dasharray: 1 1;
          stroke-dashoffset: 1;
          animation: logoUnderlineDraw 2.6s ease-in-out infinite;
        }
        @keyframes logoUnderlineDraw {
          0% { stroke-dashoffset: 1; }
          35% { stroke-dashoffset: 0; }
          75% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 1; }
        }
      `}</style>
    </>
  )
}
