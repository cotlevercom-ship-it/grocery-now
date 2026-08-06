'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

const emptyForm = { name: '', slug: '', parent_id: '', image_url: '', sort_order: '0', is_active: true }

function slugify(text) {
  return text.trim().toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// Build a flat, depth-annotated list from the parent_id tree so it can render as an indented list.
function flattenTree(categories, parentId = null, depth = 0) {
  const children = categories
    .filter(c => (c.parent_id || null) === parentId)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  let result = []
  for (const c of children) {
    result.push({ ...c, depth })
    result = result.concat(flattenTree(categories, c.id, depth + 1))
  }
  return result
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [slugTouched, setSlugTouched] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  async function loadCategories() {
    setLoading(true)
    setError('')
    try {
      const data = await supabaseFetch('categories?select=*&order=sort_order')
      setCategories(data || [])
    } catch (e) {
      console.error(e)
      setError('Failed to load categories')
    }
    setLoading(false)
  }

  useEffect(() => { loadCategories() }, [])

  const openNewForm = (parentId = '') => {
    setEditingId(null)
    setForm({ ...emptyForm, parent_id: parentId })
    setSlugTouched(false)
    setShowForm(true)
  }

  const openEditForm = (c) => {
    setEditingId(c.id)
    setForm({
      name: c.name || '',
      slug: c.slug || '',
      parent_id: c.parent_id || '',
      image_url: c.image_url || '',
      sort_order: String(c.sort_order ?? '0'),
      is_active: c.is_active !== false,
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
    if (editingId && form.parent_id === editingId) return setError('A category cannot be its own parent')

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        slug: slugify(form.slug),
        parent_id: form.parent_id || null,
        image_url: form.image_url.trim() || null,
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
      }
      if (editingId) {
        await supabaseFetch(`categories?id=eq.${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) })
      } else {
        await supabaseFetch('categories', { method: 'POST', body: JSON.stringify(payload) })
      }
      closeForm()
      await loadCategories()
    } catch (e) {
      console.error(e)
      setError('Failed to save. Check that the slug is unique.')
    }
    setSaving(false)
  }

  const handleDelete = async (c) => {
    const hasChildren = categories.some(x => x.parent_id === c.id)
    const msg = hasChildren
      ? 'This category has subcategories, which will also be deleted. Products in any of these will become uncategorized. Continue?'
      : 'Delete this category? Products in it will become uncategorized.'
    if (!confirm(msg)) return
    setDeletingId(c.id)
    try {
      await supabaseFetch(`categories?id=eq.${c.id}`, { method: 'DELETE' })
      await loadCategories()
    } catch (e) {
      console.error(e)
      setError('Failed to delete')
    }
    setDeletingId(null)
  }

  const toggleActive = async (c) => {
    try {
      await supabaseFetch(`categories?id=eq.${c.id}`, { method: 'PATCH', body: JSON.stringify({ is_active: !c.is_active }) })
      await loadCategories()
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

  const flatList = flattenTree(categories)
  // A category can't be its own parent, and can't be moved under one of its own descendants.
  const descendantIds = (id) => {
    const ids = new Set()
    const walk = (pid) => {
      categories.filter(c => c.parent_id === pid).forEach(c => { ids.add(c.id); walk(c.id) })
    }
    walk(id)
    return ids
  }
  const invalidParentIds = editingId ? descendantIds(editingId) : new Set()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0a0a0a', marginBottom: '4px' }}>Categories</h1>
          <p style={{ color: '#888', fontSize: '14px' }}>
            Global product category tree. Merchants pick from these when listing products — they can&apos;t create their own.
          </p>
        </div>
        {!showForm && (
          <button onClick={() => openNewForm()} style={{
            background: '#0a0a0a', color: 'white', border: 'none', borderRadius: '8px',
            padding: '10px 18px', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap'
          }}>+ New Category</button>
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
            {editingId ? 'Edit Category' : 'New Category'}
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Name *</label>
            <input style={inputStyle} value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Phone Cases" />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Slug *</label>
            <input style={inputStyle} value={form.slug} onChange={e => { setSlugTouched(true); setForm({ ...form, slug: e.target.value }) }} placeholder="phone-cases" />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Parent Category</label>
            <select
              style={inputStyle}
              value={form.parent_id}
              onChange={e => setForm({ ...form, parent_id: e.target.value })}
            >
              <option value="">— None (top-level) —</option>
              {flatList.filter(c => c.id !== editingId && !invalidParentIds.has(c.id)).map(c => (
                <option key={c.id} value={c.id}>{'—'.repeat(c.depth)} {c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Image URL</label>
            <input style={inputStyle} value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
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
      ) : flatList.length === 0 ? (
        <div style={{ color: '#999', fontSize: '13px' }}>No categories yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '760px' }}>
          {flatList.map(c => (
            <div key={c.id} style={{
              background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
              padding: '12px 16px', opacity: c.is_active ? 1 : 0.6,
              marginLeft: `${c.depth * 24}px`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px'
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0a0a0a' }}>
                  {c.depth > 0 && <span style={{ color: '#bbb', marginRight: '6px' }}>└</span>}
                  {c.name} {!c.is_active && <span style={{ fontSize: '11px', color: '#c62828', fontWeight: '600' }}>(Inactive)</span>}
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>/{c.slug} · Order: {c.sort_order}</div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button onClick={() => openNewForm(c.id)} style={{
                  background: '#e8f5e9', color: '#2e7d32', border: 'none',
                  borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                }}>+ Sub</button>
                <button onClick={() => openEditForm(c)} style={{
                  background: '#f5f5f5', color: '#333', border: 'none',
                  borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                }}>Edit</button>
                <button onClick={() => toggleActive(c)} style={{
                  background: '#fff3e0', color: '#f4a300', border: 'none',
                  borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                }}>{c.is_active ? 'Deactivate' : 'Activate'}</button>
                <button onClick={() => handleDelete(c)} disabled={deletingId === c.id} style={{
                  background: '#ffebee', color: '#c62828', border: 'none',
                  borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                }}>{deletingId === c.id ? 'Deleting...' : 'Delete'}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
