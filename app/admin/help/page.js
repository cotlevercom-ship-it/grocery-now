'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

const emptyForm = { category: '', title: '', content: '', sort_order: '0', is_active: true }

export default function AdminHelpPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  async function loadArticles() {
    setLoading(true)
    setError('')
    try {
      const data = await supabaseFetch('help_articles?select=*&order=category,sort_order')
      setArticles(data || [])
    } catch (e) {
      console.error(e)
      setError('Could not load help articles')
    }
    setLoading(false)
  }

  useEffect(() => { loadArticles() }, [])

  const openNewForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEditForm = (a) => {
    setEditingId(a.id)
    setForm({
      category: a.category, title: a.title, content: a.content,
      sort_order: String(a.sort_order ?? '0'), is_active: a.is_active !== false,
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
    if (!form.category.trim() || !form.title.trim() || !form.content.trim()) {
      setError('Category, title and content are all required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        category: form.category.trim(),
        title: form.title.trim(),
        content: form.content.trim(),
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
      }
      if (editingId) {
        await supabaseFetch(`help_articles?id=eq.${editingId}`, {
          method: 'PATCH', body: JSON.stringify(payload),
        })
      } else {
        await supabaseFetch('help_articles', {
          method: 'POST', body: JSON.stringify(payload),
        })
      }
      closeForm()
      await loadArticles()
    } catch (e) {
      console.error(e)
      setError('Could not save the article')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this article?')) return
    setDeletingId(id)
    try {
      await supabaseFetch(`help_articles?id=eq.${id}`, { method: 'DELETE' })
      await loadArticles()
    } catch (e) {
      console.error(e)
      setError('Could not delete the article')
    }
    setDeletingId(null)
  }

  const toggleActive = async (a) => {
    try {
      await supabaseFetch(`help_articles?id=eq.${a.id}`, {
        method: 'PATCH', body: JSON.stringify({ is_active: !a.is_active }),
      })
      await loadArticles()
    } catch (e) {
      console.error(e)
      setError('Could not update the article')
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
  }
  const labelStyle = { fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }

  const grouped = articles.reduce((acc, a) => {
    (acc[a.category] = acc[a.category] || []).push(a)
    return acc
  }, {})

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '4px' }}>
            Help Center
          </h1>
          <p style={{ color: '#888', fontSize: '14px' }}>
            Manage the articles shown on the public /help page.
          </p>
        </div>
        {!showForm && (
          <button onClick={openNewForm} style={{
            background: '#163a2c', color: 'white', border: 'none', borderRadius: '8px',
            padding: '10px 18px', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap'
          }}>+ New article</button>
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
          padding: '20px', marginBottom: '24px', maxWidth: '600px'
        }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#163a2c', marginBottom: '14px' }}>
            {editingId ? 'Edit article' : 'New article'}
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Category *</label>
            <input style={inputStyle} value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. Ordering & Payment" list="help-categories" />
            <datalist id="help-categories">
              {Object.keys(grouped).map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Question / Title *</label>
            <input style={inputStyle} value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. How do I place an order?" />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Answer *</label>
            <textarea style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} rows={6}
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              placeholder="Write the answer here..." />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Sort order</label>
              <input style={inputStyle} type="number" value={form.sort_order}
                onChange={e => setForm({ ...form, sort_order: e.target.value })} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#444', marginTop: '18px' }}>
              <input type="checkbox" checked={form.is_active}
                onChange={e => setForm({ ...form, is_active: e.target.checked })} />
              Active
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={saving} style={{
              background: saving ? '#9ca3af' : '#0a0a0a', color: 'white', border: 'none',
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
      ) : articles.length === 0 ? (
        <div style={{ color: '#999', fontSize: '13px' }}>No help articles yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '680px' }}>
          {Object.entries(grouped).map(([cat, list]) => (
            <div key={cat}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#163a2c', marginBottom: '10px' }}>
                {cat}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {list.map(a => (
                  <div key={a.id} style={{
                    background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
                    padding: '14px 16px', opacity: a.is_active ? 1 : 0.6,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px'
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#163a2c' }}>
                        {a.title} {!a.is_active && <span style={{ fontSize: '11px', color: '#c62828', fontWeight: '600' }}>(inactive)</span>}
                      </div>
                      <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                        Order: {a.sort_order}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                      <button onClick={() => openEditForm(a)} style={{
                        background: '#f5f5f5', color: '#2d6a4f', border: 'none',
                        borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                      }}>Edit</button>
                      <button onClick={() => toggleActive(a)} style={{
                        background: '#fff3e0', color: '#f4a300', border: 'none',
                        borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                      }}>{a.is_active ? 'Deactivate' : 'Activate'}</button>
                      <button onClick={() => handleDelete(a.id)} disabled={deletingId === a.id} style={{
                        background: '#ffebee', color: '#c62828', border: 'none',
                        borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                      }}>{deletingId === a.id ? 'Deleting...' : 'Delete'}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
