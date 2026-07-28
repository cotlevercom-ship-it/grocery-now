'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

const emptyForm = { name: '', slug: '', icon: '', sort_order: '0', is_active: true }

function slugify(text) {
  return text.trim().toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [slugTouched, setSlugTouched] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  async function loadDepartments() {
    setLoading(true)
    setError('')
    try {
      const data = await supabaseFetch('departments?select=*&order=sort_order')
      setDepartments(data || [])
    } catch (e) {
      console.error(e)
      setError('Failed to load departments')
    }
    setLoading(false)
  }

  useEffect(() => { loadDepartments() }, [])

  const openNewForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setSlugTouched(false)
    setShowForm(true)
  }

  const openEditForm = (d) => {
    setEditingId(d.id)
    setForm({
      name: d.name || '',
      slug: d.slug || '',
      icon: d.icon || '',
      sort_order: String(d.sort_order ?? '0'),
      is_active: d.is_active !== false,
    })
    setSlugTouched(true)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setSlugTouched(false)
  }

  const handleNameChange = (value) => {
    setForm(f => ({ ...f, name: value, slug: slugTouched ? f.slug : slugify(value) }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) return setError('Please enter a name')
    if (!form.slug.trim()) return setError('Please enter a slug')

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        slug: slugify(form.slug),
        icon: form.icon.trim() || null,
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
      }
      if (editingId) {
        await supabaseFetch(`departments?id=eq.${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) })
      } else {
        await supabaseFetch('departments', { method: 'POST', body: JSON.stringify(payload) })
      }
      closeForm()
      await loadDepartments()
    } catch (e) {
      console.error(e)
      setError('Failed to save. Check that the slug is unique.')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this department? Shops assigned to it will become unassigned.')) return
    setDeletingId(id)
    try {
      await supabaseFetch(`shops?department_id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ department_id: null }) })
      await supabaseFetch(`departments?id=eq.${id}`, { method: 'DELETE' })
      await loadDepartments()
    } catch (e) {
      console.error(e)
      setError('Failed to delete')
    }
    setDeletingId(null)
  }

  const toggleActive = async (d) => {
    try {
      await supabaseFetch(`departments?id=eq.${d.id}`, { method: 'PATCH', body: JSON.stringify({ is_active: !d.is_active }) })
      await loadDepartments()
    } catch (e) {
      console.error(e)
      setError('Failed to change status')
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
  }
  const labelStyle = { fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0a0a0a', marginBottom: '4px' }}>Departments</h1>
          <p style={{ color: '#888', fontSize: '14px' }}>
            Top-level categories shown on the homepage (e.g. Grocery, Fashion, Electronics). Each shop belongs to one department.
          </p>
        </div>
        {!showForm && (
          <button onClick={openNewForm} style={{
            background: '#0a0a0a', color: 'white', border: 'none', borderRadius: '8px',
            padding: '10px 18px', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap'
          }}>+ New Department</button>
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
          padding: '20px', marginBottom: '24px', maxWidth: '480px'
        }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#0a0a0a', marginBottom: '14px' }}>
            {editingId ? 'Edit Department' : 'New Department'}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Icon (emoji)</label>
              <input style={inputStyle} value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="🛒" />
            </div>
            <div style={{ flex: 2 }}>
              <label style={labelStyle}>Name *</label>
              <input style={inputStyle} value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Fashion" />
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Slug *</label>
            <input style={inputStyle} value={form.slug} onChange={e => { setSlugTouched(true); setForm({ ...form, slug: e.target.value }) }} placeholder="fashion" />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Sort Order</label>
              <input style={inputStyle} type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#444', marginTop: '18px' }}>
              <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
              Active
            </label>
          </div>

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
      ) : departments.length === 0 ? (
        <div style={{ color: '#999', fontSize: '13px' }}>No departments yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '680px' }}>
          {departments.map(d => (
            <div key={d.id} style={{
              background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
              padding: '14px 16px', opacity: d.is_active ? 1 : 0.6,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <span style={{ fontSize: '22px' }}>{d.icon || '🗂️'}</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0a0a0a' }}>
                    {d.name} {!d.is_active && <span style={{ fontSize: '11px', color: '#c62828', fontWeight: '600' }}>(Inactive)</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>/{d.slug} · Order: {d.sort_order}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button onClick={() => openEditForm(d)} style={{
                  background: '#f5f5f5', color: '#333', border: 'none',
                  borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                }}>Edit</button>
                <button onClick={() => toggleActive(d)} style={{
                  background: '#fff3e0', color: '#f4a300', border: 'none',
                  borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                }}>{d.is_active ? 'Deactivate' : 'Activate'}</button>
                <button onClick={() => handleDelete(d.id)} disabled={deletingId === d.id} style={{
                  background: '#ffebee', color: '#c62828', border: 'none',
                  borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                }}>{deletingId === d.id ? 'Deleting...' : 'Delete'}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
