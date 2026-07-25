'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSession, signOut, supabaseFetch } from '@/lib/supabase'

export default function Navbar() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [areas, setAreas] = useState([])
  const [selectedArea, setSelectedArea] = useState(null)
  const [areaOpen, setAreaOpen] = useState(false)
  const areaRef = useRef(null)

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

  useEffect(() => {
    async function loadAreas() {
      try {
        const data = await supabaseFetch(`areas?select=*&order=name`)
        setAreas(data || [])
      } catch (e) {
        console.error(e)
      }
    }
    loadAreas()

    try {
      const saved = localStorage.getItem('selected_area')
      if (saved) setSelectedArea(JSON.parse(saved))
    } catch (e) {}
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (areaRef.current && !areaRef.current.contains(e.target)) {
        setAreaOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    signOut()
    setSession(null)
  }

  function handleAreaSelect(area) {
    setSelectedArea(area)
    setAreaOpen(false)
    try {
      localStorage.setItem('selected_area', JSON.stringify(area))
    } catch (e) {}
    router.push(`/shops?area=${area.id}&name=${encodeURIComponent(area.name)}`)
  }

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

        {areas.length > 0 && (
          <div ref={areaRef} style={{ position: 'relative', flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => setAreaOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: 'rgba(255,255,255,0.12)', border: 'none',
                borderRadius: '8px', padding: '6px 10px', cursor: 'pointer',
                color: '#faf7f0', fontSize: '12px', fontWeight: '600',
                maxWidth: '100%', whiteSpace: 'nowrap', overflow: 'hidden',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedArea ? selectedArea.name : 'এলাকা'}
              </span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: areaOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {areaOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)',
                width: 'max(260px, 80vw)', maxWidth: '340px',
                background: 'white', borderRadius: '10px', padding: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.18)', zIndex: 50,
                display: 'flex', flexWrap: 'wrap', gap: '8px',
                maxHeight: '260px', overflowY: 'auto',
              }}>
                {areas.map(area => {
                  const isSelected = selectedArea?.id === area.id
                  return (
                    <button
                      key={area.id}
                      onClick={() => handleAreaSelect(area)}
                      style={{
                        flexShrink: 0,
                        padding: '7px 14px',
                        borderRadius: '20px',
                        border: isSelected ? '1.5px solid #163a2c' : '1.5px solid #e0ddd3',
                        background: isSelected ? '#163a2c' : '#fff',
                        color: isSelected ? '#fff' : '#333',
                        fontSize: '13px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                      }}
                    >
                      {area.name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {session && (
            <span style={{
              color: '#dcebe0', fontSize: '11px', fontWeight: '600',
              whiteSpace: 'nowrap', maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis',
              display: 'none',
            }} className="navbar-name">
              {customerName}
            </span>
          )}
          {session && (
            <Link href="/account" style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'rgba(255,255,255,0.12)', color: '#faf7f0',
              borderRadius: '8px', padding: '6px 10px',
              fontSize: '12px', whiteSpace: 'nowrap', textDecoration: 'none'
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="navbar-account-text">একাউন্ট</span>
            </Link>
          )}
          {session ? (
            <button onClick={handleLogout} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'rgba(255,255,255,0.12)', color: '#faf7f0',
              border: 'none', borderRadius: '8px', padding: '6px 10px',
              fontSize: '12px', whiteSpace: 'nowrap', cursor: 'pointer'
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="navbar-logout-text">লগআউট</span>
            </button>
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
        @media (min-width: 400px) {
          .navbar-name { display: inline-block !important; }
        }
      `}</style>
    </>
  )
}
