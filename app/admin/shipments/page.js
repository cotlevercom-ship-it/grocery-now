'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

const STATUS_OPTIONS = ['pending', 'picked_up', 'in_transit', 'delivered', 'cancelled']

const STATUS_BADGE = {
  pending: { bg: '#fff3e0', color: '#f4a300', label: 'Pending' },
  picked_up: { bg: '#e3f2fd', color: '#1565c0', label: 'Picked Up' },
  in_transit: { bg: '#f3e8fd', color: '#6a3fa0', label: 'In Transit' },
  delivered: { bg: '#e8f5e9', color: '#2e7d32', label: 'Delivered' },
  cancelled: { bg: '#ffebee', color: '#c62828', label: 'Cancelled' },
}

export default function AdminShipmentsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [drafts, setDrafts] = useState({}) // { [id]: { status, tracking_id } }
  const [savingId, setSavingId] = useState(null)

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const data = await supabaseFetch('shipment_bookings?select=*&order=created_at.desc')
      setBookings(data || [])
      const d = {}
      ;(data || []).forEach(b => { d[b.id] = { status: b.status || 'pending', tracking_id: b.tracking_id || '' } })
      setDrafts(d)
    } catch (e) {
      console.error(e)
      setError('Failed to load parcel bookings')
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const updateDraft = (id, field, value) => {
    setDrafts(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  const handleSave = async (id) => {
    setSavingId(id)
    try {
      const d = drafts[id]
      await supabaseFetch(`shipment_bookings?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: d.status, tracking_id: d.tracking_id.trim() || null }),
      })
      await loadData()
    } catch (e) {
      console.error(e)
      setError('Failed to save changes')
    }
    setSavingId(null)
  }

  const filtered = bookings.filter(b => statusFilter === 'all' || b.status === statusFilter)

  const inputStyle = {
    padding: '8px 10px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '13px'
  }

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '4px' }}>
        Parcel Bookings
      </h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '18px' }}>
        Update shipment status and add the courier's real tracking number.
      </p>

      {error && (
        <div style={{
          marginBottom: '16px', padding: '10px 12px',
          background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
        }}>{error}</div>
      )}

      <select style={{ ...inputStyle, marginBottom: '16px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
        <option value="all">All</option>
        {STATUS_OPTIONS.map(s => (
          <option key={s} value={s}>{STATUS_BADGE[s].label}</option>
        ))}
      </select>

      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '50px 20px', color: '#999',
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>✈️</div>
          <p>No parcel bookings</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(b => {
            const draft = drafts[b.id] || { status: b.status, tracking_id: b.tracking_id || '' }
            const dirty = draft.status !== (b.status || 'pending') || draft.tracking_id !== (b.tracking_id || '')
            const badge = STATUS_BADGE[b.status] || STATUS_BADGE.pending
            return (
              <div key={b.id} style={{
                background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0', padding: '16px'
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>
                      #{b.id.slice(0, 8).toUpperCase()} · {b.courier_name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '3px' }}>
                      {new Date(b.created_at).toLocaleString('en-US')}
                    </div>
                    <div style={{ fontSize: '12px', color: '#444', marginTop: '8px' }}>
                      <b>From:</b> {b.sender_name} ({b.sender_phone}) — {b.sender_country}
                    </div>
                    <div style={{ fontSize: '12px', color: '#444', marginTop: '2px' }}>
                      <b>To:</b> {b.receiver_name} ({b.receiver_phone}) — {b.receiver_country}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                      {b.weight_kg}kg · {b.parcel_type} · ৳{b.charge_amount}
                    </div>
                  </div>

                  <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{
                      alignSelf: 'flex-start', fontSize: '11px', fontWeight: '700', padding: '3px 10px',
                      borderRadius: '10px', background: badge.bg, color: badge.color
                    }}>{badge.label}</span>

                    <select
                      style={inputStyle}
                      value={draft.status}
                      onChange={e => updateDraft(b.id, 'status', e.target.value)}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{STATUS_BADGE[s].label}</option>
                      ))}
                    </select>

                    <input
                      style={inputStyle}
                      placeholder="Courier tracking number"
                      value={draft.tracking_id}
                      onChange={e => updateDraft(b.id, 'tracking_id', e.target.value)}
                    />

                    <button
                      onClick={() => handleSave(b.id)}
                      disabled={!dirty || savingId === b.id}
                      style={{
                        background: dirty ? '#163a2c' : '#eee', color: dirty ? 'white' : '#999',
                        border: 'none', borderRadius: '8px', padding: '8px 14px',
                        fontSize: '12px', fontWeight: '700', cursor: dirty ? 'pointer' : 'default'
                      }}
                    >{savingId === b.id ? 'Saving...' : 'Save'}</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
