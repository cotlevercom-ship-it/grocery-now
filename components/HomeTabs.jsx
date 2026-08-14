'use client'
import { useState, Suspense } from 'react'
import { theme } from '@/lib/theme'
import ListingBrowse from '@/components/ListingBrowse'
import CofounderBrowse from '@/components/CofounderBrowse'

const TABS = [
  { key: 'business', label: 'Listed Business' },
  { key: 'cofounder', label: 'Co-founder' },
]

export default function HomeTabs() {
  const [tab, setTab] = useState('business')

  return (
    <div style={{ background: theme.paper, minHeight: '80vh' }}>
      {/* Tab bar */}
      <div style={{ borderBottom: `1px solid ${theme.line}`, position: 'sticky', top: '0', zIndex: 20, background: theme.paper }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(16px,3vw,56px)',
          display: 'flex', gap: 'clamp(18px,2vw,32px)'
        }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '16px 2px', fontFamily: theme.fontBody,
                fontSize: '14.5px', fontWeight: '600',
                color: tab === t.key ? theme.ink : theme.inkSoft,
                borderBottom: tab === t.key ? `2px solid ${theme.brass}` : '2px solid transparent',
              }}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {tab === 'business' ? (
        <Suspense fallback={null}>
          <ListingBrowse embedded />
        </Suspense>
      ) : (
        <div style={{ maxWidth: '780px', margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,3vw,24px)' }}>
          <CofounderBrowse embedded />
        </div>
      )}
    </div>
  )
}
