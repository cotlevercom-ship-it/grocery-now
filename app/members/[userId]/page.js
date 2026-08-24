'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabaseFetch, getSession } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import { sc } from '@/lib/memberTheme'
import VerifiedBadge from '@/components/VerifiedBadge'
import AppSidebar from '@/components/AppSidebar'
import AppBottomNav from '@/components/AppBottomNav'
import { IconUser, IconMail, IconPin, IconGlobe } from '@/components/ResumeIcons'

const accent = '#2563EB'

function SectionHeading({ icon, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', color: '#111827', fontSize: '13px', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        <span style={{ color: accent, display: 'flex' }}>{icon}</span>
        {children}
      </div>
      <div style={{ height: '1px', background: '#E5E7EB', marginTop: '8px' }} />
    </div>
  )
}

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

function PostAvatar({ profile, size = 44 }) {
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

function lookingForSentence(post, name) {
  if (!post.looking_for_type) return null
  const loc = post.looking_for_location ? ` at ${post.looking_for_location}` : ''
  const article = /^[aeiou]/i.test(post.looking_for_type) ? 'an' : 'a'
  return `${name || 'Someone'} is looking for ${article} ${post.looking_for_type}${loc}.`
}

// Recursive comment node — renders one comment plus its children, with a reply box.
function CommentNode({
  comment, childrenById, depth, profilesById, myUserId,
  openReplyIds, replyDrafts, onToggleReply, onReplyDraftChange, onSubmitReply, submittingReplyId,
}) {
  const profile = profilesById[comment.user_id]
  const kids = childrenById[comment.id] || []
  const isOpen = openReplyIds.has(comment.id)
  const indent = Math.min(depth, 6) * 20

  return (
    <div style={{ marginLeft: `${indent}px`, marginTop: '10px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Link href={`/members/${comment.user_id}`} style={{ flexShrink: 0 }}>
          <PostAvatar profile={profile} size={28} />
        </Link>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ background: sc.bg, borderRadius: '12px', padding: '7px 12px', display: 'inline-block', maxWidth: '100%' }}>
            <Link href={`/members/${comment.user_id}`} style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: sc.text }}>
                {profile?.display_name || 'Cot Lever member'}
              </span>
            </Link>
            <div style={{ fontSize: '13.5px', color: sc.text, whiteSpace: 'pre-wrap', marginTop: '1px' }}>{comment.content}</div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '3px', paddingLeft: '4px' }}>
            <span style={{ fontSize: '11px', color: sc.textFaint }}>{timeAgo(comment.created_at)}</span>
            {myUserId && (
              <button
                type="button"
                onClick={() => onToggleReply(comment.id)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '11.5px', fontWeight: '700', color: sc.textSoft }}
              >Reply</button>
            )}
          </div>

          {isOpen && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <input
                type="text"
                value={replyDrafts[comment.id] || ''}
                onChange={e => onReplyDraftChange(comment.id, e.target.value)}
                placeholder="Write a reply…"
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmitReply(comment.post_id, comment.id) } }}
                style={{
                  flex: 1, boxSizing: 'border-box', border: `1px solid ${sc.line}`, borderRadius: '999px',
                  padding: '6px 12px', fontSize: '13px', fontFamily: theme.fontBody, color: sc.text, background: sc.cardBg,
                }}
              />
              <button
                type="button"
                onClick={() => onSubmitReply(comment.post_id, comment.id)}
                disabled={submittingReplyId === comment.id || !(replyDrafts[comment.id] || '').trim()}
                style={{
                  background: theme.brass, color: '#FFFFFF', border: 'none', borderRadius: '999px',
                  padding: '6px 14px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', flexShrink: 0,
                }}
              >Send</button>
            </div>
          )}
        </div>
      </div>

      {kids.map(child => (
        <CommentNode
          key={child.id}
          comment={child}
          childrenById={childrenById}
          depth={depth + 1}
          profilesById={profilesById}
          myUserId={myUserId}
          openReplyIds={openReplyIds}
          replyDrafts={replyDrafts}
          onToggleReply={onToggleReply}
          onReplyDraftChange={onReplyDraftChange}
          onSubmitReply={onSubmitReply}
          submittingReplyId={submittingReplyId}
        />
      ))}
    </div>
  )
}

