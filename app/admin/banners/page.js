'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch, uploadImage } from '@/lib/supabase'

const emptyForm = {
  image_url: '',
  link_url: '',
  sort_order: 0,
  is_active: true,
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploading, setUploading] = useState(false)

  const [deletingId, setDeletingId] = useState(null)

  async function loadBanners() {
    setLoading(true)
    setError('')
    try {
      const data = await supabaseFetch('banners?select=*&order=sort_order')
      setBanners(data || [])
    } catch (e) {
      console.error(e)
      setError('ব্যানার লোড করতে সমস্যা হয়েছে')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadBanners()
  }, [])

  const openAddForm = () => {
    setEditingId(null)
    setForm({ ...emptyForm, sort_order: banners.length + 1 })
    setImageFile(null)
    setImagePreview('')
    setError('')
    setShowForm(true)
  }

  const openEditForm = (banner) => {
    setEditingId(banner.id)
    setForm({
      image_url: banner.image_url || '',
      link_url: banner.link_url || '',
      sort_order: banner.sort_order ?? 0,
      is_active: !!banner.is_active,
    })
    setImageFile(null)
    setImagePreview(banner.image_url || '')
    setError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setImageFile(null)
    setImagePreview('')
  }

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!imageFile && !form.image_url) {
      setError('ব্যানারের ছবি দিন')
      return
    }

    setSubmitting(true)
    try {
      let imageUrl = form.image_url

      if (imageFile) {
        setUploading(true)
        imageUrl = await uploadImage(imageFile, 'banners')
        setUploading(false)
      }

      const payload = {
        image_url: imageUrl,
        link_url: form.link_url.trim() || null,
        sort_order: Number(form.sort_order) || 0,
        is_active: !!form.is_active,
      }

      if (editingId) {
        await supabaseFetch(`banners?id=eq.${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
      } else {
        await supabaseFetch('banners', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      }

      closeForm()
      await loadBanners()
    } catch (e) {
      console.error(e)
      setError('সেভ করতে সমস্যা হয়েছে')
    }
    setSubmitting(false)
    setUploading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('এই ব্যানারটি মুছে ফেলতে চান?')) return
    setDeletingId(id)
    try {
      await supabaseFetch(`banners?id=eq.${id}`, { method: 'DELETE' })
      await loadBanners()
    } catch (e) {
      console.error(e)
      setError('ব্যানার মুছতে সমস্যা হয়েছে')
    }
    setDeletingId(null)
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
  }
  const labelStyle = {
    fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px', fontWeight: '500'
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', margin: 0 }}>ব্যানার</h1>
        {!showForm && (
          <button onClick={openAddForm} style={{
            background: '#163a2c', color: 'white', border: 'none', borderRadius: '8px',
            padding: '10px 18px', fontSize: '14px', fontWeight: '600'
          }}>+ নতুন ব্যানার</button>
        )}
      </div>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        হোমপেজের উপরের স্লাইডার ব্যানারগুলো এখান থেকে ম্যানেজ করা যাবে।
      </p>

      {error && (
        <div style={{
          maxWidth: '600px', marginBottom: '16px', padding: '10px 12px',
          background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
        }}>{error}</div>
      )}

      {/* Add / Edit form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
          padding: '20px', marginBottom: '24px', maxWidth: '600px'
        }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#163a2c', marginBottom: '16px' }}>
            {editingId ? 'ব্যানার এডিট করুন' : 'নতুন ব্যানার যোগ করুন'}
          </div>

          {/* Image upload */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>ব্যানারের ছবি * (প্রস্থ বেশি, উচ্চতা কম হলে ভালো দেখাবে)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '140px', height: '56px', borderRadius: '8px', background: '#f5f5f5',
                border: '1px solid #ddd', display: 'flex', alignItems: 'center',
                justifyContent: 'center', overflow: 'hidden', flexShrink: 0
              }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : '🖼️'}
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: '13px' }} />
            </div>
            {uploading && <div style={{ fontSize: '12px', color: '#2d6a4f', marginTop: '6px' }}>ছবি আপলোড হচ্ছে...</div>}
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>লিংক (ঐচ্ছিক — ব্যানারে ক্লিক করলে কোথায় যাবে)</label>
            <input style={inputStyle} value={form.link_url} onChange={e => handleFieldChange('link_url', e.target.value)} placeholder="https://..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
            <div>
              <label style={labelStyle}>ক্রম (Sort Order)</label>
              <input type="number" style={inputStyle} value={form.sort_order} onChange={e => handleFieldChange('sort_order', e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#444' }}>
                <input type="checkbox" checked={form.is_active} onChange={e => handleFieldChange('is_active', e.target.checked)} />
                একটিভ (সাইটে দেখাবে)
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={submitting} style={{
              background: submitting ? '#a5d6a7' : '#163a2c', color: 'white', border: 'none',
              borderRadius: '8px', padding: '10px 22px', fontSize: '14px', fontWeight: '600'
            }}>
              {submitting ? 'সেভ হচ্ছে...' : (editingId ? 'আপডেট করুন' : 'যোগ করুন')}
            </button>
            <button type="button" onClick={closeForm} style={{
              background: '#f0f0f0', color: '#555', border: 'none',
              borderRadius: '8px', padding: '10px 22px', fontSize: '14px'
            }}>বাতিল</button>
          </div>
        </form>
      )}

      {/* Banners list */}
      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>লোড হচ্ছে...</div>
      ) : banners.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '50px 20px', color: '#999',
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>🖼️</div>
          <p>এখনো কোনো ব্যানার যোগ করা হয়নি</p>
        </div>
      ) : (
        <div style={{
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0', overflow: 'hidden'
        }}>
          {banners.map((banner, i) => (
            <div key={banner.id} style={{
              display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
              borderBottom: i < banners.length - 1 ? '1px solid #eee' : 'none'
            }}>
              <div style={{
                width: '90px', height: '40px', borderRadius: '8px', background: '#f5f5f5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0
              }}>
                {banner.image_url ? (
                  <img src={banner.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : '🖼️'}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', color: '#1a1a1a' }}>
                  {banner.link_url || 'কোনো লিংক নাই'}
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                  ক্রম: {banner.sort_order}
                </div>
              </div>

              <span style={{
                fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px',
                background: banner.is_active ? '#e8f5e9' : '#f5f5f5',
                color: banner.is_active ? '#2d6a4f' : '#999'
              }}>{banner.is_active ? 'একটিভ' : 'বন্ধ'}</span>

              <button onClick={() => openEditForm(banner)} style={{
                background: '#e8f5e9', color: '#2d6a4f', border: 'none',
                borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
              }}>এডিট</button>
              <button onClick={() => handleDelete(banner.id)} disabled={deletingId === banner.id} style={{
                background: '#ffebee', color: '#c62828', border: 'none',
                borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
              }}>
                {deletingId === banner.id ? 'মুছছে...' : 'মুছুন'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
