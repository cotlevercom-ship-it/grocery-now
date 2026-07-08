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
        background: '#2e7d32',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div style={{ color: 'white', fontSize: '20px', fontWeight: '600' }}>
          🛒 GroceryNow
        </div>
        <button
          onClick={openSheet}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            borderRadius: '20px',
            padding: '7px 12px',
            cursor: 'pointer',
            maxWidth: '160px',
          }}
        >
          <span style={{ fontSize: '16px' }}>📍</span>
          <span style={{
            color: 'white',
            fontSize: '13px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {selectedArea ? selectedArea.name : 'এলাকা নির্বাচন করুন'}
          </span>
        </button>
      </div>

      {sheetOpen && (
        <div
          onClick={() => setSheetOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 50, display: 'flex', flexDirection: 'column',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '0 0 16px 16px',
              padding: '18px 16px 24px',
              maxHeight: '70vh',
              overflowY: 'auto',
              animation: 'slideDown 0.25s ease-out',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '14px',
            }}>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
                আপনার এলাকা নির্বাচন করুন
              </div>
              <button
                onClick={() => setSheetOpen(false)}
                style={{
                  background: 'none', border: 'none', fontSize: '20px',
                  color: '#888', cursor: 'pointer', lineHeight: 1,
                }}
              >✕</button>
            </div>

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
                        border: isSelected ? '1.5px solid #2e7d32' : '1px solid #e0e0e0',
                        background: isSelected ? '#e8f5e9' : 'white',
                        borderRadius: '10px', padding: '10px 12px', cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>📍</span>
                      <span style={{
                        fontSize: '13px', fontWeight: '500',
                        color: isSelected ? '#1b5e20' : '#1a1a1a',
                      }}>{area.name}</span>
                      {isSelected && <span style={{ marginLeft: 'auto', color: '#2e7d32', fontSize: '14px' }}>✓</span>}
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
      `}</style>
    </>
  )
}
