'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

const emptyForm = {
  section: 'info', title: '', slug: '', content: '',
  link_type: 'page', external_url: '', sort_order: '0', is_active: true,
}

function slugify(text) {
  return text.trim().toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [slugTouched, setSlugTouched] = useState(false)

  const [deletingId, setDeletingId] = useState(null)

  async function loadPages() {
    setLoading(true)
    setError('')
    try {
      const data = await supabaseFetch('site_pages?select=*&order=section,sort_order')
      setPages(data || [])
    } catch (e) {
      console.error(e)
      setError('পেজ লোড করতে সমস্যা হয়েছে')
    }
    setLoading(false)
  }

  useEffect(() => { loadPages() }, [])

  const openNewForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setSlugTouched(false)
    setShowForm(true)
  }

  const openEditForm = (p) => {
    setEditingId(p.id)
    setForm({
      section: p.section || 'info',
      title: p.title || '',
      slug: p.slug || '',
      content: p.content || '',
      link_type: p.link_type || 'page',
      external_url: p.external_url || '',
      sort_order: String(p.sort_order ?? '0'),
      is_active: p.is_active !== false,
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

  const handleTitleChange = (value) => {
    setForm(f => ({
      ...f,
      title: value,
      slug: slugTouched ? f.slug : slugify(value),
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim()) {
      setError('টাইটেল দিন')
      return
    }
    if (form.link_type === 'page' && !form.slug.trim()) {
      setError('Slug দিন (URL এর জন্য)')
      return
    }
    if (form.link_type === 'external' && !form.external_url.trim()) {
      setError('External URL দিন')
      return
    }
    setSaving(true)
    try {
      const payload = {
        section: form.section,
        title: form.title.trim(),
        slug: form.link_type === 'page' ? slugify(form.slug) : null,
        content: form.link_type === 'page' ? form.content : null,
        link_type: form.link_type,
        external_url: form.link_type === 'external' ? form.external_url.trim() : null,
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
      }
      if (editingId) {
        await supabaseFetch(`site_pages?id=eq.${editingId}`, {
          method: 'PATCH', body: JSON.stringify(payload),
        })
      } else {
        await supabaseFetch('site_pages', {
          method: 'POST', body: JSON.stringify(payload),
        })
      }
      closeForm()
      await loadPages()
    } catch (e) {
      console.error(e)
      setError('সেভ করতে সমস্যা হয়েছে। Slug টা ইউনিক আছে কিনা দেখুন।')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('এই পেজটি মুছে ফেলতে চান?')) return
    setDeletingId(id)
    try {
      await supabaseFetch(`site_pages?id=eq.${id}`, { method: 'DELETE' })
      await loadPages()
    } catch (e) {
      console.error(e)
      setError('মুছতে সমস্যা হয়েছে')
    }
    setDeletingId(null)
  }

  const toggleActive = async (p) => {
    try {
      await supabaseFetch(`site_pages?id=eq.${p.id}`, {
        method: 'PATCH', body: JSON.stringify({ is_active: !p.is_active }),
      })
      await loadPages()
    } catch (e) {
      console.error(e)
      setError('স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে')
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
  }
  const labelStyle = { fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }
  const sectionLabel = { info: 'Info', partner: 'Partner With Us' }

  const infoPages = pages.filter(p => p.section === 'info')
  const partnerPages = pages.filter(p => p.section === 'partner')

  const renderList = (list) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {list.map(p => (
        <div key={p.id} style={{
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
          padding: '14px 16px', opacity: p.is_active ? 1 : 0.6,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px'
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#163a2c' }}>
              {p.title} {!p.is_active && <span style={{ fontSize: '11px', color: '#c62828', fontWeight: '600' }}>(নিষ্ক্রিয়)</span>}
            </div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
              {p.link_type === 'external'
                ? `External → ${p.external_url}`
                : `/page/${p.slug}`} · ক্রম: {p.sort_order}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
            <button onClick={() => openEditForm(p)} style={{
              background: '#e8f5e9', color: '#2d6a4f', border: 'none',
              borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
            }}>এডিট</button>
            <button onClick={() => toggleActive(p)} style={{
              background: '#fff3e0', color: '#f4a300', border: 'none',
              borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
            }}>{p.is_active ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}</button>
            <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} style={{
              background: '#ffebee', color: '#c62828', border: 'none',
              borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
            }}>{deletingId === p.id ? 'মুছছে...' : 'মুছুন'}</button>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '4px' }}>
            পেজ ম্যানেজমেন্ট
          </h1>
          <p style={{ color: '#888', fontSize: '14px' }}>
            ফুটারের Info ও Partner With Us সেকশনের লিংক/পেজ এখান থেকে নিয়ন্ত্রণ করুন।
          </p>
        </div>
        {!showForm && (
          <button onClick={openNewForm} style={{
            background: '#163a2c', color: 'white', border: 'none', borderRadius: '8px',
            padding: '10px 18px', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap'
          }}>+ নতুন পেজ</button>
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
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#163a2c', marginBottom: '14px' }}>
            {editingId ? 'পেজ এডিট করুন' : 'নতুন পেজ'}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>সেকশন</label>
              <select style={{ ...inputStyle, background: 'white' }} value={form.section}
                onChange={e => setForm({ ...form, section: e.target.value })}>
                <option value="info">Info</option>
                <option value="partner">Partner With Us</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>ধরন</label>
              <select style={{ ...inputStyle, background: 'white' }} value={form.link_type}
                onChange={e => setForm({ ...form, link_type: e.target.value })}>
                <option value="page">নিজস্ব কন্টেন্ট পেজ</option>
                <option value="external">External লিংক (অন্য পেজে যাবে)</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>টাইটেল (লিংকে যা দেখাবে) *</label>
            <input style={inputStyle} value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="যেমন: About Us" />
          </div>

          {form.link_type === 'page' ? (
            <>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Slug (URL: /page/xxx) *</label>
                <input style={inputStyle} value={form.slug}
                  onChange={e => { setSlugTouched(true); setForm({ ...form, slug: e.target.value }) }}
                  placeholder="about-us" />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>কন্টেন্ট</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} rows={6}
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="পেজের লেখা এখানে দিন..." />
              </div>
            </>
          ) : (
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>External URL *</label>
              <input style={inputStyle} value={form.external_url}
                onChange={e => setForm({ ...form, external_url: e.target.value })}
                placeholder="/seller/login বা https://..." />
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>ক্রম (Sort Order)</label>
              <input style={inputStyle} type="number" value={form.sort_order}
                onChange={e => setForm({ ...form, sort_order: e.target.value })} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#444', marginTop: '18px' }}>
              <input type="checkbox" checked={form.is_active}
                onChange={e => setForm({ ...form, is_active: e.target.checked })} />
              সক্রিয়
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={saving} style={{
              background: saving ? '#a5d6a7' : '#2e7d32', color: 'white', border: 'none',
              borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600'
            }}>{saving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}</button>
            <button type="button" onClick={closeForm} style={{
              background: '#f0f0f0', color: '#555', border: 'none',
              borderRadius: '8px', padding: '10px 20px', fontSize: '14px'
            }}>বাতিল</button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>লোড হচ্ছে...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '680px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#163a2c', marginBottom: '10px' }}>
              {sectionLabel.info}
            </div>
            {infoPages.length === 0 ? (
              <div style={{ color: '#999', fontSize: '13px' }}>কোনো পেজ নেই</div>
            ) : renderList(infoPages)}
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#163a2c', marginBottom: '10px' }}>
              {sectionLabel.partner}
            </div>
            {partnerPages.length === 0 ? (
              <div style={{ color: '#999', fontSize: '13px' }}>কোনো পেজ নেই</div>
            ) : renderList(partnerPages)}
          </div>
        </div>
      )}
    </div>
  )
}
