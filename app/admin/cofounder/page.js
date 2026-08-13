'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

export default function AdminCofounderPage() {
  const [tab, setTab] = useState('pending')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actingId, setActingId] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await supabaseFetch('cofounder_posts?select=*&order=created_at.desc')
      setPosts(data || [])
    } catch (e) {
      console.error(e)
      setError('Failed to load')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleApprove = async (post) => {
    setActingId(post.id)
    try {
      await supabaseFetch(`cofounder_posts?id=eq.${post.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'active' }),
      })
      await load()
    } catch (e) {
      console.error(e)
      setError('Failed to approve')
    }
    setActingId(null)
  }

  const handleReject = async (post) => {
    setActingId(post.id)
    try {
      await supabaseFetch(`cofounder_posts?id=eq.${post.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'rejected' }),
      })
      await load()
    } catch (e) {
      console.error(e)
      setError('Failed to reject')
    }
    setActingId(null)
  }

  const filtered = posts.filter(p => p.status === tab)

  return (
    <div>
      <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Find Co-founder — Posts</h1>
      <p style={{ fontSize: '13px', color: '#888', marginBottom: '18px' }}>Free posts — no payment involved, review for spam/quality only.</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
        {['pending', 'active', 'rejected'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 16px', borderRadius: '20px', border: '1px solid #ddd', cursor: 'pointer',
            background: tab === t ? '#163a2c' : 'white', color: tab === t ? 'white' : '#333',
            fontSize: '13px', fontWeight: '600', textTransform: 'capitalize'
          }}>{t} ({posts.filter(p => p.status === t).length})</button>
        ))}
      </div>

      {error && <div style={{ color: '#b3452f', marginBottom: '14px', fontSize: '13.5px' }}>{error}</div>}

      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: '#888', fontSize: '14px' }}>No {tab} posts.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(post => (
            <div key={post.id} style={{ background: 'white', border: '1px solid #eee', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '15px', fontWeight: '700' }}>{post.idea_name}</div>
                {post.stage && <div style={{ fontSize: '11px', color: '#966c38' }}>{post.stage}</div>}
              </div>
              {post.description && <p style={{ fontSize: '13px', color: '#444', marginTop: '8px' }}>{post.description}</p>}
              <div style={{ fontSize: '12.5px', color: '#666', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {post.skills_needed && <div>🧩 Skills needed: {post.skills_needed}</div>}
                {post.equity_offered && <div>📄 Equity offered: {post.equity_offered}</div>}
                {post.commitment && <div>⏱️ Commitment: {post.commitment}</div>}
                {post.contact_email && <div>✉️ {post.contact_email}</div>}
              </div>

              {tab === 'pending' && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button onClick={() => handleApprove(post)} disabled={actingId === post.id} style={{
                    padding: '8px 16px', borderRadius: '7px', border: 'none', background: '#3f6b52', color: 'white',
                    fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: actingId === post.id ? 0.6 : 1
                  }}>Approve</button>
                  <button onClick={() => handleReject(post)} disabled={actingId === post.id} style={{
                    padding: '8px 16px', borderRadius: '7px', border: '1px solid #b3452f', background: 'white', color: '#b3452f',
                    fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: actingId === post.id ? 0.6 : 1
                  }}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
