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
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          padding: '12px 16px',
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, textDecoration: 'none' }}>
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
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {session && (
              <span style={{
                color: '#dcebe0', fontSize: '12px', fontWeight: '600',
                whiteSpace: 'nowrap', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis'
              }}>
                {customerName}
              </span>
            )}
            {session ? (
              <button onClick={handleLogout} style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: 'rgba(255,255,255,0.12)', color: '#faf7f0',
                border: 'none', borderRadius: '8px', padding: '7px 12px',
                fontSize: '12px', whiteSpace: 'nowrap', cursor: 'pointer'
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                লগআউট
              </button>
            ) : (
              <Link href="/login">
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  background: 'rgba(255,255,255,0.12)', color: '#faf7f0',
                  borderRadius: '8px', padding: '7px 12px',
                  fontSize: '12px', whiteSpace: 'nowrap'
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  লগইন
                </div>
              </Link>
            )}
          </div>
        </div>

        {areas.length > 0 && (
          <div ref={areaRef} style={{ position: 'relative', padding: '0 16px 10px' }}>
            <button
              onClick={() => setAreaOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(255,255,255,0.12)', border: 'none',
                borderRadius: '8px', padding: '6px 12px', cursor: 'pointer',
                color: '#faf7f0', fontSize: '12px', fontWeight: '600',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {selectedArea ? selectedArea.name : 'এলাকা বেছে নিন'}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: areaOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {areaOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: '16px', right: '16px',
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
