'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

const emptyForm = {
  country: '', courier_name: '', base_charge: '0', free_weight_kg: '0', per_kg_charge: '0',
  free_item_count: '0', per_item_charge: '0', sort_order: '0', is_active: true,
}

export default function AdminShippingPage() {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  async function loadRules() {
    setLoading(true)
    setError('')
    try {
      const data = await supabaseFetch('shipping_rules?select=*&order=sort_order')
      setRules(data || [])
    } catch (e) {
      console.error(e)
      setError('Failed to load shipping rules')
    }
    setLoading(false)
  }

  useEffect(() => { loadRules() }, [])

  const openNewForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEditForm = (r) => {
    setEditingId(r.id)
    setForm({
      country: r.country || '',
      courier_name: r.courier_name || '',
      base_charge: String(r.base_charge ?? '0'),
      free_weight_kg: String(r.free_weight_kg ?? '0'),
      per_kg_charge: String(r.per_kg_charge ?? '0'),
      free_item_count: String(r.free_item_count ?? '0'),
      per_item_charge: String(r.per_item_charge ?? '0'),
      sort_order: String(r.sort_order ?? '0'),
      is_active: r.is_active !== false,
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.country.trim()) return setError('Please enter a country name (or OTHER for the fallback rate)')
    if (form.country.trim().toLowerCase() === 'bangladesh') return setError('Cot Lever ships internationally only — Bangladesh cannot be a delivery destination')

    setSaving(true)
    try {
      const payload = {
        country: form.country.trim(),
        courier_name: form.courier_name.trim() || null,
        base_charge: Number(form.base_charge) || 0,
        free_weight_kg: Number(form.free_weight_kg) || 0,
        per_kg_charge: Number(form.per_kg_charge) || 0,
        free_item_count: Number(form.free_item_count) || 0,
        per_item_charge: Number(form.per_item_charge) || 0,
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
      }
      if (editingId) {
        await supabaseFetch(`shipping_rules?id=eq.${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) })
      } else {
        await supabaseFetch('shipping_rules', { method: 'POST', body: JSON.stringify(payload) })
      }
      closeForm()
      await loadRules()
    } catch (e) {
      console.error(e)
      setError('Failed to save shipping rule')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this shipping rule?')) return
    setDeletingId(id)
    try {
      await supabaseFetch(`shipping_rules?id=eq.${id}`, { method: 'DELETE' })
      await loadRules()
    } catch (e) {
      console.error(e)
      setError('Failed to delete')
    }
    setDeletingId(null)
  }

  const toggleActive = async (r) => {
    try {
      await supabaseFetch(`shipping_rules?id=eq.${r.id}`, { method: 'PATCH', body: JSON.stringify({ is_active: !r.is_active }) })
      await loadRules()
    } catch (e) {
      console.error(e)
      setError('Failed to change status')
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1.5px solid #9ca3af', fontSize: '14px', boxSizing: 'border-box'
  }
  const labelStyle = { fontSize: '12px', color: '#333', display: 'block', marginBottom: '5px', fontWeight: '600' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0a0a0a', marginBottom: '4px' }}>Shipping</h1>
          <p style={{ color: '#888', fontSize: '14px', maxWidth: '640px' }}>
            Cot Lever sets shipping charges centrally — merchants don't set their own delivery charge anymore.
            Add one rule per destination country. Charge = Base + (extra weight over the free allowance × per-kg rate) + (extra items over the free allowance × per-item rate).
            Add a rule with country <b>OTHER</b> to act as the fallback rate for any country without its own rule.
          </p>
        </div>
        {!showForm && (
          <button onClick={openNewForm} style={{
            background: '#0a0a0a', color: 'white', border: 'none', borderRadius: '8px',
            padding: '10px 18px', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap'
          }}>+ New Rule</button>
        )}
      </div>

      {error && (
        <div style={{
          maxWidth: '600px', margin: '16px 0', padding: '10px 12px',
          background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
        }}>{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleSave} style={{
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
          padding: '20px', marginBottom: '24px', maxWidth: '560px'
        }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#0a0a0a', marginBottom: '14px' }}>
            {editingId ? 'Edit Shipping Rule' : 'New Shipping Rule'}
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Country *</label>
            <input style={inputStyle} value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="e.g. India, UK, USA, or OTHER for fallback" />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Courier Name <span style={{ color: '#aaa', fontWeight: '400' }}>— optional, e.g. Bangladesh Post Office</span></label>
            <input style={inputStyle} value={form.courier_name} onChange={e => setForm({ ...form, courier_name: e.target.value })} placeholder="e.g. Bangladesh Post Office" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Base Charge (৳)</label>
              <input type="number" style={inputStyle} value={form.base_charge} onChange={e => setForm({ ...form, base_charge: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Sort Order</label>
              <input type="number" style={inputStyle} value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} />
            </div>
          </div>

          <div style={{ fontSize: '12px', fontWeight: '700', color: '#163a2c', margin: '4px 0 8px' }}>Weight-based</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Free Weight (kg)</label>
              <input type="number" style={inputStyle} value={form.free_weight_kg} onChange={e => setForm({ ...form, free_weight_kg: e.target.value })} placeholder="weight included in base charge" />
            </div>
            <div>
              <label style={labelStyle}>Charge per extra Kg (৳)</label>
              <input type="number" style={inputStyle} value={form.per_kg_charge} onChange={e => setForm({ ...form, per_kg_charge: e.target.value })} />
            </div>
          </div>

          <div style={{ fontSize: '12px', fontWeight: '700', color: '#163a2c', margin: '4px 0 8px' }}>Item-count-based</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Free Item Count</label>
              <input type="number" style={inputStyle} value={form.free_item_count} onChange={e => setForm({ ...form, free_item_count: e.target.value })} placeholder="items included in base charge" />
            </div>
            <div>
              <label style={labelStyle}>Charge per extra Item (৳)</label>
              <input type="number" style={inputStyle} value={form.per_item_charge} onChange={e => setForm({ ...form, per_item_charge: e.target.value })} />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#444', marginBottom: '16px' }}>
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
            Active
          </label>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={saving} style={{
              background: saving ? '#a9a9a9' : '#0a0a0a', color: 'white', border: 'none',
              borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600'
            }}>{saving ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={closeForm} style={{
              background: '#f0f0f0', color: '#555', border: 'none',
              borderRadius: '8px', padding: '10px 20px', fontSize: '14px'
            }}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>Loading...</div>
      ) : rules.length === 0 ? (
        <div style={{ color: '#999', fontSize: '13px' }}>No shipping rules yet — add one for Bangladesh and one for OTHER (fallback).</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '760px' }}>
          {rules.map(r => (
            <div key={r.id} style={{
              background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
              padding: '14px 16px', opacity: r.is_active ? 1 : 0.6,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap'
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0a0a0a' }}>
                  {r.country === 'OTHER' ? 'OTHER (Rest of World fallback)' : r.country} {!r.is_active && <span style={{ fontSize: '11px', color: '#c62828', fontWeight: '600' }}>(Inactive)</span>}
                </div>
                {r.courier_name && (
                  <div style={{ fontSize: '12px', color: '#2d6a4f', fontWeight: '600', marginTop: '2px' }}>via {r.courier_name}</div>
                )}
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                  Base ৳{r.base_charge} · first {r.free_weight_kg}kg & {r.free_item_count} item(s) free · then ৳{r.per_kg_charge}/kg + ৳{r.per_item_charge}/item
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button onClick={() => openEditForm(r)} style={{
                  background: '#f5f5f5', color: '#333', border: 'none',
                  borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                }}>Edit</button>
                <button onClick={() => toggleActive(r)} style={{
                  background: '#fff3e0', color: '#f4a300', border: 'none',
                  borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                }}>{r.is_active ? 'Deactivate' : 'Activate'}</button>
                <button onClick={() => handleDelete(r.id)} disabled={deletingId === r.id} style={{
                  background: '#ffebee', color: '#c62828', border: 'none',
                  borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                }}>{deletingId === r.id ? 'Deleting...' : 'Delete'}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