export default function MemberProfileViewPage() {
  const { userId } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [myUserId, setMyUserId] = useState(null)
  const [myProfile, setMyProfile] = useState(null)

  // Posts + interactions
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [likeCounts, setLikeCounts] = useState({})
  const [myLikes, setMyLikes] = useState(new Set())
  const [commentCounts, setCommentCounts] = useState({})
  const [profilesById, setProfilesById] = useState({})

  const [commentsByPost, setCommentsByPost] = useState({})
  const [openComments, setOpenComments] = useState(new Set())
  const [loadingComments, setLoadingComments] = useState(new Set())
  const [newCommentDrafts, setNewCommentDrafts] = useState({})
  const [openReplyIds, setOpenReplyIds] = useState(new Set())
  const [replyDrafts, setReplyDrafts] = useState({})
  const [submittingReplyId, setSubmittingReplyId] = useState(null)
  const [error, setError] = useState('')

  const [connection, setConnection] = useState(null) // { id, status, requester_id } | null
  const [connBusy, setConnBusy] = useState(false)
  const [bookmarkId, setBookmarkId] = useState(null)
  const [bookmarkBusy, setBookmarkBusy] = useState(false)

  const mergeProfiles = useCallback(async (userIds) => {
    setProfilesById(prevMap => {
      const missing = [...new Set(userIds)].filter(id => id && !prevMap[id])
      if (missing.length > 0) {
        const inList = missing.map(id => `"${id}"`).join(',')
        supabaseFetch(`member_profiles_public?select=user_id,display_name,photo_url,location&user_id=in.(${inList})`)
          .then(rows => {
            setProfilesById(prev => {
              const next = { ...prev }
              for (const p of (rows || [])) next[p.user_id] = p
              return next
            })
          })
          .catch(e => console.error(e))
      }
      return prevMap
    })
  }, [])

  useEffect(() => {
    const session = getSession()
    const uid = session?.user?.id || null
    setMyUserId(uid)
    if (uid) {
      supabaseFetch(`member_profiles?select=display_name,photo_url,is_premium&user_id=eq.${uid}`)
        .then(rows => setMyProfile(rows?.[0] || null))
        .catch(e => console.error(e))
    }

    async function load() {
      setLoading(true)
      try {
        const rows = await supabaseFetch(`member_profiles_public?select=*&user_id=eq.${userId}`)
        setProfile(rows?.[0] || null)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)

      if (uid && uid !== userId) {
        supabaseFetch('rpc/increment_profile_view', {
          method: 'POST', body: JSON.stringify({ target_user_id: userId }),
        }).catch(e => console.error(e))

        supabaseFetch(`connections?select=id,status,requester_id&or=(and(requester_id.eq.${uid},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${uid}))`)
          .then(rows => setConnection(rows?.[0] || null))
          .catch(e => console.error(e))

        supabaseFetch(`bookmarks?select=id&user_id=eq.${uid}&bookmarked_user_id=eq.${userId}`)
          .then(rows => setBookmarkId(rows?.[0]?.id || null))
          .catch(e => console.error(e))
      }
    }

    async function loadPosts() {
      setPostsLoading(true)
      try {
        const postRows = await supabaseFetch(`posts?select=*&user_id=eq.${userId}&order=created_at.desc&limit=50`)
        setPosts(postRows || [])

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

          const commentRows = await supabaseFetch(`post_comments?select=post_id&post_id=in.(${inList})`)
          const cCounts = {}
          for (const c of (commentRows || [])) cCounts[c.post_id] = (cCounts[c.post_id] || 0) + 1
          setCommentCounts(cCounts)
        } else {
          setLikeCounts({})
          setMyLikes(new Set())
          setCommentCounts({})
        }
      } catch (e) {
        console.error(e)
      }
      setPostsLoading(false)
    }

    if (userId) { load(); loadPosts() }
  }, [userId])

  const sendConnectRequest = async () => {
    if (!myUserId) { setError('Please log in to send a connection request.'); return }
    setConnBusy(true)
    try {
      const rows = await supabaseFetch('connections', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ requester_id: myUserId, addressee_id: userId }),
      })
      setConnection(rows?.[0] || { status: 'pending', requester_id: myUserId })
    } catch (e) { console.error(e) }
    setConnBusy(false)
  }

  const cancelConnectRequest = async () => {
    if (!connection?.id) return
    setConnBusy(true)
    try {
      await supabaseFetch(`connections?id=eq.${connection.id}`, { method: 'DELETE' })
      setConnection(null)
    } catch (e) { console.error(e) }
    setConnBusy(false)
  }

  const respondToConnectRequest = async (accept) => {
    if (!connection?.id) return
    setConnBusy(true)
    try {
      if (accept) {
        await supabaseFetch(`connections?id=eq.${connection.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'accepted', responded_at: new Date().toISOString() }),
        })
        setConnection(prev => ({ ...prev, status: 'accepted' }))
      } else {
        await supabaseFetch(`connections?id=eq.${connection.id}`, { method: 'DELETE' })
        setConnection(null)
      }
    } catch (e) { console.error(e) }
    setConnBusy(false)
  }

  const toggleBookmark = async () => {
    if (!myUserId) { setError('Please log in to bookmark profiles.'); return }
    setBookmarkBusy(true)
    try {
      if (bookmarkId) {
        await supabaseFetch(`bookmarks?id=eq.${bookmarkId}`, { method: 'DELETE' })
        setBookmarkId(null)
      } else {
        const rows = await supabaseFetch('bookmarks', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({ user_id: myUserId, bookmarked_user_id: userId }),
        })
        setBookmarkId(rows?.[0]?.id || true)
      }
    } catch (e) { console.error(e) }
    setBookmarkBusy(false)
  }

  const toggleLike = async (postId) => {
    if (!myUserId) { setError('Please log in to like posts.'); return }
    const alreadyLiked = myLikes.has(postId)

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
        if (profile && profile.user_id !== myUserId) {
          supabaseFetch('notifications', {
            method: 'POST',
            body: JSON.stringify({ recipient_id: profile.user_id, actor_id: myUserId, type: 'like', post_id: postId }),
          }).catch(e => console.error(e))
        }
      }
    } catch (e) {
      console.error(e)
      setMyLikes(prev => {
        const next = new Set(prev)
        alreadyLiked ? next.add(postId) : next.delete(postId)
        return next
      })
      setLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + (alreadyLiked ? 1 : -1) }))
    }
  }

  const loadComments = useCallback(async (postId) => {
    setLoadingComments(prev => new Set(prev).add(postId))
    try {
      const rows = await supabaseFetch(`post_comments?select=*&post_id=eq.${postId}&order=created_at.asc`)
      setCommentsByPost(prev => ({ ...prev, [postId]: rows || [] }))
      await mergeProfiles((rows || []).map(r => r.user_id))
    } catch (e) {
      console.error(e)
    }
    setLoadingComments(prev => { const next = new Set(prev); next.delete(postId); return next })
  }, [mergeProfiles])

  const toggleComments = (postId) => {
    setOpenComments(prev => {
      const next = new Set(prev)
      if (next.has(postId)) {
        next.delete(postId)
      } else {
        next.add(postId)
        if (!commentsByPost[postId]) loadComments(postId)
      }
      return next
    })
  }

  const submitNewComment = async (postId) => {
    const content = (newCommentDrafts[postId] || '').trim()
    if (!content) return
    if (!myUserId) { setError('Please log in to comment.'); return }
    try {
      await supabaseFetch('post_comments', {
        method: 'POST',
        body: JSON.stringify({ post_id: postId, user_id: myUserId, parent_comment_id: null, content }),
      })
      setNewCommentDrafts(prev => ({ ...prev, [postId]: '' }))
      setCommentCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }))
      if (profile && profile.user_id !== myUserId) {
        supabaseFetch('notifications', {
          method: 'POST',
          body: JSON.stringify({ recipient_id: profile.user_id, actor_id: myUserId, type: 'comment', post_id: postId }),
        }).catch(e => console.error(e))
      }
      await loadComments(postId)
    } catch (e) {
      console.error(e)
      setError('Could not post comment, please try again.')
    }
  }

  const toggleReply = (commentId) => {
    setOpenReplyIds(prev => {
      const next = new Set(prev)
      next.has(commentId) ? next.delete(commentId) : next.add(commentId)
      return next
    })
  }

  const submitReply = async (postId, parentCommentId) => {
    const content = (replyDrafts[parentCommentId] || '').trim()
    if (!content) return
    if (!myUserId) { setError('Please log in to reply.'); return }
    setSubmittingReplyId(parentCommentId)
    try {
      await supabaseFetch('post_comments', {
        method: 'POST',
        body: JSON.stringify({ post_id: postId, user_id: myUserId, parent_comment_id: parentCommentId, content }),
      })
      setReplyDrafts(prev => ({ ...prev, [parentCommentId]: '' }))
      setOpenReplyIds(prev => { const next = new Set(prev); next.delete(parentCommentId); return next })
      setCommentCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }))
      const parentComment = (commentsByPost[postId] || []).find(c => c.id === parentCommentId)
      if (parentComment && parentComment.user_id !== myUserId) {
        supabaseFetch('notifications', {
          method: 'POST',
          body: JSON.stringify({ recipient_id: parentComment.user_id, actor_id: myUserId, type: 'reply', post_id: postId, comment_id: parentCommentId }),
        }).catch(e => console.error(e))
      }
      await loadComments(postId)
    } catch (e) {
      console.error(e)
      setError('Could not post reply, please try again.')
    }
    setSubmittingReplyId(null)
  }

  const initial = (profile?.display_name || '?').trim().charAt(0).toUpperCase()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: sc.bg }}>
      <AppSidebar active="discover" />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: 'clamp(16px,3vw,32px)' }}>
          <Link href="/feed" style={{ fontSize: '13px', color: sc.textSoft, textDecoration: 'none', display: 'inline-block', marginBottom: '16px' }}>
            ← Back to Feed
          </Link>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: sc.textSoft, fontSize: '14px' }}>Loading…</div>
          ) : !profile ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: sc.textSoft, fontSize: '14px' }}>
              Profile not found or not currently visible.
            </div>
          ) : (myUserId !== profile.user_id && !myProfile?.is_premium) ? (
            <div style={{
              background: '#FFFFFF', borderRadius: '14px', padding: '48px 24px', textAlign: 'center',
              boxShadow: '0 1px 3px rgba(16,24,40,0.06), 0 8px 28px rgba(16,24,40,0.06)',
            }}>
              <PostAvatar profile={profile} size={72} />
              <div style={{ marginTop: '14px', fontSize: '18px', fontWeight: '700', color: '#111827' }}>{profile.display_name}</div>
              {profile.role_title && <div style={{ fontSize: '13.5px', color: accent, fontWeight: '600', marginTop: '2px' }}>{profile.role_title}</div>}
              <div style={{ fontSize: '14px', color: sc.textSoft, margin: '18px auto 20px', maxWidth: '360px', lineHeight: '1.6' }}>
                🔒 Viewing full profiles is a <b style={{ color: theme.brass }}>Premium</b> feature. Upgrade to see experience, education, projects, and contact details.
              </div>
              <Link href="/account" style={{
                display: 'inline-block', background: theme.brass, color: '#FFFFFF', textDecoration: 'none',
                padding: '12px 26px', borderRadius: '999px', fontSize: '14px', fontWeight: '700',
              }}>Upgrade to Premium</Link>
            </div>
          ) : (
            <div className="resume-sheet" style={{
              display: 'flex', background: '#FFFFFF', borderRadius: '14px',
              boxShadow: '0 1px 3px rgba(16,24,40,0.06), 0 8px 28px rgba(16,24,40,0.06)', overflow: 'hidden',
            }}>
              {/* Left column */}
              <div className="resume-side" style={{ width: '260px', flexShrink: 0, background: '#F6F7F9', padding: '32px 24px', borderRight: '1px solid #ECEDF0' }}>
                <div style={{
                  width: '104px', height: '104px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto',
                  background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {profile.photo_url ? (
                    <img src={profile.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontFamily: theme.fontDisplay, fontSize: '38px', fontWeight: '600', color: '#FFFFFF' }}>{initial}</span>
                  )}
                </div>
                <div style={{ textAlign: 'center', marginTop: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '19px', fontWeight: '700', color: '#111827' }}>
                    {profile.display_name}
                    {profile.verified && <VerifiedBadge />}
                  </div>
                </div>

                <div style={{ marginTop: '26px', display: 'flex', flexDirection: 'column', gap: '11px' }}>
                  {profile.contact_email && (
                    <a href={`mailto:${profile.contact_email}`} style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '12.5px', color: '#374151', textDecoration: 'none', wordBreak: 'break-all' }}>
                      <IconMail color="#6B7280" /> {profile.contact_email}
                    </a>
                  )}
                  {profile.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '12.5px', color: '#374151' }}>
                      <IconPin color="#6B7280" /> {profile.location}
                    </div>
                  )}
                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '12.5px', color: accent, textDecoration: 'none', wordBreak: 'break-all' }}>
                      <IconGlobe color={accent} /> LinkedIn
                    </a>
                  )}
                </div>
              </div>

              {/* Right column */}
              <div style={{ flex: 1, minWidth: 0, padding: '32px 30px' }}>
                {profile.bio && (
                  <div style={{ marginBottom: '26px' }}>
                    <SectionHeading icon={<IconUser />}>About Me</SectionHeading>
                    <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.7, margin: 0 }}>{profile.bio}</p>
                  </div>
                )}

                {myUserId && myUserId !== profile.user_id && (
                  <div style={{ marginTop: '28px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Link
                      href={`/messages/${profile.user_id}`}
                      style={{
                        flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        background: accent, color: '#FFFFFF', fontFamily: theme.fontBody,
                        borderRadius: '10px', padding: '11px 12px', fontSize: '13px', fontWeight: '700',
                        textDecoration: 'none', minWidth: '110px',
                      }}
                    >💬 Message</Link>

                    {!connection && (
                      <button type="button" onClick={sendConnectRequest} disabled={connBusy} style={{
                        flex: 1, minWidth: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        background: 'transparent', color: '#111827', fontFamily: theme.fontBody,
                        border: '1px solid #E5E7EB', borderRadius: '10px', padding: '11px 12px', fontSize: '13px', fontWeight: '700',
                        cursor: connBusy ? 'default' : 'pointer',
                      }}>🤝 Connect</button>
                    )}
                    {connection?.status === 'pending' && connection.requester_id === myUserId && (
                      <button type="button" onClick={cancelConnectRequest} disabled={connBusy} style={{
                        flex: 1, minWidth: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        background: 'transparent', color: '#6B7280', fontFamily: theme.fontBody,
                        border: '1px solid #E5E7EB', borderRadius: '10px', padding: '11px 12px', fontSize: '13px', fontWeight: '700',
                        cursor: connBusy ? 'default' : 'pointer',
                      }}>Cancel Request</button>
                    )}
                    {connection?.status === 'pending' && connection.requester_id !== myUserId && (
                      <>
                        <button type="button" onClick={() => respondToConnectRequest(true)} disabled={connBusy} style={{
                          flex: 1, minWidth: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          background: theme.brass, color: '#FFFFFF', fontFamily: theme.fontBody,
                          border: 'none', borderRadius: '10px', padding: '11px 12px', fontSize: '13px', fontWeight: '700',
                          cursor: connBusy ? 'default' : 'pointer',
                        }}>Accept</button>
                        <button type="button" onClick={() => respondToConnectRequest(false)} disabled={connBusy} style={{
                          flex: 1, minWidth: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          background: 'transparent', color: '#6B7280', fontFamily: theme.fontBody,
                          border: '1px solid #E5E7EB', borderRadius: '10px', padding: '11px 12px', fontSize: '13px', fontWeight: '700',
                          cursor: connBusy ? 'default' : 'pointer',
                        }}>Decline</button>
                      </>
                    )}
                    {connection?.status === 'accepted' && (
                      <button type="button" disabled style={{
                        flex: 1, minWidth: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        background: '#E9F5EE', color: '#2F7A50', fontFamily: theme.fontBody,
                        border: 'none', borderRadius: '10px', padding: '11px 12px', fontSize: '13px', fontWeight: '700',
                      }}>✓ Connected</button>
                    )}

                    <button type="button" onClick={toggleBookmark} disabled={bookmarkBusy} aria-label="Bookmark" style={{
                      width: '44px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: bookmarkId ? theme.brass : 'transparent', color: bookmarkId ? '#FFFFFF' : '#111827',
                      border: `1px solid ${bookmarkId ? theme.brass : '#E5E7EB'}`, borderRadius: '10px', fontSize: '15px',
                      cursor: bookmarkBusy ? 'default' : 'pointer',
                    }}>{bookmarkId ? '🔖' : '📑'}</button>

                    {profile.contact_email && (
                      <a
                        href={`mailto:${profile.contact_email}`}
                        style={{
                          flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          background: 'transparent', color: '#111827', fontFamily: theme.fontBody,
                          border: '1px solid #E5E7EB', borderRadius: '10px', padding: '11px 12px', fontSize: '13px', fontWeight: '700',
                          textDecoration: 'none', minWidth: '110px',
                        }}
                      >📧 Email</a>
                    )}
                    {profile.linkedin_url && (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          background: 'transparent', color: '#111827', fontFamily: theme.fontBody,
                          border: '1px solid #E5E7EB', borderRadius: '10px', padding: '11px 12px', fontSize: '13px', fontWeight: '700',
                          textDecoration: 'none', minWidth: '110px',
                        }}
                      >🔗 LinkedIn</a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && profile && (
            <div style={{ marginTop: '24px' }}>
              <h2 style={{
                fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: '17px',
                color: sc.text, marginBottom: '12px',
              }}>Posts</h2>

              {error && (
                <div style={{ marginBottom: '10px', fontSize: '12.5px', color: theme.brass }}>{error}</div>
              )}

              {postsLoading ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: sc.textSoft, fontSize: '13.5px' }}>Loading…</div>
              ) : posts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: sc.textSoft, fontSize: '13.5px' }}>
                  No posts yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {posts.map(post => {
                    const sentence = lookingForSentence(post, profile.display_name)
                    const liked = myLikes.has(post.id)
                    const count = likeCounts[post.id] || 0
                    const cCount = commentCounts[post.id] || 0
                    const commentsOpen = openComments.has(post.id)

                    const flatComments = commentsByPost[post.id] || []
                    const childrenById = {}
                    const topLevel = []
                    for (const c of flatComments) {
                      if (c.parent_comment_id) {
                        if (!childrenById[c.parent_comment_id]) childrenById[c.parent_comment_id] = []
                        childrenById[c.parent_comment_id].push(c)
                      } else {
                        topLevel.push(c)
                      }
                    }

                    return (
                      <div key={post.id} style={{ background: sc.cardBg, borderRadius: '14px', boxShadow: sc.shadow, padding: '16px' }}>
                        <div style={{ fontSize: '11.5px', color: sc.textFaint, marginBottom: '8px' }}>{timeAgo(post.created_at)}</div>
                        {sentence && (
                          <div style={{
                            fontSize: '13.5px', fontWeight: '700', color: theme.brass, marginBottom: '10px',
                            background: 'rgba(179,55,42,0.07)', borderRadius: '8px', padding: '8px 12px',
                          }}>{sentence}</div>
                        )}
                        <div style={{ fontSize: '14px', color: sc.text, lineHeight: '1.55', whiteSpace: 'pre-wrap' }}>
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
                          <button
                            type="button"
                            onClick={() => toggleComments(post.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none',
                              cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: sc.textSoft,
                            }}
                          >
                            <span>💬</span> Comment{cCount > 0 ? ` · ${cCount}` : ''}
                          </button>
                        </div>

                        {commentsOpen && (
                          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${sc.line}` }}>
                            {loadingComments.has(post.id) && !commentsByPost[post.id] ? (
                              <div style={{ fontSize: '13px', color: sc.textSoft, padding: '8px 0' }}>Loading comments…</div>
                            ) : (
                              topLevel.map(c => (
                                <CommentNode
                                  key={c.id}
                                  comment={c}
                                  childrenById={childrenById}
                                  depth={0}
                                  profilesById={{ ...profilesById, [profile.user_id]: profile }}
                                  myUserId={myUserId}
                                  openReplyIds={openReplyIds}
                                  replyDrafts={replyDrafts}
                                  onToggleReply={toggleReply}
                                  onReplyDraftChange={(id, val) => setReplyDrafts(prev => ({ ...prev, [id]: val }))}
                                  onSubmitReply={submitReply}
                                  submittingReplyId={submittingReplyId}
                                />
                              ))
                            )}

                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                              <PostAvatar profile={myProfile} size={28} />
                              <input
                                type="text"
                                value={newCommentDrafts[post.id] || ''}
                                onChange={e => setNewCommentDrafts(prev => ({ ...prev, [post.id]: e.target.value }))}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitNewComment(post.id) } }}
                                placeholder={myUserId ? 'Write a comment…' : 'Log in to comment'}
                                disabled={!myUserId}
                                style={{
                                  flex: 1, boxSizing: 'border-box', border: `1px solid ${sc.line}`, borderRadius: '999px',
                                  padding: '7px 14px', fontSize: '13px', fontFamily: theme.fontBody, color: sc.text, background: sc.bg,
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => submitNewComment(post.id)}
                                disabled={!myUserId || !(newCommentDrafts[post.id] || '').trim()}
                                style={{
                                  background: theme.brass, color: '#FFFFFF', border: 'none', borderRadius: '999px',
                                  padding: '7px 16px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', flexShrink: 0,
                                }}
                              >Send</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AppBottomNav active="discover" />

      <style jsx>{`
        @media (max-width: 700px) {
          .resume-sheet { flex-direction: column; border-radius: 0; }
          .resume-side { width: 100% !important; border-right: none !important; border-bottom: 1px solid #ECEDF0; }
        }
      `}</style>
      <style jsx global>{`
        @media (max-width: 860px) {
          body { padding-bottom: 62px; }
        }
      `}</style>
    </div>
  )
}
