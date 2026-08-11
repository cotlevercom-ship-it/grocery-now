'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'

const TABS = [
  { slug: 'about-us', label: 'About Us' },
  { slug: 'contact-us', label: 'Contact Us' },
  { slug: 'privacy-policy', label: 'Privacy Policy' },
  { slug: 'terms-and-conditions', label: 'Terms & Conditions' },
]

const COLORS = {
  ink: '#14213D',
  gold: '#B8874B',
  textMuted: '#4A5578',
  line: '#E1DCCF',
}

export default function AboutPage() {
  return (
    <Suspense fallback={null}>
      <AboutTabs />
    </Suspense>
  )
}

function AboutTabs() {
  const searchParams = useSearchParams()
  const initialTab = TABS.find(t => t.slug === searchParams.get('tab'))?.slug || TABS[0].slug

  const [pages, setPages] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(initialTab)
  const [lang, setLang] = useState('bn')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const slugList = TABS.map(t => t.slug).join(',')
        const rows = await supabaseFetch(`site_pages?select=*&slug=in.(${slugList})&is_active=eq.true`)
        const map = {}
        ;(rows || []).forEach(r => { map[r.slug] = r })
        setPages(map)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [])

  const current = pages[activeTab]
  const hasBilingual = !!(current?.content_bn || current?.content_en)
  const displayedContent = hasBilingual
    ? (lang === 'bn' ? (current.content_bn || current.content_en) : (current.content_en || current.content_bn))
    : current?.content

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '24px 16px 60px' }}>
      <Link href="/" style={{ color: COLORS.gold, fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>← Back to Home</Link>
      <h1 style={{ fontSize: '22px', fontWeight: '800', color: COLORS.ink, margin: '14px 0 18px' }}>About Cot Lever</h1>

      <div style={{
        display: 'flex', gap: '4px', overflowX: 'auto', borderBottom: `1px solid ${COLORS.line}`,
        marginBottom: '20px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.slug}
            onClick={() => setActiveTab(tab.slug)}
            style={{
              flexShrink: 0, padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '13.5px', fontWeight: '700', whiteSpace: 'nowrap',
              color: activeTab === tab.slug ? COLORS.ink : COLORS.textMuted,
              borderBottom: activeTab === tab.slug ? `2px solid ${COLORS.gold}` : '2px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {hasBilingual && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {[{ key: 'bn', label: 'বাংলা' }, { key: 'en', label: 'English' }].map(l => (
            <button
              key={l.key}
              onClick={() => setLang(l.key)}
              style={{
                padding: '6px 16px', borderRadius: '20px', fontSize: '12.5px', fontWeight: '700',
                border: '1px solid', cursor: 'pointer',
                background: lang === l.key ? COLORS.ink : 'white',
                color: lang === l.key ? 'white' : COLORS.textMuted,
                borderColor: lang === l.key ? COLORS.ink : '#ddd',
              }}
            >{l.label}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ color: COLORS.textMuted, fontSize: '14px', padding: '30px 0', textAlign: 'center' }}>Loading...</div>
      ) : displayedContent ? (
        <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#333', whiteSpace: 'pre-wrap' }}>
          {displayedContent}
        </div>
      ) : (
        <div style={{ color: COLORS.textMuted, fontSize: '14px', padding: '30px 0', textAlign: 'center' }}>
          Content for this page will be added soon.
        </div>
      )}
    </div>
  )
}
