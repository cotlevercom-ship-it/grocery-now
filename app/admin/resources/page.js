'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

const emptyForm = { title: '', slug: '', excerpt: '', content: '', is_published: true, category_id: '' }

function slugify(title) {
  return title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 80)
}

export default function AdminResourcesPage() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [data, cats] = await Promise.all([
        supabaseFetch('resources?select=*,resource_categories(name)&order=created_at.desc'),
        supabaseFetch('resource_categories?select=*&order=sort_order.asc'),
      ])
      setItems(data || [])
      setCategories(cats || [])
    } catch (e) {
      console.error(e)
      setError('Failed to load')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setError(''); setShowForm(true) }
  const openEdit = (item) => {
    setEditingId(item.id)
    setForm({ title: item.title, slug: item.slug, excerpt: item.excerpt || '', content: item.content, is_published: item.is_published, category_id: item.category_id || '' })
    setError('')
    setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm) }

  const handleChange = (field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'title' && !editingId) next.slug = slugify(value)
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim() || !form.content.trim()) { setError('Title and content are required'); return }

    setSubmitting(true)
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        excerpt: form.excerpt.trim() || null,
        content: form.content.trim(),
        is_published: !!form.is_published,
        category_id: form.category_id || null,
      }
      if (editingId) {
        await supabaseFetch(`resources?id=eq.${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) })
      } else {
        await supabaseFetch('resources', { method: 'POST', body: JSON.stringify(payload) })
      }
      closeForm()
      await load()
    } catch (e) {
      console.error(e)
      setError('Failed to save')
    }
    setSubmitting(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this article?')) return
    try {
      await supabaseFetch(`resources?id=eq.${id}`, { method: 'DELETE' })
      await load()
    } catch (e) {
      console.error(e)
      setError('Failed to delete')
    }
  }

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' }
  const labelStyle = { fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px', fontWeight: '500' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', margin: 0 }}>Resources</h1>
        {!showForm && (
          <button onClick={openAdd} style={{ background: '#163a2c', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '14px', fontWeight: '600' }}>+ New Article</button>
        )}
      </div>

      {error && <div style={{ marginBottom: '16px', padding: '10px 12px', background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px', maxWidth: '640px' }}>{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0', padding: '20px', marginBottom: '24px', maxWidth: '640px' }}>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Title *</label>
            <input style={inputStyle} value={form.title} onChange={e => handleChange('title', e.target.value)} placeholder="Article title" />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Slug</label>
            <input style={inputStyle} value={form.slug} onChange={e => handleChange('slug', e.target.value)} placeholder="auto-generated-from-title" />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Category</label>
            <select style={inputStyle} value={form.category_id} onChange={e => handleChange('category_id', e.target.value)}>
              <option value="">Uncategorized</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}{!c.is_active ? ' (inactive)' : ''}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Excerpt (shown in the list)</label>
            <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={form.excerpt} onChange={e => handleChange('excerpt', e.target.value)} placeholder="One or two sentence summary" />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Content — separate paragraphs with a blank line; start a paragraph with **Heading** then a newline for a subheading</label>
            <textarea style={{ ...inputStyle, minHeight: '220px', resize: 'vertical', fontFamily: 'monospace', fontSize: '13px' }} value={form.content} onChange={e => handleChange('content', e.target.value)} placeholder={"**Section title**\nParagraph text here.\n\nAnother paragraph without a heading."} />
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#444' }}>
              <input type="checkbox" checked={form.is_published} onChange={e => handleChange('is_published', e.target.checked)} />
              Published (visible on the site)
            </label>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={submitting} style={{ background: submitting ? '#9ca3af' : '#163a2c', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 22px', fontSize: '14px', fontWeight: '600' }}>
              {submitting ? 'Saving...' : (editingId ? 'Update' : 'Publish')}
            </button>
            <button type="button" onClick={closeForm} style={{ background: '#f0f0f0', color: '#555', border: 'none', borderRadius: '8px', padding: '10px 22px', fontSize: '14px' }}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>Loading...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#999', background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0' }}>No articles yet</div>
      ) : (
        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          {items.map((item, i) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderBottom: i < items.length - 1 ? '1px solid #eee' : 'none', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '160px' }}>
                <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#1a1a1a' }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>/{item.slug}{item.resource_categories?.name ? ` · ${item.resource_categories.name}` : ''}</div>
              </div>
              <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', background: '#f5f5f5', color: item.is_published ? '#2d6a4f' : '#999' }}>
                {item.is_published ? 'Published' : 'Draft'}
              </span>
              <button onClick={() => openEdit(item)} style={{ background: '#f5f5f5', color: '#2d6a4f', border: 'none', borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500' }}>Edit</button>
              <button onClick={() => handleDelete(item.id)} style={{ background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500' }}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
