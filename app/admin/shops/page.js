'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch, uploadImage } from '@/lib/supabase'

const emptyForm = {
  name: '',
  category: 'general',
  location: '',
  phone: '',
  description: '',
  image_url: '',
  delivery_time_min: 20,
  delivery_time_max: 40,
  delivery_charge: 0,
  min_order_amount: 0,
  is_featured: false,
  is_active: true,
}

export default function AdminShopsPage() {
  const [shops, setShops] = useState([])
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

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const shopsData = await supabaseFetch('shops?select=*&order=created_at.desc')
      setShops(shopsData || [])
    } catch (e) {
      console.error(e)
      setError('Failed to load data')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const openAddForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setImageFile(null)
    setImagePreview('')
    setError('')
    setShowForm(true)
  }

  const openEditForm = (shop) => {
    setEditingId(shop.id)
    setForm({
      name: shop.name || '',
      category: shop.category || 'general',
      location: shop.location || '',
      phone: shop.phone || '',
      description: shop.description || '',
      image_url: shop.image_url || '',
      delivery_time_min: shop.delivery_time_min ?? 20,
      delivery_time_max: shop.delivery_time_max ?? 40,
      delivery_charge: shop.delivery_charge ?? 0,
      min_order_amount: shop.min_order_amount ?? 0,
      is_featured: !!shop.is_featured,
      is_active: !!shop.is_active,
    })
    setImageFile(null)
    setImagePreview(shop.image_url || '')
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

    if (!form.name.trim()) {
      setError('Please enter the shop name')
      return
    }
    setSubmitting(true)
    try {
      let imageUrl = form.image_url

      if (imageFile) {
        setUploading(true)
        imageUrl = await uploadImage(imageFile, 'shops')
        setUploading(false)
      }

      const payload = {
        name: form.name.trim(),
        category: form.category.trim() || 'general',
        location: form.location.trim() || null,
        phone: form.phone.trim() || null,
        description: form.description.trim() || null,
        image_url: imageUrl || null,
        delivery_time_min: Number(form.delivery_time_min) || 0,
        delivery_time_max: Number(form.delivery_time_max) || 0,
        delivery_charge: Number(form.delivery_charge) || 0,
        min_order_amount: Number(form.min_order_amount) || 0,
        is_featured: !!form.is_featured,
        is_active: !!form.is_active,
      }

      if (editingId) {
        await supabaseFetch(`shops?id=eq.${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
      } else {
        await supabaseFetch('shops', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      }

      closeForm()
      await loadData()
    } catch (e) {
      console.error(e)
      setError('Failed to save')
    }
    setSubmitting(false)
    setUploading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this shop? Its products may also be affected.')) return
    setDeletingId(id)
    try {
      await supabaseFetch(`shops?id=eq.${id}`, { method: 'DELETE' })
      await loadData()
    } catch (e) {
      console.error(e)
      setError('Failed to delete shop')
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

  const filteredShops = shops.filter(shop => {
    const matchesSearch = !searchQuery.trim() ||
      shop.name?.toLowerCase().includes(searchQuery.trim().toLowerCase())
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && shop.is_active) ||
      (statusFilter === 'inactive' && !shop.is_active)
    return matchesSearch && matchesStatus
  })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', margin: 0 }}>Shops</h1>
        {!showForm && (
          <button onClick={openAddForm} style={{
            background: '#163a2c', color: 'white', border: 'none', borderRadius: '8px',
            padding: '10px 18px', fontSize: '14px', fontWeight: '600'
          }}>+ New Shop</button>
        )}
      </div>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        Add, edit, or remove shops from here.
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
            {editingId ? 'Edit Shop' : 'Add New Shop'}
          </div>

          {/* Image upload */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Shop Image</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '70px', height: '70px', borderRadius: '8px', background: '#f5f5f5',
                border: '1px solid #ddd', display: 'flex', alignItems: 'center',
                justifyContent: 'center', overflow: 'hidden', flexShrink: 0
              }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : '🏪'}
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: '13px' }} />
            </div>
            {uploading && <div style={{ fontSize: '12px', color: '#2d6a4f', marginTop: '6px' }}>Uploading image...</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Shop Name *</label>
              <input style={inputStyle} value={form.name} onChange={e => handleFieldChange('name', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <input style={inputStyle} value={form.category} onChange={e => handleFieldChange('category', e.target.value)} placeholder="e.g. Grocery, Fruits, Meat" />
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Address / City</label>
            <input style={inputStyle} value={form.location} onChange={e => handleFieldChange('location', e.target.value)} placeholder="e.g. Dhaka, Chattogram, or any city/country" />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Phone Number</label>
            <input style={inputStyle} value={form.phone} onChange={e => handleFieldChange('phone', e.target.value)} placeholder="e.g. 01712345678" />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Description</label>
            <textarea rows={2} style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit' }}
              value={form.description} onChange={e => handleFieldChange('description', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Delivery Time Min (minutes)</label>
              <input type="number" style={inputStyle} value={form.delivery_time_min} onChange={e => handleFieldChange('delivery_time_min', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Delivery Time Max (minutes)</label>
              <input type="number" style={inputStyle} value={form.delivery_time_max} onChange={e => handleFieldChange('delivery_time_max', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Delivery Charge (৳)</label>
              <input type="number" style={inputStyle} value={form.delivery_charge} onChange={e => handleFieldChange('delivery_charge', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Minimum Order (৳)</label>
              <input type="number" style={inputStyle} value={form.min_order_amount} onChange={e => handleFieldChange('min_order_amount', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '18px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#444' }}>
              <input type="checkbox" checked={form.is_featured} onChange={e => handleFieldChange('is_featured', e.target.checked)} />
              Featured Shop
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#444' }}>
              <input type="checkbox" checked={form.is_active} onChange={e => handleFieldChange('is_active', e.target.checked)} />
              Active (visible on site)
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={submitting} style={{
              background: submitting ? '#9ca3af' : '#163a2c', color: 'white', border: 'none',
              borderRadius: '8px', padding: '10px 22px', fontSize: '14px', fontWeight: '600'
            }}>
              {submitting ? 'Saving...' : (editingId ? 'Update' : 'Add')}
            </button>
            <button type="button" onClick={closeForm} style={{
              background: '#f0f0f0', color: '#555', border: 'none',
              borderRadius: '8px', padding: '10px 22px', fontSize: '14px'
            }}>Cancel</button>
          </div>
        </form>
      )}

      {/* Search & filter bar */}
      {!loading && shops.length > 0 && (
        <div style={{
          display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap'
        }}>
          <input
            style={{ ...inputStyle, maxWidth: '240px' }}
            placeholder="Search by shop name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <select
            style={{ ...inputStyle, maxWidth: '160px' }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      )}

      {/* Shops list */}
      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>Loading...</div>
      ) : shops.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '50px 20px', color: '#999',
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>🏪</div>
          <p>No shops added yet</p>
        </div>
      ) : filteredShops.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '50px 20px', color: '#999',
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔍</div>
          <p>No shops found</p>
        </div>
      ) : (
        <div style={{
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0', overflow: 'hidden'
        }}>
          {filteredShops.map((shop, i) => (
            <div key={shop.id} style={{
              display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
              borderBottom: i < filteredShops.length - 1 ? '1px solid #eee' : 'none'
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '8px', background: '#f5f5f5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0
              }}>
                {shop.image_url ? (
                  <img src={shop.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : '🏪'}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>{shop.name}</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                  {shop.category}{shop.location ? ` · ${shop.location}` : ''}{shop.phone ? ` · ${shop.phone}` : ''}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {shop.is_featured && (
                  <span style={{
                    fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px',
                    background: '#fff3e0', color: '#f4a300'
                  }}>Featured</span>
                )}
                <span style={{
                  fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px',
                  background: shop.is_active ? '#f5f5f5' : '#f5f5f5',
                  color: shop.is_active ? '#2d6a4f' : '#999'
                }}>{shop.is_active ? 'Active' : 'Inactive'}</span>
              </div>

              <button onClick={() => openEditForm(shop)} style={{
                background: '#f5f5f5', color: '#2d6a4f', border: 'none',
                borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
              }}>Edit</button>
              <button onClick={() => handleDelete(shop.id)} disabled={deletingId === shop.id} style={{
                background: '#ffebee', color: '#c62828', border: 'none',
                borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
              }}>
                {deletingId === shop.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
