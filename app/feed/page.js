'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabaseFetch, getSession } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import { sc } from '@/lib/memberTheme'
import AppSidebar from '@/components/AppSidebar'
import AppBottomNav from '@/components/AppBottomNav'

const LOOKING_FOR_OPTIONS = ['Investor', 'Co-founder', 'Team Member', 'Mentor', 'Advisor', 'Partner']
const CUSTOM_LOOKING_FOR = '__custom__'

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

function lookingForSentence(post, profile) {
  if (!post.looking_for_type) return null
  const name = profile?.display_name || 'Someone'
  const loc = post.looking_for_location ? ` at ${post.looking_for_location}` : ''
  const article = /^[aeiou]/i.test(post.looking_for_type) ? 'an' : 'a'
  return `${name} is looking for ${article} ${post.looking_for_type}${loc}.`
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
          <Avatar profile={profile} size={28} />
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

export default function FeedPage() {
  const [myUserId, setMyUserId] = useState(null)
  const [myProfile, setMyProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [profilesById, setProfilesById] = useState({})
  const [likeCounts, setLikeCounts] = useState({})
  const [myLikes, setMyLikes] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [lookingForType, setLookingForType] = useState('')
  const [lookingForCustomText, setLookingForCustomText] = useState('')
  const [lookingForLocation, setLookingForLocation] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')

  // Comments
  const [commentsByPost, setCommentsByPost] = useState({})
  const [commentCounts, setCommentCounts] = useState({})
  const [openComments, setOpenComments] = useState(new Set())
  const [loadingComments, setLoadingComments] = useState(new Set())
  const [newCommentDrafts, setNewCommentDrafts] = useState({})
  const [openReplyIds, setOpenReplyIds] = useState(new Set())
  const [replyDrafts, setReplyDrafts] = useState({})
  const [submittingReplyId, setSubmittingReplyId] = useState(null)

  const mergeProfiles = useCallback(async (userIds) => {
    const missing = [...new Set(userIds)].filter(id => id && !profilesById[id])
    if (missing.length === 0) return
    const inList = missing.map(id => `"${id}"`).join(',')
    const rows = await supabaseFetch(`member_profiles?select=user_id,display_name,photo_url,location&user_id=in.(${inList})`)
    setProfilesById(prev => {
      const next = { ...prev }
      for (const p of (rows || [])) next[p.user_id] = p
      return next
    })
  }, [profilesById])

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
    const resolvedLookingFor = lookingForType === CUSTOM_LOOKING_FOR
      ? lookingForCustomText.trim()
      : lookingForType
    setError('')
    setPosting(true)
    try {
      await supabaseFetch('posts', {
        method: 'POST',
        body: JSON.stringify({
          user_id: myUserId,
          content,
          looking_for_type: resolvedLookingFor || null,
          looking_for_location: resolvedLookingFor ? (lookingForLocation.trim() || null) : null,
        }),
      })
      setDraft('')
      setLookingForType('')
      setLookingForCustomText('')
      setLookingForLocation('')
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
        const post = posts.find(p => p.id === postId)
        if (post && post.user_id !== myUserId) {
          supabaseFetch('notifications', {
            method: 'POST',
            body: JSON.stringify({ recipient_id: post.user_id, actor_id: myUserId, type: 'like', post_id: postId }),
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
      const post = posts.find(p => p.id === postId)
      if (post && post.user_id !== myUserId) {
        supabaseFetch('notifications', {
          method: 'POST',
          body: JSON.stringify({ recipient_id: post.user_id, actor_id: myUserId, type: 'comment', post_id: postId }),
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
            background: sc.cardBg, borderRadius: '12px', boxShadow: sc.shadow, padding: '10px', marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Avatar profile={myProfile} size={32} />
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Share your idea…"
                rows={1}
                style={{
                  flex: 1, boxSizing: 'border-box', border: `1px solid ${sc.line}`, borderRadius: '8px',
                  padding: '7px 10px', fontSize: '13.5px', fontFamily: theme.fontBody, color: sc.text,
                  background: sc.bg, resize: 'vertical', minHeight: '32px',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', marginLeft: '40px', flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                value={lookingForType}
                onChange={e => setLookingForType(e.target.value)}
                style={{
                  border: `1px solid ${sc.line}`, borderRadius: '7px', padding: '5px 6px', fontSize: '12px',
                  fontFamily: theme.fontBody, color: sc.text, background: sc.bg, maxWidth: '100%',
                }}
              >
                <option value="">Not looking for anything</option>
                {LOOKING_FOR_OPTIONS.map(opt => <option key={opt} value={opt}>Looking for a {opt}</option>)}
                <option value={CUSTOM_LOOKING_FOR}>Custom…</option>
              </select>
              {lookingForType === CUSTOM_LOOKING_FOR && (
                <input
                  type="text"
                  value={lookingForCustomText}
                  onChange={e => setLookingForCustomText(e.target.value)}
                  placeholder="What are you looking for?"
                  style={{
                    border: `1px solid ${sc.line}`, borderRadius: '7px', padding: '5px 8px', fontSize: '12px',
                    fontFamily: theme.fontBody, color: sc.text, background: sc.bg, flex: 1, minWidth: '110px',
                  }}
                />
              )}
              {lookingForType && (
                <input
                  type="text"
                  value={lookingForLocation}
                  onChange={e => setLookingForLocation(e.target.value)}
                  placeholder="Location"
                  style={{
                    border: `1px solid ${sc.line}`, borderRadius: '7px', padding: '5px 8px', fontSize: '12px',
                    fontFamily: theme.fontBody, color: sc.text, background: sc.bg, flex: 1, minWidth: '90px',
                  }}
                />
              )}
              <button
                type="button"
                onClick={handlePost}
                disabled={posting || !draft.trim()}
                style={{
                  background: (posting || !draft.trim()) ? sc.line : theme.brass, color: '#FFFFFF',
                  border: 'none', borderRadius: '999px', padding: '6px 14px', fontSize: '12px', fontWeight: '700',
                  cursor: (posting || !draft.trim()) ? 'default' : 'pointer', marginLeft: 'auto',
                }}
              >{posting ? 'Posting…' : 'Post'}</button>
            </div>
            {error && (
              <div style={{ marginTop: '6px', fontSize: '11.5px', color: theme.brass }}>{error}</div>
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
                const cCount = commentCounts[post.id] || 0
                const commentsOpen = openComments.has(post.id)
                const sentence = lookingForSentence(post, profile)

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

                    {sentence && (
                      <div style={{
                        fontSize: '13.5px', fontWeight: '700', color: theme.brass, marginTop: '12px',
                        background: 'rgba(179,55,42,0.07)', borderRadius: '8px', padding: '8px 12px',
                      }}>{sentence}</div>
                    )}

                    <div style={{ fontSize: '14px', color: sc.text, lineHeight: '1.55', marginTop: '10px', whiteSpace: 'pre-wrap' }}>
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
                              profilesById={profilesById}
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
                          <Avatar profile={myProfile} size={28} />
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
