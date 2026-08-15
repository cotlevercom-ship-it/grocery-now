'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'

export default function ResourcesPage() {
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCat, setActiveCat] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [data, cats] = await Promise.all([
          supabaseFetch('resources?select=id,slug,title,excerpt,created_at,category_id&is_published=eq.true&order=created_at.desc'),
          supabaseFetch('resource_categories?select=*&is_active=eq.true&order=sort_order.asc'),
        ])
        setArticles(data || [])
        setCategories(cats || [])
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [])

  const visibleArticles = useMemo(() => {
    if (activeCat === 'all') return articles
    return articles.filter(a => a.category_id === activeCat)
  }, [articles, activeCat])

  const tabStyle = (active) => ({
    padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
    border: `1px solid ${active ? theme.brass : theme.line}`,
    background: active ? theme.brass : 'transparent',
    color: active ? 'white' : theme.inkSoft,
    cursor: 'pointer', whiteSpace: 'nowrap',
  })

  return (
    <div style={{ background: theme.paper, minHeight: '60vh' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(28px,4vw,56px) clamp(16px,3vw,24px)' }}>
        <div style={{
          fontFamily: theme.fontMono, fontSize: '11.5px', letterSpacing: '0.1em', textTransform: 'uppercase',
          color: theme.brassDark, marginBottom: '10px', fontWeight: '600'
        }}>Resources</div>
        <h1 style={{
          fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(26px,3.4vw,38px)',
          color: theme.ink, marginBottom: '24px'
        }}>Articles for founders</h1>

        {categories.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '28px' }}>
            <button style={tabStyle(activeCat === 'all')} onClick={() => setActiveCat('all')}>All</button>
            {categories.map(c => (
              <button key={c.id} style={tabStyle(activeCat === c.id)} onClick={() => setActiveCat(c.id)}>{c.name}</button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ color: theme.inkSoft, fontSize: '14px' }}>Loading…</div>
        ) : visibleArticles.length === 0 ? (
          <div style={{ color: theme.inkSoft, fontSize: '14px' }}>No articles yet.</div>
        ) : (
          <div>
            {visibleArticles.map((a, i) => (
              <Link key={a.id} href={`/resources/${a.slug}`} style={{
                display: 'block', padding: '24px 0',
                borderTop: i === 0 ? `1px solid ${theme.line}` : 'none',
                borderBottom: `1px solid ${theme.line}`,
                textDecoration: 'none',
              }}>
                <div style={{ fontFamily: theme.fontDisplay, fontSize: '21px', fontWeight: '600', color: theme.ink, marginBottom: '8px' }}>
                  {a.title}
                </div>
                {a.excerpt && (
                  <p style={{ fontSize: '14px', color: theme.inkSoft, lineHeight: '1.6' }}>{a.excerpt}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
