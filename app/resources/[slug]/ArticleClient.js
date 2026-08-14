'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'

function renderContent(content) {
  const paragraphs = content.split('\n\n')
  return paragraphs.map((para, i) => {
    const boldMatch = para.match(/^\*\*(.+?)\*\*\n([\s\S]*)$/)
    if (boldMatch) {
      return (
        <div key={i} style={{ marginBottom: '22px' }}>
          <div style={{ fontFamily: theme.fontDisplay, fontSize: '18px', fontWeight: '600', color: theme.ink, marginBottom: '8px' }}>
            {boldMatch[1]}
          </div>
          <p style={{ fontSize: '15px', lineHeight: '1.75', color: theme.inkSoft }}>{boldMatch[2]}</p>
        </div>
      )
    }
    return (
      <p key={i} style={{ fontSize: '15px', lineHeight: '1.75', color: theme.inkSoft, marginBottom: '22px' }}>{para}</p>
    )
  })
}

export default function ArticleClient() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await supabaseFetch(`resources?select=*&slug=eq.${slug}&is_published=eq.true`)
        setArticle(data?.[0] || null)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    if (slug) load()
  }, [slug])

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: theme.inkSoft }}>Loading…</div>

  if (!article) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: theme.inkSoft }}>
        Article not found. <Link href="/resources" style={{ color: theme.brassDark, fontWeight: '600' }}>Back to Resources</Link>
      </div>
    )
  }

  return (
    <div style={{ background: theme.paper, minHeight: '60vh' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: 'clamp(28px,4vw,56px) clamp(16px,3vw,24px)' }}>
        <Link href="/resources" style={{ fontSize: '13px', color: theme.inkSoft, textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>← Resources</Link>

        <h1 style={{
          fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(26px,3.6vw,38px)',
          color: theme.ink, marginBottom: '28px', lineHeight: '1.2'
        }}>{article.title}</h1>

        <div>{renderContent(article.content)}</div>
      </div>
    </div>
  )
}
