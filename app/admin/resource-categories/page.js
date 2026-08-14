'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

const emptyForm = { name: '', slug: '' }

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 60)
}

export default function AdminResourceCategoriesPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [busyId, setBusyId] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await supabaseFetch('resource_categories?select=*&order=sort_order.asc')
      setItems(data || [])
    } catch (e) {
      console.error(e)
      setError('Failed to load')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const flashSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 2500) }

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setError(''); setShowForm(true) }
  const openEdit = (item) => {
    setEditingId(item.id)
    setForm({ name: item.name, slug: item.slug })
    setError('')
    setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm) }

  const handleChange = (field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'name' && !editingId) next.slug = slugify(value)
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('Name is required'); return }
    const slug = form.slug.trim() || slugify(form.name)
    if (!slug) { setError('Slug could not be generated — try a different name'); return }
    if (items.some(i => i.slug === slug && i.id !== editingId)) { setError('A category with this slug already exists'); return }

    setSubmitting(true)
    try {
      if (editingId) {
        await supabaseFetch(`resource_categories?id=eq.${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: form.name.trim(), slug }),
        })
      } else {
        const nextSort = items.length ? Math.max(...items.map(i => i.sort_order)) + 1 : 1
        await supabaseFetch('resource_categories', {
          method: 'POST',
          body: JSON.stringify({ name: form.name.trim(), slug, is_active: true, sort_order: nextSort }),
        })
      }
      closeForm()
      flashSuccess('Saved')
      await load()
    } catch (e) {
      console.error(e)
      setError('Failed to save — the slug may already be in use')
    }
    setSubmitting(false)
  }

  const toggleActive = async (item) => {
    setBusyId(item.id)
    try {
      await supabaseFetch(`resource_categories?id=eq.${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !item.is_active }),
      })
      await load()
    } catch (e) {
      console.error(e)
      setError('Failed to update status')
    }
    setBusyId(null)
  }

  const handleDelete = async (item) => {
    if (!confirm(`Delete category "${item.name}"? Articles in this category will become uncategorized.`)) return
    setBusyId(item.id)
    try {
      await supabaseFetch(`resource_categories?id=eq.${item.id}`, { method: 'DELETE' })
      await load()
    } catch (e) {
      console.error(e)
      setError('Failed to delete')
    }
    setBusyId(null)
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
  }
  const labelStyle = { fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c' }}>Article Categories</h1>
        <button onClick={openAdd} style={{
          background: '#2d6a4f', color: 'white', border: 'none', borderRadius: '8px',
          padding: '9px 18px', fontSize: '13.5px', fontWeight: '600'
        }}>+ Add Category</button>
      </div>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        Categories group articles on the Resources page. Deactivating a category hides it from the
        public filter tabs — its articles still show under "All". Deleting a category leaves its
        articles in place, just uncategorized.
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
            {editingId ? 'Edit Category' : 'Add New Category'}
          </h3>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Name (shown to users)</label>
            <input style={inputStyle} value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="e.g. Investor" />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Slug</label>
            <input style={inputStyle} value={form.slug} onChange={e => handleChange('slug', e.target.value)} placeholder="auto-generated-from-name" />
          </div>

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
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#999', background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0' }}>No categories yet</div>
      ) : (
        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0', overflow: 'hidden', maxWidth: '640px' }}>
          {items.map((item, i) => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
              padding: '14px 18px', borderBottom: i < items.length - 1 ? '1px solid #eee' : 'none', flexWrap: 'wrap'
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '14.5px', fontWeight: '600', color: '#163a2c' }}>{item.name}</div>
                <div style={{ fontSize: '11.5px', color: '#999' }}>{item.slug}</div>
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
                  disabled={busyId === item.id}
                  style={{
                    background: item.is_active ? '#fff5f5' : '#f0fdf4',
                    color: item.is_active ? '#c62828' : '#2d6a4f',
                    border: `1px solid ${item.is_active ? '#f8d7da' : '#c8e6c9'}`,
                    borderRadius: '6px', padding: '7px 12px', fontSize: '12.5px', fontWeight: '600'
                  }}
                >{busyId === item.id ? '...' : (item.is_active ? 'Deactivate' : 'Activate')}</button>
                <button
                  onClick={() => handleDelete(item)}
                  disabled={busyId === item.id}
                  style={{
                    background: '#ffebee', color: '#c62828', border: 'none',
                    borderRadius: '6px', padding: '7px 12px', fontSize: '12.5px', fontWeight: '600'
                  }}
                >Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
