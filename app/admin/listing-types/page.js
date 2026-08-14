'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

const emptyForm = { key: '', label: '', icon: '' }

function slugifyKey(label) {
  return label.toLowerCase().trim().replace(/[^a-z0-9\s_-]/g, '').replace(/[\s-]+/g, '_').slice(0, 40)
}

export default function AdminListingTypesPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingKey, setEditingKey] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [busyKey, setBusyKey] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await supabaseFetch('listing_type_options?select=*&order=sort_order.asc')
      setItems(data || [])
    } catch (e) {
      console.error(e)
      setError('Failed to load')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const flashSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 2500) }

  const openAdd = () => { setEditingKey(null); setForm(emptyForm); setError(''); setShowForm(true) }
  const openEdit = (item) => {
    setEditingKey(item.key)
    setForm({ key: item.key, label: item.label, icon: item.icon || '' })
    setError('')
    setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditingKey(null); setForm(emptyForm) }

  const handleChange = (field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'label' && !editingKey) next.key = slugifyKey(value)
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.label.trim()) { setError('Label is required'); return }
    if (!editingKey && !form.key.trim()) { setError('Key could not be generated — try a different label'); return }

    setSubmitting(true)
    try {
      if (editingKey) {
        await supabaseFetch(`listing_type_options?key=eq.${editingKey}`, {
          method: 'PATCH',
          body: JSON.stringify({ label: form.label.trim(), icon: form.icon.trim() || '' }),
        })
      } else {
        if (items.some(i => i.key === form.key.trim())) { setError('A type with this key already exists'); setSubmitting(false); return }
        const nextSort = items.length ? Math.max(...items.map(i => i.sort_order)) + 1 : 1
        await supabaseFetch('listing_type_options', {
          method: 'POST',
          body: JSON.stringify({
            key: form.key.trim(), label: form.label.trim(), icon: form.icon.trim() || '',
            is_active: true, sort_order: nextSort,
          }),
        })
      }
      closeForm()
      flashSuccess('Saved')
      await load()
    } catch (e) {
      console.error(e)
      setError('Failed to save — the key may already be in use')
    }
    setSubmitting(false)
  }

  const toggleActive = async (item) => {
    setBusyKey(item.key)
    try {
      await supabaseFetch(`listing_type_options?key=eq.${item.key}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !item.is_active }),
      })
      await load()
    } catch (e) {
      console.error(e)
      setError('Failed to update status')
    }
    setBusyKey(null)
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
  }
  const labelStyle = { fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c' }}>Listing Types</h1>
        <button onClick={openAdd} style={{
          background: '#2d6a4f', color: 'white', border: 'none', borderRadius: '8px',
          padding: '9px 18px', fontSize: '13.5px', fontWeight: '600'
        }}>+ Add Type</button>
      </div>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        These are the purposes a business can list for (Co-founder, Supplier, etc). Deactivating a type
        hides it from new listings and the homepage filter — existing listings that already use it keep showing normally.
      </p>

      {error && (
        <div style={{ maxWidth: '560px', marginBottom: '16px', padding: '10px 12px', background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px' }}>{error}</div>
      )}
      {success && (
        <div style={{ maxWidth: '560px', marginBottom: '16px', padding: '10px 12px', background: '#f5f5f5', color: '#2d6a4f', borderRadius: '8px', fontSize: '13px' }}>{success}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
          padding: '20px', maxWidth: '480px', marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#163a2c', marginBottom: '14px' }}>
            {editingKey ? 'Edit Type' : 'Add New Type'}
          </h3>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Label (shown to users)</label>
            <input style={inputStyle} value={form.label} onChange={e => handleChange('label', e.target.value)} placeholder="e.g. Distributor" />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Icon (single emoji, optional)</label>
            <input style={inputStyle} value={form.icon} onChange={e => handleChange('icon', e.target.value)} placeholder="e.g. 🚚" />
          </div>

          {!editingKey && (
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Key (auto-generated, used internally)</label>
              <input style={{ ...inputStyle, background: '#F5F5F5', color: '#999' }} value={form.key} readOnly />
            </div>
          )}
          {editingKey && (
            <div style={{ fontSize: '11.5px', color: '#999', marginBottom: '14px' }}>Key: {editingKey} (cannot be changed)</div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={submitting} style={{
              background: submitting ? '#9ca3af' : '#0a0a0a', color: 'white', border: 'none',
              borderRadius: '8px', padding: '10px 22px', fontSize: '14px', fontWeight: '600'
            }}>{submitting ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={closeForm} style={{
              background: 'transparent', color: '#666', border: '1px solid #ddd',
              borderRadius: '8px', padding: '10px 18px', fontSize: '14px', fontWeight: '600'
            }}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>Loading...</div>
      ) : (
        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0', overflow: 'hidden', maxWidth: '640px' }}>
          {items.map((item, i) => (
            <div key={item.key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
              padding: '14px 18px', borderBottom: i < items.length - 1 ? '1px solid #eee' : 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '14.5px', fontWeight: '600', color: '#163a2c' }}>{item.label}</div>
                  <div style={{ fontSize: '11.5px', color: '#999' }}>{item.key}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span style={{
                  fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px',
                  background: item.is_active ? '#e8f5e9' : '#f5f5f5',
                  color: item.is_active ? '#2d6a4f' : '#999'
                }}>{item.is_active ? 'Active' : 'Inactive'}</span>
                <button onClick={() => openEdit(item)} style={{
                  background: 'transparent', color: '#666', border: '1px solid #ddd',
                  borderRadius: '6px', padding: '7px 12px', fontSize: '12.5px', fontWeight: '600'
                }}>Edit</button>
                <button
                  onClick={() => toggleActive(item)}
                  disabled={busyKey === item.key}
                  style={{
                    background: item.is_active ? '#fff5f5' : '#f0fdf4',
                    color: item.is_active ? '#c62828' : '#2d6a4f',
                    border: `1px solid ${item.is_active ? '#f8d7da' : '#c8e6c9'}`,
                    borderRadius: '6px', padding: '7px 12px', fontSize: '12.5px', fontWeight: '600'
                  }}
                >{busyKey === item.key ? '...' : (item.is_active ? 'Deactivate' : 'Activate')}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
