'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'

export default function LegalPage({ slug, title }) {
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState('bn')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const rows = await supabaseFetch(`site_pages?select=*&slug=eq.${slug}&is_active=eq.true`)
        setPage(rows?.[0] || null)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [slug])

  const hasBilingual = !!(page?.content_bn || page?.content_en)
  const displayedContent = hasBilingual
    ? (lang === 'bn' ? (page.content_bn || page.content_en) : (page.content_en || page.content_bn))
    : page?.content

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '24px 16px 60px' }}>
      <Link href="/" style={{ color: theme.brass, fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>← Back to Home</Link>
      <h1 style={{ fontFamily: theme.fontDisplay, fontSize: '22px', fontWeight: '800', color: theme.ink, margin: '14px 0 18px' }}>{title}</h1>

      {hasBilingual && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {[{ key: 'bn', label: 'বাংলা' }, { key: 'en', label: 'English' }].map(l => (
            <button
              key={l.key}
              onClick={() => setLang(l.key)}
              style={{
                padding: '6px 16px', borderRadius: '20px', fontSize: '12.5px', fontWeight: '700',
                border: '1px solid', cursor: 'pointer',
                background: lang === l.key ? theme.brass : theme.surface,
                color: lang === l.key ? 'white' : theme.inkSoft,
                borderColor: lang === l.key ? theme.brass : theme.line,
              }}
            >{l.label}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ color: theme.inkSoft, fontSize: '14px', padding: '30px 0', textAlign: 'center' }}>Loading...</div>
      ) : displayedContent ? (
        <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#333', whiteSpace: 'pre-wrap' }}>
          {displayedContent}
        </div>
      ) : (
        <div style={{ color: theme.inkSoft, fontSize: '14px', padding: '30px 0', textAlign: 'center' }}>
          Content for this page will be added soon.
        </div>
      )}
    </div>
  )
}
