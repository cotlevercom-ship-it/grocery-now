'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'

function timeAgo(dateStr) {
  if (!dateStr) return null
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'Posted today'
  if (days === 1) return 'Posted 1 day ago'
  if (days < 30) return `Posted ${days} days ago`
  const months = Math.floor(days / 30)
  return `Posted ${months} month${months > 1 ? 's' : ''} ago`
}

// embedded=true hides the "← Home" link and the surrounding page padding/
// max-width shell — used when this renders inside the homepage tabs, where
// the parent already provides that chrome.
export default function CofounderBrowse({ embedded = false }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await supabaseFetch('cofounder_posts?select=*&status=eq.active&is_filled=eq.false&order=created_at.desc')
        setPosts(data || [])
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [])

  const content = (
    <>
      {!embedded && (
        <Link href="/" style={{ fontSize: '13px', color: theme.inkSoft, textDecoration: 'none', display: 'inline-block', marginBottom: '18px' }}>← Home</Link>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
        <div>
          <div style={{
            fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
            color: theme.brassDark, marginBottom: '8px', fontWeight: '600'
          }}>৳2000/year · First Month Free</div>
          {!embedded && (
            <h1 style={{ fontFamily: theme.fontDisplay, fontSize: 'clamp(24px,3vw,32px)', fontWeight: '600', color: theme.ink }}>
              Find a Co-founder
            </h1>
          )}
        </div>
        <Link href="/cofounder/new" style={{
          display: 'inline-block', background: theme.brass, color: 'white', borderRadius: '8px',
          padding: '12px 20px', fontSize: '14px', fontWeight: '600', textDecoration: 'none', whiteSpace: 'nowrap'
        }}>+ Post Your Idea</Link>
      </div>
      <p style={{ fontSize: '14.5px', color: theme.inkSoft, marginBottom: '28px', lineHeight: '1.6' }}>
        Ideas and early businesses looking for a co-founder to join them. First post free for 30 days, then ৳2000/year.
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: theme.inkSoft, fontSize: '14px' }}>Loading…</div>
      ) : posts.length === 0 ? (
        <div style={{
          background: theme.surface, borderRadius: '12px', border: `1px solid ${theme.line}`,
          padding: '48px 24px', textAlign: 'center'
        }}>
          <div style={{ fontSize: '34px', marginBottom: '12px' }}>🧩</div>
          <p style={{ fontSize: '14.5px', color: theme.inkSoft, marginBottom: '18px' }}>No listings yet in this category</p>
          <p style={{ fontSize: '13.5px', color: theme.inkSoft }}>
            Be the first — <Link href="/cofounder/new" style={{ color: theme.brassDark, fontWeight: '600' }}>post your idea</Link>.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {posts.map(post => (
            <Link key={post.id} href={`/cofounder/${post.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: theme.surface, borderRadius: '12px', border: `1px solid ${theme.line}`,
                padding: 'clamp(18px,2.5vw,24px)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ fontFamily: theme.fontDisplay, fontSize: '18px', fontWeight: '600', color: theme.ink }}>
                    {post.idea_name}
                  </div>
                  {post.stage && (
                    <div style={{
                      fontSize: '10.5px', fontWeight: '700', color: theme.brassDark, background: '#FBF3E7',
                      padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap'
                    }}>{post.stage}</div>
                  )}
                </div>
                {post.description && (
                  <p style={{
                    fontSize: '13.5px', color: theme.inkSoft, marginTop: '8px', lineHeight: '1.5',
                    overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                  }}>{post.description}</p>
                )}
                {post.skills_needed && (
                  <div style={{ fontSize: '12.5px', color: theme.ink, marginTop: '10px' }}>
                    🧩 {post.skills_needed}
                  </div>
                )}
                <div style={{ fontSize: '11.5px', color: theme.inkSoft, marginTop: '10px' }}>{timeAgo(post.created_at)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )

  if (embedded) return content

  return (
    <div style={{ background: theme.paper, minHeight: '80vh' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,3vw,24px)' }}>
        {content}
      </div>
    </div>
  )
}
