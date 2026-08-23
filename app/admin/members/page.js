'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

export default function AdminMembersPage() {
  const [tab, setTab] = useState('pending')
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actingId, setActingId] = useState(null)
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await supabaseFetch('member_profiles?select=*&order=created_at.desc')
      let merged = data || []
      try {
        const ids = merged.map(p => `"${p.user_id}"`).join(',')
        if (ids) {
          const uRows = await supabaseFetch(`user_profiles?select=id,phone&id=in.(${ids})`)
          const phoneById = Object.fromEntries((uRows || []).map(u => [u.id, u.phone]))
          merged = merged.map(p => ({ ...p, phone: phoneById[p.user_id] || '' }))
        }
      } catch (e) { console.error(e) }
      setProfiles(merged)
    } catch (e) {
      console.error(e)
      setError('Failed to load')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleApprove = async (p) => {
    setActingId(p.user_id)
    try {
      await supabaseFetch(`member_profiles?user_id=eq.${p.user_id}`, {
        method: 'PATCH',
        body: JSON.stringify({ approval_status: 'approved' }),
      })
      await load()
    } catch (e) {
      console.error(e)
      setError('Failed to approve')
    }
    setActingId(null)
  }

  const handleReject = async (p) => {
    setActingId(p.user_id)
    try {
      await supabaseFetch(`member_profiles?user_id=eq.${p.user_id}`, {
        method: 'PATCH',
        body: JSON.stringify({ approval_status: 'rejected' }),
      })
      await load()
    } catch (e) {
      console.error(e)
      setError('Failed to reject')
    }
    setActingId(null)
  }

  const filtered = profiles.filter(p => {
    if (p.approval_status !== tab) return false
    const q = search.trim().toLowerCase()
    if (!q) return true
    return [p.display_name, p.contact_email, p.phone].filter(Boolean).some(v => v.toLowerCase().includes(q))
  })

  return (
    <div>
      <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Member Profiles</h1>
      <p style={{ fontSize: '13px', color: '#888', marginBottom: '18px' }}>
        Profiles publish instantly and are not gated by this status — this list is for reference/moderation only.
      </p>

      <input
        type="text" value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search by name, email, or phone…"
        style={{
          width: '100%', maxWidth: '360px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '8px',
          padding: '9px 12px', fontSize: '13px', marginBottom: '14px', display: 'block',
        }}
      />

      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
        {['pending', 'approved', 'rejected'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 16px', borderRadius: '20px', border: '1px solid #ddd', cursor: 'pointer',
            background: tab === t ? '#163a2c' : 'white', color: tab === t ? 'white' : '#333',
            fontSize: '13px', fontWeight: '600', textTransform: 'capitalize'
          }}>{t} ({profiles.filter(p => p.approval_status === t).length})</button>
        ))}
      </div>

      {error && <div style={{ color: '#b3452f', marginBottom: '14px', fontSize: '13.5px' }}>{error}</div>}

      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: '#888', fontSize: '14px' }}>No {tab} profiles.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(p => (
            <div key={p.user_id} style={{ background: 'white', border: '1px solid #eee', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {p.photo_url ? (
                    <img src={p.photo_url} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', background: '#163a2c', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700'
                    }}>{(p.display_name || '?').trim().charAt(0).toUpperCase()}</div>
                  )}
                  <div style={{ fontSize: '15px', fontWeight: '700' }}>{p.display_name}</div>
                </div>
              </div>
              <div style={{ fontSize: '12.5px', color: '#666', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>

                {p.looking_for && <div>🔎 Looking for: {p.looking_for}</div>}
                {p.commitment && <div>⏱️ Commitment: {p.commitment}</div>}
                {p.location && <div>📍 {p.location}</div>}
                {p.contact_email && <div>✉️ {p.contact_email}</div>}
                {p.phone && <div>📱 {p.phone}</div>}
              </div>
              {p.bio && <p style={{ fontSize: '13px', color: '#444', marginTop: '8px', fontStyle: 'italic' }}>{p.bio}</p>}

              {tab === 'pending' && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button onClick={() => handleApprove(p)} disabled={actingId === p.user_id} style={{
                    padding: '8px 16px', borderRadius: '7px', border: 'none', background: '#3f6b52', color: 'white',
                    fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: actingId === p.user_id ? 0.6 : 1
                  }}>Approve</button>
                  <button onClick={() => handleReject(p)} disabled={actingId === p.user_id} style={{
                    padding: '8px 16px', borderRadius: '7px', border: '1px solid #b3452f', background: 'white', color: '#b3452f',
                    fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: actingId === p.user_id ? 0.6 : 1
                  }}>Reject</button>
                </div>
              )}
              {tab === 'rejected' && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button onClick={() => handleApprove(p)} disabled={actingId === p.user_id} style={{
                    padding: '8px 16px', borderRadius: '7px', border: 'none', background: '#3f6b52', color: 'white',
                    fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: actingId === p.user_id ? 0.6 : 1
                  }}>Approve instead</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
// redeploy trigger 1786879408
