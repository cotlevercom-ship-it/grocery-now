'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseFetch } from '@/lib/supabase'

export default function Navbar() {
  const router = useRouter()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedArea, setSelectedArea] = useState(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('selectedArea')
      if (saved) setSelectedArea(JSON.parse(saved))
    } catch (e) {
      console.error(e)
    }
  }, [])

  async function openSheet() {
    setSheetOpen(true)
    if (areas.length === 0) {
      setLoading(true)
      try {
        const data = await supabaseFetch('areas?select=*&is_active=eq.true&order=name')
        setAreas(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
  }

  function selectArea(area) {
    setSelectedArea(area)
    try {
      localStorage.setItem('selectedArea', JSON.stringify({ id: area.id, name: area.name }))
    } catch (e) {
      console.error(e)
    }
    setSheetOpen(false)
    router.push(`/shops?area=${area.id}&name=${encodeURIComponent(area.name)}`)
  }

  return (
    <>
      <div style={{
        background: 'linear-gradient(135deg, #163a2c 0%, #2d6a4f 100%)',
        padding: '13px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '9px',
            background: '#f4a300', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '17px', flexShrink: 0,
          }}>🧺</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
            <span style={{
              color: '#faf7f0', fontSize: '17px', fontWeight: '700',
              letterSpacing: '-0.02em', whiteSpace: 'nowrap',
            }}>GroceryNow</span>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#7ee787', flexShrink: 0,
              animation: 'dotPulse 2s ease-in-out infinite',
            }} />
          </div>
        </div>

        <button
          onClick={openSheet}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#faf7f0',
            border: 'none',
            borderRadius: '20px',
            padding: '7px 12px 7px 10px',
            cursor: 'pointer',
            flexShrink: 1,
            minWidth: 0,
            boxShadow: selectedArea ? 'none' : '0 0 0 0 rgba(244,163,0,0.6)',
            animation: selectedArea ? 'none' : 'ringPulse 2s ease-out infinite',
          }}
        >
          <span style={{ fontSize: '14px', color: '#f4a300', flexShrink: 0 }}>📍</span>
          <span style={{
            color: '#163a2c',
            fontSize: '13px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minWidth: 0,
          }}>
            {selectedArea ? selectedArea.name : 'এলাকা নির্বাচন করুন'}
          </span>
          <span style={{ fontSize: '10px', color: '#6b7a72', flexShrink: 0 }}>▾</span>
        </button>
      </div>

      {sheetOpen && (
        <div
          onClick={() => setSheetOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(10,20,15,0.55)',
            zIndex: 50, display: 'flex', flexDirection: 'column',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#faf7f0',
              borderRadius: '0 0 20px 20px',
              padding: '20px 16px 26px',
              maxHeight: '70vh',
              overflowY: 'auto',
              animation: 'slideDown 0.25s ease-out',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '4px',
            }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#163a2c' }}>
                আপনার এলাকা নির্বাচন করুন
              </div>
              <button
                onClick={() => setSheetOpen(false)}
                style={{
                  background: '#efece3', border: 'none', borderRadius: '50%',
                  width: '28px', height: '28px', fontSize: '15px',
                  color: '#555', cursor: 'pointer', lineHeight: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
            </div>
            <div style={{
              width: '36px', height: '3px', borderRadius: '2px',
              background: '#f4a300', margin: '10px 0 16px',
            }} />

            {loading ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                লোড হচ্ছে...
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {areas.map((area) => {
                  const isSelected = selectedArea?.id === area.id
                  return (
                    <div
                      key={area.id}
                      onClick={() => selectArea(area)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        border: isSelected ? '1.5px solid #2d6a4f' : '1px solid #e4e0d4',
                        background: isSelected ? '#e8f5e9' : 'white',
                        borderRadius: '12px', padding: '11px 12px', cursor: 'pointer',
                        boxShadow: isSelected ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                      }}
                    >
                      <span style={{ fontSize: '15px', color: '#f4a300' }}>📍</span>
                      <span style={{
                        fontSize: '13px', fontWeight: '500',
                        color: isSelected ? '#163a2c' : '#333',
                      }}>{area.name}</span>
                      {isSelected && <span style={{ marginLeft: 'auto', color: '#2d6a4f', fontSize: '14px' }}>✓</span>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes ringPulse {
          0% { box-shadow: 0 0 0 0 rgba(244,163,0,0.5); }
          70% { box-shadow: 0 0 0 6px rgba(244,163,0,0); }
          100% { box-shadow: 0 0 0 0 rgba(244,163,0,0); }
        }
      `}</style>
    </>
  )
}
