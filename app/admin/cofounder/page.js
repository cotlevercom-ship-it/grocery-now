'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

function addDuration(plan) {
  const now = new Date()
  const end = new Date(now)
  if (plan === 'trial') end.setDate(end.getDate() + 30)
  else end.setFullYear(end.getFullYear() + 1)
  return { starts_at: now.toISOString(), ends_at: end.toISOString() }
}

export default function AdminCofounderPage() {
  const [tab, setTab] = useState('pending')
  const [subs, setSubs] = useState([])
  const [postsById, setPostsById] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actingId, setActingId] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const subData = await supabaseFetch('cofounder_subscriptions?select=*&order=created_at.desc')
      setSubs(subData || [])
      const ids = [...new Set((subData || []).map(s => s.post_id))]
      if (ids.length) {
        const postData = await supabaseFetch(`cofounder_posts?select=*&id=in.(${ids.join(',')})`)
        const map = {}
        ;(postData || []).forEach(p => { map[p.id] = p })
        setPostsById(map)
      }
    } catch (e) {
      console.error(e)
      setError('Failed to load')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleApprove = async (sub) => {
    setActingId(sub.id)
    try {
      const { starts_at, ends_at } = addDuration(sub.plan)
      await supabaseFetch(`cofounder_subscriptions?id=eq.${sub.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'active', starts_at, ends_at }),
      })
      await supabaseFetch(`cofounder_posts?id=eq.${sub.post_id}`, {
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

  const handleReject = async (sub) => {
    setActingId(sub.id)
    try {
      await supabaseFetch(`cofounder_subscriptions?id=eq.${sub.id}`, {
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

  const filtered = subs.filter(s => s.status === tab)

  return (
    <div>
      <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Find Co-founder — Subscriptions</h1>
      <p style={{ fontSize: '13px', color: '#888', marginBottom: '18px' }}>Trial posts still need review (spam/quality) before going live; paid posts also need payment verification.</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
        {['pending', 'active', 'rejected', 'expired'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 16px', borderRadius: '20px', border: '1px solid #ddd', cursor: 'pointer',
            background: tab === t ? '#163a2c' : 'white', color: tab === t ? 'white' : '#333',
            fontSize: '13px', fontWeight: '600', textTransform: 'capitalize'
          }}>{t} ({subs.filter(s => s.status === t).length})</button>
        ))}
      </div>

      {error && <div style={{ color: '#b3452f', marginBottom: '14px', fontSize: '13.5px' }}>{error}</div>}

      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: '#888', fontSize: '14px' }}>No {tab} subscriptions.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(sub => {
            const post = postsById[sub.post_id]
            if (!post) return null
            return (
              <div key={sub.id} style={{ background: 'white', border: '1px solid #eee', borderRadius: '10px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '15px', fontWeight: '700' }}>{post.idea_name}</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: '700', padding: '3px 9px', borderRadius: '20px',
                      background: sub.plan === 'trial' ? '#FBF3E7' : '#E7EEE9',
                      color: sub.plan === 'trial' ? '#966c38' : '#3f6b52'
                    }}>{sub.plan === 'trial' ? 'Free Trial' : `৳${sub.amount} / year`}</span>
                  </div>
                </div>
                {post.description && <p style={{ fontSize: '13px', color: '#444', marginTop: '8px' }}>{post.description}</p>}
                <div style={{ fontSize: '12.5px', color: '#666', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {post.stage && <div>📈 Stage: {post.stage}</div>}
                  {post.skills_needed && <div>🧩 Skills needed: {post.skills_needed}</div>}
                  {post.equity_offered && <div>📄 Equity offered: {post.equity_offered}</div>}
                  {post.commitment && <div>⏱️ Commitment: {post.commitment}</div>}
                  {post.contact_email && <div>✉️ {post.contact_email}</div>}
                  {sub.payment_reference && <div>💳 {sub.payment_reference}</div>}
                </div>

                {tab === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button onClick={() => handleApprove(sub)} disabled={actingId === sub.id} style={{
                      padding: '8px 16px', borderRadius: '7px', border: 'none', background: '#3f6b52', color: 'white',
                      fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: actingId === sub.id ? 0.6 : 1
                    }}>Approve</button>
                    <button onClick={() => handleReject(sub)} disabled={actingId === sub.id} style={{
                      padding: '8px 16px', borderRadius: '7px', border: '1px solid #b3452f', background: 'white', color: '#b3452f',
                      fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: actingId === sub.id ? 0.6 : 1
                    }}>Reject</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
