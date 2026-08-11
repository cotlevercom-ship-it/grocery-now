'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

export default function AdminFoundersPage() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all | active | inactive | featured
  const [busyId, setBusyId] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const rows = await supabaseFetch(`founder_profiles?select=*&order=created_at.desc`)
      setProfiles(rows || [])
    } catch (e) {
      console.error(e)
      setError('Failed to load founder profiles')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleField = async (p, field) => {
    setBusyId(p.id)
    try {
      await supabaseFetch(`founder_profiles?id=eq.${p.id}`, {
        method: 'PATCH', body: JSON.stringify({ [field]: !p[field] }),
      })
      await load()
    } catch (e) {
      console.error(e)
      setError('Failed to update')
    }
    setBusyId(null)
  }

  const handleDelete = async (p) => {
    if (!confirm(`Delete ${p.full_name}'s profile? This cannot be undone.`)) return
    setBusyId(p.id)
    try {
      await supabaseFetch(`founder_profiles?id=eq.${p.id}`, { method: 'DELETE' })
      await load()
    } catch (e) {
      console.error(e)
      setError('Failed to delete')
    }
    setBusyId(null)
  }

  const filtered = profiles.filter(p => {
    if (filter === 'active') return p.is_active
    if (filter === 'inactive') return !p.is_active
    if (filter === 'featured') return p.is_featured
    return true
  })

  const tabs = [
    { key: 'all', label: `All (${profiles.length})` },
    { key: 'active', label: `Active (${profiles.filter(p => p.is_active).length})` },
    { key: 'inactive', label: `Inactive (${profiles.filter(p => !p.is_active).length})` },
    { key: 'featured', label: `Featured (${profiles.filter(p => p.is_featured).length})` },
  ]

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '4px' }}>Founders</h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        Manage founder profiles listed on Cot Lever.
      </p>

      {error && (
        <div style={{
          maxWidth: '600px', marginBottom: '16px', padding: '10px 12px',
          background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
        }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)} style={{
            padding: '7px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: '600',
            border: `1px solid ${filter === t.key ? '#163a2c' : '#ddd'}`,
            background: filter === t.key ? '#163a2c' : 'white',
            color: filter === t.key ? 'white' : '#555',
          }}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: '#999', fontSize: '13px' }}>No founder profiles here.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '760px' }}>
          {filtered.map(p => (
            <div key={p.id} style={{
              background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
              padding: '14px 16px', opacity: p.is_active ? 1 : 0.6,
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap'
            }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#163a2c', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {p.full_name}
                  {p.is_featured && <span style={{ fontSize: '10px', fontWeight: '700', color: '#a06c00', background: '#fff3d6', padding: '2px 7px', borderRadius: '5px' }}>FEATURED</span>}
                  {!p.is_active && <span style={{ fontSize: '11px', color: '#c62828', fontWeight: '600' }}>(Inactive)</span>}
                </div>
                <div style={{ fontSize: '12.5px', color: '#666', marginTop: '3px' }}>{p.headline}</div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  {p.location || 'No location'} · {p.commitment || '—'} · {(p.skills || []).slice(0, 4).join(', ') || 'No skills listed'}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                <button disabled={busyId === p.id} onClick={() => toggleField(p, 'is_active')} style={{
                  background: '#fff3e0', color: '#f4a300', border: 'none',
                  borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                }}>{p.is_active ? 'Deactivate' : 'Activate'}</button>
                <button disabled={busyId === p.id} onClick={() => toggleField(p, 'is_featured')} style={{
                  background: '#f5f5f5', color: '#2d6a4f', border: 'none',
                  borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                }}>{p.is_featured ? 'Unfeature' : 'Feature'}</button>
                <button disabled={busyId === p.id} onClick={() => handleDelete(p)} style={{
                  background: '#ffebee', color: '#c62828', border: 'none',
                  borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                }}>{busyId === p.id ? '...' : 'Delete'}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
