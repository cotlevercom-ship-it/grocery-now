'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'

const SUB_STATUS_STYLE = {
  active: { bg: theme.signalSoft, color: theme.signal, label: 'Active' },
  pending: { bg: '#FBF3E7', color: theme.brassDark, label: 'Pending Review' },
  rejected: { bg: theme.dangerSoft, color: theme.danger, label: 'Rejected' },
  expired: { bg: theme.dangerSoft, color: theme.danger, label: 'Expired' },
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function MyCofounderPostsPage() {
  const router = useRouter()
  const [session, setSession] = useState(undefined)
  const [posts, setPosts] = useState([])
  const [subsByPost, setSubsByPost] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [togglingId, setTogglingId] = useState(null)

  useEffect(() => {
    async function load() {
      const s = getSession()
      if (!s?.user?.id) {
        router.replace('/login?next=/account/cofounder')
        return
      }
      setSession(s)
      setLoading(true)
      try {
        const postData = await supabaseFetch(`cofounder_posts?select=*&owner_id=eq.${s.user.id}&order=created_at.desc`)
        setPosts(postData || [])

        const ids = (postData || []).map(p => p.id)
        if (ids.length) {
          const subData = await supabaseFetch(`cofounder_subscriptions?select=*&post_id=in.(${ids.join(',')})&order=created_at.desc`)
          const map = {}
          ;(subData || []).forEach(sub => {
            if (!map[sub.post_id]) map[sub.post_id] = sub // latest first, keep only most recent
          })
          setSubsByPost(map)
        }
      } catch (e) {
        console.error(e)
        setError('Could not load your posts')
      }
      setLoading(false)
    }
    load()
  }, [router])

  const handleToggleFilled = async (post) => {
    setTogglingId(post.id)
    try {
      const next = !post.is_filled
      await supabaseFetch(`cofounder_posts?id=eq.${post.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_filled: next }),
      })
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_filled: next } : p))
    } catch (e) {
      console.error(e)
      setError('Could not update post')
    }
    setTogglingId(null)
  }

  if (session === undefined || loading) {
    return (
      <div style={{ background: theme.paper, minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: theme.inkSoft, fontSize: '14px' }}>Loading…</div>
      </div>
    )
  }

  return (
    <div style={{ background: theme.paper, minHeight: '70vh' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: 'clamp(20px,4vw,48px) clamp(16px,3vw,24px)' }}>
        <Link href="/account" style={{ fontSize: '13px', color: theme.inkSoft, textDecoration: 'none', display: 'inline-block', marginBottom: '18px' }}>← Account</Link>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div>
            <div style={{
              fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
              color: theme.brassDark, marginBottom: '8px', fontWeight: '600'
            }}>৳2000/year · First Month Free</div>
            <h1 style={{ fontFamily: theme.fontDisplay, fontSize: 'clamp(22px,2.8vw,30px)', fontWeight: '600', color: theme.ink }}>
              Find a Co-founder
            </h1>
          </div>
          <Link href="/cofounder/new" style={{
            display: 'inline-block', background: theme.brass, color: 'white', borderRadius: '8px',
            padding: '11px 18px', fontSize: '13.5px', fontWeight: '600', textDecoration: 'none', whiteSpace: 'nowrap'
          }}>+ New Post</Link>
        </div>

        {error && (
          <div style={{ marginBottom: '16px', padding: '11px 14px', background: theme.dangerSoft, color: theme.danger, borderRadius: '8px', fontSize: '13.5px' }}>
            {error}
          </div>
        )}

        {posts.length === 0 ? (
          <div style={{
            background: theme.surface, borderRadius: '12px', border: `1px solid ${theme.line}`,
            padding: '48px 24px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '34px', marginBottom: '12px' }}>🧩</div>
            <p style={{ fontSize: '14.5px', color: theme.inkSoft, marginBottom: '18px' }}>You haven't posted an idea yet.</p>
            <Link href="/cofounder/new" style={{
              display: 'inline-block', background: theme.brass, color: 'white', borderRadius: '8px',
              padding: '11px 22px', fontSize: '14px', fontWeight: '600', textDecoration: 'none'
            }}>Post Your Idea</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {posts.map(post => {
              const sub = subsByPost[post.id]
              const subStyle = sub ? (SUB_STATUS_STYLE[sub.status] || SUB_STATUS_STYLE.pending) : null
              const needsPayment = !sub || sub.status === 'rejected' || sub.status === 'expired'
              const isExpired = sub?.status === 'expired' || (sub?.status === 'active' && sub.ends_at && new Date(sub.ends_at) < new Date())

              return (
                <div key={post.id} style={{
                  background: theme.surface, borderRadius: '12px', border: `1px solid ${theme.line}`,
                  padding: 'clamp(18px,2.5vw,24px)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <Link href={`/cofounder/${post.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ fontFamily: theme.fontDisplay, fontSize: '18px', fontWeight: '600', color: theme.ink }}>
                        {post.idea_name}
                      </div>
                    </Link>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {post.is_filled && (
                        <div style={{
                          fontSize: '11px', fontWeight: '700', color: theme.inkSoft, background: theme.lineSoft,
                          padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap'
                        }}>Filled</div>
                      )}
                      {subStyle && (
                        <div style={{
                          fontSize: '11px', fontWeight: '700', color: subStyle.color, background: subStyle.bg,
                          padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap'
                        }}>{isExpired ? 'Expired' : subStyle.label}{sub?.plan === 'trial' && !isExpired ? ' · Trial' : ''}</div>
                      )}
                    </div>
                  </div>

                  {sub && sub.status === 'active' && sub.ends_at && (
                    <div style={{ fontSize: '12.5px', color: theme.inkSoft, marginBottom: '14px' }}>
                      {isExpired ? 'Subscription ended' : (sub.plan === 'trial' ? 'Free trial ends' : 'Renews / expires')} {formatDate(sub.ends_at)}
                    </div>
                  )}
                  {sub && sub.status === 'pending' && (
                    <div style={{ fontSize: '12.5px', color: theme.inkSoft, marginBottom: '14px' }}>
                      {sub.plan === 'trial' ? 'Free trial submitted, awaiting review' : 'Payment submitted, awaiting verification'} — usually within a few hours.
                    </div>
                  )}
                  {sub && sub.status === 'rejected' && (
                    <div style={{ fontSize: '12.5px', color: theme.danger, marginBottom: '14px' }}>
                      Your last submission was rejected. Please pay to activate this post.
                    </div>
                  )}
                  {sub && sub.status === 'expired' && (
                    <div style={{ fontSize: '12.5px', color: theme.danger, marginBottom: '14px' }}>
                      {sub.ends_at ? `${sub.plan === 'trial' ? 'Free trial' : 'Subscription'} ended ${formatDate(sub.ends_at)}. ` : ''}Pay ৳2000/year to make this post active again.
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Link href={`/cofounder/${post.id}`} style={{
                      fontSize: '13px', fontWeight: '600', color: theme.ink, textDecoration: 'none',
                      border: `1px solid ${theme.line}`, borderRadius: '7px', padding: '8px 14px'
                    }}>View Post</Link>
                    {(needsPayment || isExpired) && (
                      <Link href={`/payment/cofounder/${post.id}`} style={{
                        fontSize: '13px', fontWeight: '600', color: 'white', textDecoration: 'none',
                        background: theme.brass, borderRadius: '7px', padding: '8px 14px'
                      }}>{isExpired ? 'Renew' : 'Pay Now'}</Link>
                    )}
                    <button
                      onClick={() => handleToggleFilled(post)}
                      disabled={togglingId === post.id}
                      style={{
                        fontSize: '13px', fontWeight: '600', color: post.is_filled ? theme.signal : theme.inkSoft,
                        background: 'transparent', border: `1px solid ${theme.line}`, borderRadius: '7px',
                        padding: '8px 14px', cursor: togglingId === post.id ? 'default' : 'pointer',
                        opacity: togglingId === post.id ? 0.6 : 1
                      }}
                    >{post.is_filled ? 'Mark as Open' : 'Mark as Filled'}</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
