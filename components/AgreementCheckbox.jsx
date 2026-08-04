'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

// type: 'merchant' | 'customer' | 'affiliate' | 'ship'
// checked / onChange: controlled checkbox state
// accent: hex color for the checkbox + links (defaults to site amber)
export default function AgreementCheckbox({ type, checked, onChange, accent = '#f4a300' }) {
  const [agreement, setAgreement] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const rows = await supabaseFetch(`agreements?select=title,content&type=eq.${type}`)
        if (!cancelled) setAgreement(rows?.[0] || null)
      } catch (e) {
        console.error(e)
      }
    }
    load()
    return () => { cancelled = true }
  }, [type])

  const title = agreement?.title || 'Agreement'

  return (
    <>
      <label style={{
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        fontSize: '13px', color: '#4a4a4a', cursor: 'pointer', lineHeight: 1.5,
      }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: accent, flexShrink: 0, cursor: 'pointer' }}
        />
        <span>
          I agree to the{' '}
          <span
            onClick={(e) => { e.preventDefault(); setShowModal(true) }}
            style={{ color: accent, fontWeight: '700', textDecoration: 'underline', cursor: 'pointer' }}
          >
            {title}
          </span>
        </span>
      </label>

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white', width: '100%', maxWidth: '520px', maxHeight: '80vh',
              borderRadius: '16px 16px 0 0', display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div style={{
              padding: '16px 18px', borderBottom: '1px solid #eee',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#0a0a0a' }}>{title}</div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: '#999', cursor: 'pointer', lineHeight: 1 }}
              >×</button>
            </div>
            <div style={{ padding: '18px', overflowY: 'auto', fontSize: '13.5px', color: '#333', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {agreement?.content || 'Loading...'}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
