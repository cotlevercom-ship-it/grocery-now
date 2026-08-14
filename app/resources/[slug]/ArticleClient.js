'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'

const SITE_URL = 'https://cotlever.com'

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

function ShareBar({ url, title }) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const btnStyle = {
    display: 'inline-flex', alignItems: 'center', gap: '7px',
    padding: '9px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
    textDecoration: 'none', border: `1px solid ${theme.line}`,
  }
  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
      <span style={{ fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.inkSoft, marginRight: '4px' }}>
        Share
      </span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...btnStyle, color: '#1877F2', background: '#EAF3FF' }}
      >
        Facebook
      </a>
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...btnStyle, color: '#25D366', background: '#E9FBF0' }}
      >
        WhatsApp
      </a>
    </div>
  )
}

function SeriesNav({ series, currentSlug }) {
  if (!series || series.length < 2) return null
  const currentIndex = series.findIndex(a => a.slug === currentSlug)
  const next = currentIndex >= 0 && currentIndex < series.length - 1 ? series[currentIndex + 1] : null

  return (
    <div style={{ marginTop: '40px', marginBottom: '40px' }}>
      {next && (
        <Link
          href={`/resources/${next.slug}`}
          style={{
            display: 'block', textDecoration: 'none', background: theme.surface,
            border: `1px solid ${theme.line}`, borderRadius: '12px', padding: '18px 20px',
            marginBottom: '20px',
          }}
        >
          <div style={{ fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.brassDark, fontWeight: '600', marginBottom: '6px' }}>
            Next in this series →
          </div>
          <div style={{ fontFamily: theme.fontDisplay, fontSize: '18px', fontWeight: '600', color: theme.ink }}>
            {next.title}
          </div>
        </Link>
      )}

      <div style={{ border: `1px solid ${theme.line}`, borderRadius: '12px', padding: '18px 20px' }}>
        <div style={{ fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.inkSoft, fontWeight: '600', marginBottom: '12px' }}>
          This series
        </div>
        {series.map((a, i) => {
          const isCurrent = a.slug === currentSlug
          return (
            <Link
              key={a.slug}
              href={`/resources/${a.slug}`}
              style={{
                display: 'flex', gap: '10px', alignItems: 'baseline', textDecoration: 'none',
                padding: '7px 0', color: isCurrent ? theme.brassDark : theme.ink,
                fontWeight: isCurrent ? '700' : '500', fontSize: '14px',
              }}
            >
              <span style={{ fontFamily: theme.fontMono, fontSize: '12px', color: theme.inkSoft, flexShrink: 0 }}>{i + 1}.</span>
              <span>{a.title}{isCurrent ? ' (this article)' : ''}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default function ArticleClient() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await supabaseFetch(`resources?select=*&slug=eq.${slug}&is_published=eq.true`)
        const found = data?.[0] || null
        setArticle(found)

        if (found?.series_slug) {
          try {
            const seriesData = await supabaseFetch(
              `resources?select=slug,title,series_order&series_slug=eq.${encodeURIComponent(found.series_slug)}&is_published=eq.true&order=series_order.asc`
            )
            setSeries(seriesData || [])
          } catch (e) {
            setSeries([])
          }
        } else {
          setSeries([])
        }
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

  const articleUrl = `${SITE_URL}/resources/${article.slug}`

  return (
    <div style={{ background: theme.paper, minHeight: '60vh' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: 'clamp(28px,4vw,56px) clamp(16px,3vw,24px)' }}>
        <Link href="/resources" style={{ fontSize: '13px', color: theme.inkSoft, textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>← Resources</Link>

        <h1 style={{
          fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(26px,3.6vw,38px)',
          color: theme.ink, marginBottom: '28px', lineHeight: '1.2'
        }}>{article.title}</h1>

        <div>{renderContent(article.content)}</div>

        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: `1px solid ${theme.line}` }}>
          <ShareBar url={articleUrl} title={article.title} />
        </div>

        <SeriesNav series={series} currentSlug={article.slug} />
      </div>
    </div>
  )
}
