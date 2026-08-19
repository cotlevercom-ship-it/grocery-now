'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'

export default function HelpCenterPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeArticleId, setActiveArticleId] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await supabaseFetch('help_articles?select=*&is_active=eq.true&order=category,sort_order')
        setArticles(data || [])
        if (data && data.length > 0) setActiveArticleId(data[0].id)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [])

  const categories = useMemo(() => {
    const seen = []
    for (const a of articles) {
      if (!seen.includes(a.category)) seen.push(a.category)
    }
    return seen
  }, [articles])

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    return articles.filter(a =>
      a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
    )
  }, [query, articles])

  const visibleArticles = searched !== null
    ? searched
    : activeCategory === 'all'
      ? articles
      : articles.filter(a => a.category === activeCategory)

  const activeArticle = articles.find(a => a.id === activeArticleId)

  return (
    <div style={{ minHeight: '100vh', background: theme.paper }}>
      {/* Topbar */}
      <div style={{
        background: theme.surface, padding: '14px 16px', borderBottom: `1px solid ${theme.line}`,
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <Link href="/">
          <div style={{ color: theme.ink, fontSize: '22px', lineHeight: 1 }}>←</div>
        </Link>
        <div style={{ color: theme.ink, fontSize: '16px', fontWeight: '500' }}>Help Center</div>
      </div>

      {/* Search */}
      <div style={{ padding: '14px 16px', background: theme.surface, borderBottom: `1px solid ${theme.line}` }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for help..."
          style={{
            width: '100%', padding: '10px 14px', borderRadius: '8px',
            border: `1px solid ${theme.line}`, fontSize: '14px', boxSizing: 'border-box',
            background: theme.paper, color: theme.ink
          }}
        />
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '0' }} className="help-container">
        {/* Category sidebar (mobile: toggle) */}
        <div style={{
          width: '200px', flexShrink: 0, background: theme.surface,
          borderRight: `1px solid ${theme.line}`, padding: '14px 0', display: menuOpen ? 'block' : undefined
        }}
          className="help-sidebar"
        >
          <button
            onClick={() => { setActiveCategory('all'); setQuery('') }}
            style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px',
              fontSize: '13px', fontWeight: activeCategory === 'all' ? '700' : '400',
              color: activeCategory === 'all' ? theme.ink : theme.inkSoft,
              background: activeCategory === 'all' ? theme.lineSoft : 'transparent',
              border: 'none'
            }}
          >All categories</button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setQuery('') }}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px',
                fontSize: '13px', fontWeight: activeCategory === cat ? '700' : '400',
                color: activeCategory === cat ? theme.ink : theme.inkSoft,
                background: activeCategory === cat ? theme.lineSoft : 'transparent',
                border: 'none'
              }}
            >{cat}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '20px 16px', minWidth: 0 }}>
          {loading ? (
            <div style={{ color: theme.inkSoft, fontSize: '14px' }}>Loading...</div>
          ) : articles.length === 0 ? (
            <div style={{ color: theme.inkSoft, fontSize: '14px' }}>No help articles yet.</div>
          ) : (
            <>
              {query.trim() && (
                <div style={{ fontSize: '13px', color: theme.inkSoft, marginBottom: '12px' }}>
                  {visibleArticles.length} result{visibleArticles.length !== 1 ? 's' : ''} for &quot;{query}&quot;
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                {visibleArticles.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setActiveArticleId(a.id)}
                    style={{
                      textAlign: 'left', padding: '10px 14px', borderRadius: '8px',
                      border: `1px solid ${activeArticleId === a.id ? theme.brass : theme.line}`,
                      background: activeArticleId === a.id ? theme.lineSoft : theme.surface,
                      fontSize: '13px', fontWeight: activeArticleId === a.id ? '600' : '500',
                      color: theme.ink
                    }}
                  >{a.title}</button>
                ))}
              </div>

              {activeArticle && visibleArticles.some(a => a.id === activeArticle.id) && (
                <div style={{
                  background: theme.surface, borderRadius: '10px', border: `1px solid ${theme.line}`, padding: '20px'
                }}>
                  <div style={{ fontSize: '11px', color: theme.inkSoft, marginBottom: '6px' }}>
                    {activeArticle.category}
                  </div>
                  <h1 style={{ fontSize: '18px', fontWeight: '700', color: theme.ink, marginBottom: '12px' }}>
                    {activeArticle.title}
                  </h1>
                  <p style={{ fontSize: '14px', color: theme.inkSoft, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {activeArticle.content}
                  </p>
                </div>
              )}
            </>
          )}

          <div style={{
            marginTop: '24px', padding: '16px', background: theme.surface,
            borderRadius: '10px', border: `1px solid ${theme.line}`, textAlign: 'center'
          }}>
            <div style={{ fontSize: '13px', color: theme.inkSoft, marginBottom: '8px' }}>
              Didn&apos;t find what you were looking for?
            </div>
            <Link href="/#footer-contact" style={{
              display: 'inline-block', background: theme.brass, color: theme.ink,
              padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '600'
            }}>Contact support</Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 640px) {
          .help-container {
            flex-direction: column !important;
          }
          .help-sidebar {
            width: 100% !important;
            display: flex !important;
            overflow-x: auto;
            border-right: none !important;
            border-bottom: 1px solid ${theme.line};
            padding: 10px 8px !important;
            gap: 6px;
          }
          .help-sidebar button {
            width: auto !important;
            white-space: nowrap;
            border-radius: 20px !important;
          }
        }
      `}</style>
    </div>
  )
}
