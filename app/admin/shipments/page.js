'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

const COLOR_PRESETS = [
  { color: '#f4a300', bg: '#fff3e0' },
  { color: '#1565c0', bg: '#e3f2fd' },
  { color: '#6a3fa0', bg: '#f3e8fd' },
  { color: '#2e7d32', bg: '#e8f5e9' },
  { color: '#c62828', bg: '#ffebee' },
  { color: '#00897b', bg: '#e0f2f1' },
  { color: '#ad1457', bg: '#fce4ec' },
  { color: '#5d4037', bg: '#efebe9' },
]

const FALLBACK_BADGE = { color: '#666', bg: '#f0f0f0', label: null }

function slugify(text) {
  return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

export default function AdminShipmentsPage() {
  const [bookings, setBookings] = useState([])
  const [statuses, setStatuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [drafts, setDrafts] = useState({}) // { [id]: { status, tracking_id } }
  const [savingId, setSavingId] = useState(null)

  const [manageOpen, setManageOpen] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newColorIdx, setNewColorIdx] = useState(0)
  const [addingStatus, setAddingStatus] = useState(false)
  const [deletingStatusId, setDeletingStatusId] = useState(null)

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [bookingRows, statusRows] = await Promise.all([
        supabaseFetch('shipment_bookings?select=*&order=created_at.desc'),
        supabaseFetch('shipment_statuses?select=*&order=sort_order'),
      ])
      setBookings(bookingRows || [])
      setStatuses(statusRows || [])
      const d = {}
      ;(bookingRows || []).forEach(b => { d[b.id] = { status: b.status || 'pending', tracking_id: b.tracking_id || '' } })
      setDrafts(d)
    } catch (e) {
      console.error(e)
      setError('Failed to load parcel bookings')
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const badgeFor = (key) => {
    const s = statuses.find(s => s.key === key)
    if (s) return { color: s.color, bg: s.bg_color, label: s.label }
    return { ...FALLBACK_BADGE, label: key }
  }

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

  const handleAddStatus = async () => {
    if (!newLabel.trim()) return
    const key = slugify(newLabel)
    if (!key) return
    if (statuses.some(s => s.key === key)) {
      setError('A status with this name already exists')
      return
    }
    setAddingStatus(true)
    setError('')
    try {
      const preset = COLOR_PRESETS[newColorIdx % COLOR_PRESETS.length]
      await supabaseFetch('shipment_statuses', {
        method: 'POST',
        body: JSON.stringify({
          key, label: newLabel.trim(),
          color: preset.color, bg_color: preset.bg,
          sort_order: statuses.length + 1,
        }),
      })
      setNewLabel('')
      setNewColorIdx((statuses.length + 1) % COLOR_PRESETS.length)
      await loadData()
    } catch (e) {
      console.error(e)
      setError('Failed to add status — the name may already be taken')
    }
    setAddingStatus(false)
  }

  const handleDeleteStatus = async (s) => {
    const usedCount = bookings.filter(b => b.status === s.key).length
    if (!confirm(usedCount > 0
      ? `"${s.label}" is currently used by ${usedCount} booking(s). Delete it anyway? Those bookings will keep showing "${s.key}" until you change their status.`
      : `Delete the "${s.label}" status?`)) return
    setDeletingStatusId(s.id)
    try {
      await supabaseFetch(`shipment_statuses?id=eq.${s.id}`, { method: 'DELETE' })
      await loadData()
    } catch (e) {
      console.error(e)
      setError('Failed to delete status')
    }
    setDeletingStatusId(null)
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

      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0', marginBottom: '18px', overflow: 'hidden' }}>
        <button
          onClick={() => setManageOpen(v => !v)}
          style={{
            width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
            padding: '14px 16px', fontSize: '14px', fontWeight: '700', color: '#163a2c',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}
        >
          Manage Statuses <span>{manageOpen ? '▲' : '▼'}</span>
        </button>

        {manageOpen && (
          <div style={{ padding: '0 16px 16px', borderTop: '1px solid #eee' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '14px 0' }}>
              {statuses.map(s => (
                <span key={s.id} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  fontSize: '12px', fontWeight: '700', padding: '5px 6px 5px 12px',
                  borderRadius: '14px', background: s.bg_color, color: s.color
                }}>
                  {s.label}
                  <button
                    onClick={() => handleDeleteStatus(s)}
                    disabled={deletingStatusId === s.id}
                    style={{
                      background: 'rgba(0,0,0,0.08)', border: 'none', borderRadius: '50%',
                      width: '18px', height: '18px', lineHeight: 1, cursor: 'pointer',
                      color: 'inherit', fontSize: '12px', fontWeight: '700'
                    }}
                  >×</button>
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <input
                style={{ ...inputStyle, flex: '1 1 180px' }}
                placeholder="New status name (e.g. Customs Hold)"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '5px' }}>
                {COLOR_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setNewColorIdx(i)}
                    style={{
                      width: '22px', height: '22px', borderRadius: '50%', background: p.color,
                      border: newColorIdx === i ? '2px solid #163a2c' : '2px solid transparent',
                      cursor: 'pointer', padding: 0
                    }}
                  />
                ))}
              </div>
              <button
                onClick={handleAddStatus}
                disabled={!newLabel.trim() || addingStatus}
                style={{
                  background: '#163a2c', color: 'white', border: 'none', borderRadius: '8px',
                  padding: '8px 16px', fontSize: '12px', fontWeight: '700', cursor: 'pointer'
                }}
              >{addingStatus ? 'Adding...' : '+ Add Status'}</button>
            </div>
          </div>
        )}
      </div>

      <select style={{ ...inputStyle, marginBottom: '16px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
        <option value="all">All</option>
        {statuses.map(s => (
          <option key={s.id} value={s.key}>{s.label}</option>
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
            const badge = badgeFor(b.status)
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
                      {statuses.map(s => (
                        <option key={s.id} value={s.key}>{s.label}</option>
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
