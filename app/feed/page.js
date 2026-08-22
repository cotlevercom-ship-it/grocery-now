'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabaseFetch, getSession } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import { sc } from '@/lib/memberTheme'
import AppSidebar from '@/components/AppSidebar'
import AppBottomNav from '@/components/AppBottomNav'

function timeAgo(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo`
  return `${Math.floor(months / 12)}y`
}

function Avatar({ profile, size = 44 }) {
  const initial = (profile?.display_name || '?').trim().charAt(0).toUpperCase()
  return (
    <div style={{
      width: `${size}px`, height: `${size}px`, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      background: theme.brass, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {profile?.photo_url ? (
        <img src={profile.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ fontFamily: theme.fontDisplay, fontSize: `${Math.round(size * 0.4)}px`, fontWeight: '600', color: '#FFFFFF' }}>{initial}</span>
      )}
    </div>
  )
}

export default function FeedPage() {
  const [myUserId, setMyUserId] = useState(null)
  const [myProfile, setMyProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [profilesById, setProfilesById] = useState({})
  const [likeCounts, setLikeCounts] = useState({})
  const [myLikes, setMyLikes] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')

  const loadFeed = useCallback(async (uid) => {
    setLoading(true)
    try {
      const postRows = await supabaseFetch('posts?select=*&order=created_at.desc&limit=50')
      setPosts(postRows || [])

      const userIds = [...new Set((postRows || []).map(p => p.user_id))]
      if (userIds.length > 0) {
        const inList = userIds.map(id => `"${id}"`).join(',')
        const profileRows = await supabaseFetch(`member_profiles?select=user_id,display_name,photo_url,location&user_id=in.(${inList})`)
        const byId = {}
        for (const p of (profileRows || [])) byId[p.user_id] = p
        setProfilesById(byId)
      } else {
        setProfilesById({})
      }

      const postIds = (postRows || []).map(p => p.id)
      if (postIds.length > 0) {
        const inList = postIds.map(id => `"${id}"`).join(',')
        const likeRows = await supabaseFetch(`post_likes?select=post_id,user_id&post_id=in.(${inList})`)
        const counts = {}
        const mine = new Set()
        for (const l of (likeRows || [])) {
          counts[l.post_id] = (counts[l.post_id] || 0) + 1
          if (uid && l.user_id === uid) mine.add(l.post_id)
        }
        setLikeCounts(counts)
        setMyLikes(mine)
      } else {
        setLikeCounts({})
        setMyLikes(new Set())
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const session = getSession()
    const uid = session?.user?.id || null
    setMyUserId(uid)
    if (uid) {
      supabaseFetch(`member_profiles?select=display_name,photo_url&user_id=eq.${uid}`)
        .then(rows => setMyProfile(rows?.[0] || null))
        .catch(e => console.error(e))
    }
    loadFeed(uid)
  }, [loadFeed])

  const handlePost = async () => {
    const content = draft.trim()
    if (!content) return
    if (!myUserId) { setError('Please log in to post.'); return }
    setError('')
    setPosting(true)
    try {
      await supabaseFetch('posts', {
        method: 'POST',
        body: JSON.stringify({ user_id: myUserId, content }),
      })
      setDraft('')
      await loadFeed(myUserId)
    } catch (e) {
      console.error(e)
      setError('Could not post, please try again.')
    }
    setPosting(false)
  }

  const toggleLike = async (postId) => {
    if (!myUserId) { setError('Please log in to like posts.'); return }
    const alreadyLiked = myLikes.has(postId)

    // Optimistic update
    setMyLikes(prev => {
      const next = new Set(prev)
      alreadyLiked ? next.delete(postId) : next.add(postId)
      return next
    })
    setLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + (alreadyLiked ? -1 : 1) }))

    try {
      if (alreadyLiked) {
        await supabaseFetch(`post_likes?post_id=eq.${postId}&user_id=eq.${myUserId}`, { method: 'DELETE' })
      } else {
        await supabaseFetch('post_likes', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify({ post_id: postId, user_id: myUserId }),
        })
      }
    } catch (e) {
      console.error(e)
      // Revert on failure
      setMyLikes(prev => {
        const next = new Set(prev)
        alreadyLiked ? next.add(postId) : next.delete(postId)
        return next
      })
      setLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + (alreadyLiked ? 1 : -1) }))
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: sc.bg }}>
      <AppSidebar active="feed" />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'clamp(20px,3vw,40px) clamp(16px,3vw,24px)' }}>
          <h1 style={{
            fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(22px,2.6vw,28px)',
            color: sc.text, marginBottom: '18px', letterSpacing: '-0.01em'
          }}>Feed</h1>

          {/* Composer */}
          <div style={{
            background: sc.cardBg, borderRadius: '14px', boxShadow: sc.shadow, padding: '16px', marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Avatar profile={myProfile} size={40} />
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Share something with the community…"
                rows={2}
                style={{
                  flex: 1, boxSizing: 'border-box', border: `1px solid ${sc.line}`, borderRadius: '10px',
                  padding: '10px 12px', fontSize: '14px', fontFamily: theme.fontBody, color: sc.text,
                  background: sc.bg, resize: 'vertical', minHeight: '44px',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                type="button"
                onClick={handlePost}
                disabled={posting || !draft.trim()}
                style={{
                  background: (posting || !draft.trim()) ? sc.line : theme.brass, color: '#FFFFFF',
                  border: 'none', borderRadius: '999px', padding: '9px 20px', fontSize: '13px', fontWeight: '700',
                  cursor: (posting || !draft.trim()) ? 'default' : 'pointer',
                }}
              >{posting ? 'Posting…' : 'Post'}</button>
            </div>
            {error && (
              <div style={{ marginTop: '10px', fontSize: '12.5px', color: theme.brass }}>{error}</div>
            )}
          </div>

          {/* Feed list */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: sc.textSoft, fontSize: '14px' }}>Loading…</div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: sc.textSoft, fontSize: '14px' }}>
              No posts yet — be the first to share something.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {posts.map(post => {
                const profile = profilesById[post.user_id]
                const liked = myLikes.has(post.id)
                const count = likeCounts[post.id] || 0
                return (
                  <div key={post.id} style={{ background: sc.cardBg, borderRadius: '14px', boxShadow: sc.shadow, padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Link href={`/members/${post.user_id}`} style={{ flexShrink: 0 }}>
                        <Avatar profile={profile} size={44} />
                      </Link>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <Link href={`/members/${post.user_id}`} style={{ textDecoration: 'none' }}>
                          <div style={{ fontSize: '14.5px', fontWeight: '700', color: sc.text }}>
                            {profile?.display_name || 'Cot Lever member'}
                          </div>
                        </Link>
                        <div style={{ fontSize: '12px', color: sc.textSoft }}>
                          {profile?.location || ''}
                        </div>
                        <div style={{ fontSize: '11.5px', color: sc.textFaint, marginTop: '1px' }}>{timeAgo(post.created_at)}</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '14px', color: sc.text, lineHeight: '1.55', marginTop: '12px', whiteSpace: 'pre-wrap' }}>
                      {post.content}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: '14px', paddingTop: '10px', borderTop: `1px solid ${sc.line}` }}>
                      <button
                        type="button"
                        onClick={() => toggleLike(post.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none',
                          cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                          color: liked ? theme.brass : sc.textSoft,
                        }}
                      >
                        <span>{liked ? '👍' : '🤍'}</span> Like{count > 0 ? ` · ${count}` : ''}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <AppBottomNav active="feed" />

      <style jsx global>{`
        @media (max-width: 860px) {
          body { padding-bottom: 62px; }
        }
      `}</style>
    </div>
  )
}
