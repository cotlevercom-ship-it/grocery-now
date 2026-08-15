'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'

// type: 'founder' | 'customer'
// checked / onChange: controlled checkbox state
// accent: hex color for the checkbox + links (defaults to site amber)
export default function AgreementCheckbox({ type, checked, onChange, accent = '#f4a300' }) {
  const [agreement, setAgreement] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [lang, setLang] = useState('bn') // 'bn' | 'en'

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const rows = await supabaseFetch(`agreements?select=title_bn,title_en,content_bn,content_en&type=eq.${type}`)
        if (!cancelled) setAgreement(rows?.[0] || null)
      } catch (e) {
        console.error(e)
      }
    }
    load()
    return () => { cancelled = true }
  }, [type])

  const title = (lang === 'bn' ? agreement?.title_bn : agreement?.title_en) || 'Agreement'

  return (
    <>
      <label style={{
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        fontSize: '13px', color: theme.inkSoft, cursor: 'pointer', lineHeight: 1.5,
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
          style={{
            position: 'fixed', inset: 0, background: theme.paper, zIndex: 1000,
            display: 'flex', flexDirection: 'column',
          }}
        >
          <div style={{
            padding: '16px 18px', borderBottom: `1px solid ${theme.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
          }}>
            <div style={{ fontSize: '16px', fontWeight: '800', color: theme.ink }}>{title}</div>
            <button
              onClick={() => setShowModal(false)}
              style={{ background: 'none', border: 'none', fontSize: '24px', color: theme.inkSoft, cursor: 'pointer', lineHeight: 1, padding: '4px' }}
            >×</button>
          </div>
          <div style={{ display: 'flex', borderBottom: `1px solid ${theme.line}`, flexShrink: 0 }}>
            {[['bn', 'বাংলা'], ['en', 'English']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setLang(key)}
                style={{
                  flex: 1, padding: '11px', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: '13.5px', fontWeight: '700',
                  color: lang === key ? theme.ink : theme.inkSoft,
                  borderBottom: lang === key ? `2px solid ${accent}` : '2px solid transparent',
                }}
              >{label}</button>
            ))}
          </div>
          <div style={{
            flex: 1, overflowY: 'auto', padding: '20px 18px 40px',
            maxWidth: '640px', width: '100%', margin: '0 auto', boxSizing: 'border-box',
            fontSize: '14px', color: theme.ink, lineHeight: 1.75, whiteSpace: 'pre-wrap'
          }}>
            {(lang === 'bn' ? agreement?.content_bn : agreement?.content_en) || 'Loading...'}
          </div>
          <div style={{ padding: '14px 18px', borderTop: `1px solid ${theme.line}`, flexShrink: 0 }}>
            <button
              onClick={() => setShowModal(false)}
              style={{
                width: '100%', maxWidth: '640px', margin: '0 auto', display: 'block',
                background: accent, color: 'white', border: 'none', borderRadius: '10px',
                padding: '13px', fontSize: '14.5px', fontWeight: '700', cursor: 'pointer'
              }}
            >Done</button>
          </div>
        </div>
      )}
    </>
  )
}
