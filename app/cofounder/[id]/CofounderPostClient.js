'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'

export default function CofounderPostClient() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await supabaseFetch(`cofounder_posts?select=*&id=eq.${id}`)
        setPost(data?.[0] || null)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div style={{ background: theme.paper, minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: theme.inkSoft, fontSize: '14px' }}>Loading…</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div style={{ background: theme.paper, minHeight: '70vh', textAlign: 'center', padding: '60px 20px' }}>
        Post not found. <Link href="/cofounder" style={{ color: theme.brassDark, fontWeight: '600' }}>Back to Find a Co-founder</Link>
      </div>
    )
  }

  return (
    <div style={{ background: theme.paper, minHeight: '80vh' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,3vw,24px)' }}>
        <Link href="/cofounder" style={{ fontSize: '13px', color: theme.inkSoft, textDecoration: 'none', display: 'inline-block', marginBottom: '18px' }}>← Find a Co-founder</Link>

        <div style={{ background: theme.surface, borderRadius: '14px', border: `1px solid ${theme.line}`, padding: 'clamp(20px,3vw,32px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <h1 style={{ fontFamily: theme.fontDisplay, fontSize: 'clamp(22px,2.8vw,28px)', fontWeight: '600', color: theme.ink }}>
              {post.idea_name}
            </h1>
            {post.stage && (
              <div style={{
                fontSize: '11px', fontWeight: '700', color: theme.brassDark, background: '#FBF3E7',
                padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap'
              }}>{post.stage}</div>
            )}
          </div>

          {post.description && (
            <p style={{ fontSize: '14.5px', color: theme.ink, lineHeight: '1.7', marginBottom: '22px' }}>{post.description}</p>
          )}

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '22px'
          }}>
            {post.skills_needed && (
              <div style={{ padding: '14px 16px', borderRadius: '10px', background: theme.paper, border: `1px solid ${theme.line}` }}>
                <div style={{ fontSize: '11.5px', color: theme.inkSoft, marginBottom: '5px' }}>🧩 Skills needed</div>
                <div style={{ fontSize: '13.5px', fontWeight: '600', color: theme.ink }}>{post.skills_needed}</div>
              </div>
            )}
            {post.equity_offered && (
              <div style={{ padding: '14px 16px', borderRadius: '10px', background: theme.paper, border: `1px solid ${theme.line}` }}>
                <div style={{ fontSize: '11.5px', color: theme.inkSoft, marginBottom: '5px' }}>📄 Equity offered</div>
                <div style={{ fontSize: '13.5px', fontWeight: '600', color: theme.ink }}>{post.equity_offered}</div>
              </div>
            )}
            {post.commitment && (
              <div style={{ padding: '14px 16px', borderRadius: '10px', background: theme.paper, border: `1px solid ${theme.line}` }}>
                <div style={{ fontSize: '11.5px', color: theme.inkSoft, marginBottom: '5px' }}>⏱️ Commitment</div>
                <div style={{ fontSize: '13.5px', fontWeight: '600', color: theme.ink }}>{post.commitment}</div>
              </div>
            )}
          </div>

          <div style={{ borderTop: `1px solid ${theme.line}`, paddingTop: '20px' }}>
            <div style={{ fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '600', color: theme.brassDark, marginBottom: '12px' }}>Contact</div>
            {post.contact_email ? (
              <a href={`mailto:${post.contact_email}`} style={{ fontSize: '14.5px', color: theme.ink, fontWeight: '600', textDecoration: 'none' }}>
                ✉️ {post.contact_email}
              </a>
            ) : (
              <span style={{ fontSize: '13.5px', color: theme.inkSoft }}>No contact info provided</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
