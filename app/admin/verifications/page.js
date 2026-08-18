'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

const DOC_TYPE_LABELS = {
  nid: 'National ID (NID)',
  passport: 'Passport',
  trade_license: 'Trade License',
  birth_certificate: 'Birth Certificate',
  other: 'Other',
}

export default function AdminVerificationsPage() {
  const [tab, setTab] = useState('pending')
  const [requests, setRequests] = useState([])
  const [profilesByUser, setProfilesByUser] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actingId, setActingId] = useState(null)
  const [noteDrafts, setNoteDrafts] = useState({})

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await supabaseFetch('verification_requests?select=*&order=created_at.desc')
      setRequests(data || [])

      const userIds = [...new Set((data || []).map(r => r.user_id))]
      if (userIds.length > 0) {
        const filter = userIds.map(id => `"${id}"`).join(',')
        const profiles = await supabaseFetch(`member_profiles?select=user_id,display_name,photo_url,contact_email&user_id=in.(${filter})`)
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

  const handleDecision = async (r, status) => {
    setActingId(r.id)
    try {
      await supabaseFetch(`verification_requests?id=eq.${r.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, admin_note: noteDrafts[r.id] || null }),
      })
      await load()
    } catch (e) {
      console.error(e)
      setError('Failed to update')
    }
    setActingId(null)
  }

  const filtered = requests.filter(r => r.status === tab)

  return (
    <div>
      <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Verification Requests</h1>
      <p style={{ fontSize: '13px', color: '#888', marginBottom: '18px' }}>
        Review the document type and number a member submitted, then approve or reject. Approving grants the verified badge on their profile — this is unrelated to their subscription/payment status.
      </p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
        {['pending', 'approved', 'rejected'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 16px', borderRadius: '20px', border: '1px solid #ddd', cursor: 'pointer',
            background: tab === t ? '#163a2c' : 'white', color: tab === t ? 'white' : '#333',
            fontSize: '13px', fontWeight: '600', textTransform: 'capitalize'
          }}>{t} ({requests.filter(r => r.status === t).length})</button>
        ))}
      </div>

      {error && <div style={{ color: '#b3452f', marginBottom: '14px', fontSize: '13.5px' }}>{error}</div>}

      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: '#888', fontSize: '14px' }}>No {tab} requests.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(r => {
            const p = profilesByUser[r.user_id]
            return (
              <div key={r.id} style={{ background: 'white', border: '1px solid #eee', borderRadius: '10px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  {p?.photo_url ? (
                    <img src={p.photo_url} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', background: '#163a2c', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700'
                    }}>{(p?.display_name || '?').trim().charAt(0).toUpperCase()}</div>
                  )}
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700' }}>{p?.display_name || 'Unknown member'}</div>
                    {p?.contact_email && <div style={{ fontSize: '12px', color: '#888' }}>{p.contact_email}</div>}
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: '#444', display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '10px' }}>
                  <div>📄 Document: <strong>{DOC_TYPE_LABELS[r.doc_type] || r.doc_type}</strong></div>
                  <div>🔢 Number: <strong>{r.doc_number}</strong></div>
                  <div style={{ color: '#999', fontSize: '12px' }}>Submitted {new Date(r.created_at).toLocaleDateString()}</div>
                </div>

                {r.admin_note && (
                  <p style={{ fontSize: '12.5px', color: '#888', fontStyle: 'italic', marginBottom: '10px' }}>Note: {r.admin_note}</p>
                )}

                {tab === 'pending' && (
                  <>
                    <input
                      placeholder="Optional note (shown to member if rejected)"
                      value={noteDrafts[r.id] || ''}
                      onChange={e => setNoteDrafts(prev => ({ ...prev, [r.id]: e.target.value }))}
                      style={{
                        width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px',
                        border: '1px solid #ddd', fontSize: '13px', marginBottom: '10px'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleDecision(r, 'approved')} disabled={actingId === r.id} style={{
                        padding: '8px 16px', borderRadius: '7px', border: 'none', background: '#3f6b52', color: 'white',
                        fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: actingId === r.id ? 0.6 : 1
                      }}>Approve</button>
                      <button onClick={() => handleDecision(r, 'rejected')} disabled={actingId === r.id} style={{
                        padding: '8px 16px', borderRadius: '7px', border: '1px solid #b3452f', background: 'white', color: '#b3452f',
                        fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: actingId === r.id ? 0.6 : 1
                      }}>Reject</button>
                    </div>
                  </>
                )}
                {tab === 'rejected' && (
                  <button onClick={() => handleDecision(r, 'approved')} disabled={actingId === r.id} style={{
                    padding: '8px 16px', borderRadius: '7px', border: 'none', background: '#3f6b52', color: 'white',
                    fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: actingId === r.id ? 0.6 : 1
                  }}>Approve instead</button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
