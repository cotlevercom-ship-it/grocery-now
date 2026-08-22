'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

function timeAgo(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function AdminFeedPage() {
  const [tab, setTab] = useState('posts')
  const [posts, setPosts] = useState([])
  const [comments, setComments] = useState([])
  const [profilesByUser, setProfilesByUser] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actingId, setActingId] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [postRows, commentRows] = await Promise.all([
        supabaseFetch('posts?select=*&order=created_at.desc&limit=200'),
        supabaseFetch('post_comments?select=*&order=created_at.desc&limit=200'),
      ])
      setPosts(postRows || [])
      setComments(commentRows || [])

      const userIds = [...new Set([...(postRows || []).map(p => p.user_id), ...(commentRows || []).map(c => c.user_id)])]
      if (userIds.length > 0) {
        const filter = userIds.map(id => `"${id}"`).join(',')
        const profiles = await supabaseFetch(`member_profiles?select=user_id,display_name,contact_email&user_id=in.(${filter})`)
        const map = {}
        for (const p of (profiles || [])) map[p.user_id] = p
        setProfilesByUser(map)
      } else {
        setProfilesByUser({})
      }
    } catch (e) {
      console.error(e)
      setError('Failed to load')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDeletePost = async (post) => {
    if (!confirm('Delete this post? Its likes and comments will also be removed.')) return
    setActingId(post.id)
    try {
      await supabaseFetch(`posts?id=eq.${post.id}`, { method: 'DELETE' })
      await load()
    } catch (e) {
      console.error(e)
      setError('Failed to delete post')
    }
    setActingId(null)
  }

  const handleDeleteComment = async (comment) => {
    if (!confirm('Delete this comment? Any replies to it will also be removed.')) return
    setActingId(comment.id)
    try {
      await supabaseFetch(`post_comments?id=eq.${comment.id}`, { method: 'DELETE' })
      await load()
    } catch (e) {
      console.error(e)
      setError('Failed to delete comment')
    }
    setActingId(null)
  }

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '4px' }}>Feed</h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        Moderate community posts and comments.
      </p>

      {error && (
        <div style={{ marginBottom: '16px', padding: '10px 12px', background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[{ key: 'posts', label: 'Posts', count: posts.length }, { key: 'comments', label: 'Comments', count: comments.length }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '6px 14px', borderRadius: '20px', border: '1px solid #ddd', fontSize: '12.5px',
            background: tab === t.key ? '#163a2c' : 'white',
            color: tab === t.key ? 'white' : '#444',
          }}>{t.label} ({t.count})</button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>Loading...</div>
      ) : tab === 'posts' ? (
        posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#999', background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>📰</div>
            <p>No posts yet</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
            {posts.map((post, i) => {
              const profile = profilesByUser[post.user_id]
              return (
                <div key={post.id} style={{
                  borderBottom: i < posts.length - 1 ? '1px solid #eee' : 'none',
                  padding: '14px 16px', display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap',
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: '700' }}>
                      {profile?.display_name || 'Unknown member'}
                      <span style={{ fontWeight: '400', color: '#999', marginLeft: '8px' }}>{timeAgo(post.created_at)}</span>
                    </div>
                    {profile?.contact_email && (
                      <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{profile.contact_email}</div>
                    )}
                    {post.looking_for_type && (
                      <div style={{ fontSize: '12px', color: '#b3372a', marginTop: '4px', fontWeight: '600' }}>
                        Looking for: {post.looking_for_type}{post.looking_for_location ? ` at ${post.looking_for_location}` : ''}
                      </div>
                    )}
                    <div style={{ fontSize: '13px', color: '#333', marginTop: '6px', whiteSpace: 'pre-wrap' }}>{post.content}</div>
                  </div>
                  <div style={{ alignSelf: 'center' }}>
                    <button disabled={actingId === post.id} onClick={() => handleDeletePost(post)} style={{
                      background: '#ffebee', color: '#c62828', borderRadius: '6px', padding: '8px 14px', fontSize: '12.5px', fontWeight: '600', border: 'none', cursor: 'pointer',
                    }}>Delete</button>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#999', background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>💬</div>
            <p>No comments yet</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
            {comments.map((comment, i) => {
              const profile = profilesByUser[comment.user_id]
              return (
                <div key={comment.id} style={{
                  borderBottom: i < comments.length - 1 ? '1px solid #eee' : 'none',
                  padding: '14px 16px', display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap',
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: '700' }}>
                      {profile?.display_name || 'Unknown member'}
                      <span style={{ fontWeight: '400', color: '#999', marginLeft: '8px' }}>{timeAgo(comment.created_at)}</span>
                      {comment.parent_comment_id && <span style={{ fontWeight: '400', color: '#999', marginLeft: '8px' }}>(reply)</span>}
                    </div>
                    <div style={{ fontSize: '13px', color: '#333', marginTop: '6px', whiteSpace: 'pre-wrap' }}>{comment.content}</div>
                  </div>
                  <div style={{ alignSelf: 'center' }}>
                    <button disabled={actingId === comment.id} onClick={() => handleDeleteComment(comment)} style={{
                      background: '#ffebee', color: '#c62828', borderRadius: '6px', padding: '8px 14px', fontSize: '12.5px', fontWeight: '600', border: 'none', cursor: 'pointer',
                    }}>Delete</button>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
