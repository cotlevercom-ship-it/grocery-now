'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'

export default function ResourcesPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await supabaseFetch('resources?select=id,slug,title,excerpt,created_at&is_published=eq.true&order=created_at.desc')
        setArticles(data || [])
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div style={{ background: theme.paper, minHeight: '60vh' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(28px,4vw,56px) clamp(16px,3vw,24px)' }}>
        <div style={{
          fontFamily: theme.fontMono, fontSize: '11.5px', letterSpacing: '0.1em', textTransform: 'uppercase',
          color: theme.brassDark, marginBottom: '10px', fontWeight: '600'
        }}>Resources</div>
        <h1 style={{
          fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(26px,3.4vw,38px)',
          color: theme.ink, marginBottom: '32px'
        }}>Articles for founders</h1>

        {loading ? (
          <div style={{ color: theme.inkSoft, fontSize: '14px' }}>Loading…</div>
        ) : articles.length === 0 ? (
          <div style={{ color: theme.inkSoft, fontSize: '14px' }}>No articles yet.</div>
        ) : (
          <div>
            {articles.map((a, i) => (
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
