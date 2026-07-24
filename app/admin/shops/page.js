'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch, uploadImage } from '@/lib/supabase'

const emptyForm = {
  name: '',
  category: 'general',
  area_id: '',
  phone: '',
  description: '',
  image_url: '',
  delivery_time_min: 20,
  delivery_time_max: 40,
  delivery_charge: 0,
  min_order_amount: 0,
  is_featured: false,
  is_active: true,
  package_id: '',
}

export default function AdminShopsPage() {
  const [shops, setShops] = useState([])
  const [areas, setAreas] = useState([])
  const [packages, setPackages] = useState([])
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
  const [areaFilter, setAreaFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [shopsData, areasData, packagesData] = await Promise.all([
        supabaseFetch('shops?select=*,areas(name),seller_packages(name_bn)&order=created_at.desc'),
        supabaseFetch('areas?select=*&order=name'),
        supabaseFetch('seller_packages?select=*&order=sort_order'),
      ])
      setShops(shopsData || [])
      setAreas(areasData || [])
      setPackages(packagesData || [])
    } catch (e) {
      console.error(e)
      setError('তথ্য লোড করতে সমস্যা হয়েছে')
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
      area_id: shop.area_id || '',
      phone: shop.phone || '',
      description: shop.description || '',
      image_url: shop.image_url || '',
      delivery_time_min: shop.delivery_time_min ?? 20,
      delivery_time_max: shop.delivery_time_max ?? 40,
      delivery_charge: shop.delivery_charge ?? 0,
      min_order_amount: shop.min_order_amount ?? 0,
      is_featured: !!shop.is_featured,
      is_active: !!shop.is_active,
      package_id: shop.package_id || '',
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
      setError('দোকানের নাম দিন')
      return
    }
    if (!form.area_id) {
      setError('এলাকা নির্বাচন করুন')
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
        area_id: form.area_id,
        phone: form.phone.trim() || null,
        description: form.description.trim() || null,
        image_url: imageUrl || null,
        delivery_time_min: Number(form.delivery_time_min) || 0,
        delivery_time_max: Number(form.delivery_time_max) || 0,
        delivery_charge: Number(form.delivery_charge) || 0,
        min_order_amount: Number(form.min_order_amount) || 0,
        is_featured: !!form.is_featured,
        is_active: !!form.is_active,
        package_id: form.package_id || null,
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
      setError('সেভ করতে সমস্যা হয়েছে')
    }
    setSubmitting(false)
    setUploading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('এই দোকানটি মুছে ফেলতে চান? এর সব প্রোডাক্টও প্রভাবিত হতে পারে।')) return
    setDeletingId(id)
    try {
      await supabaseFetch(`shops?id=eq.${id}`, { method: 'DELETE' })
      await loadData()
    } catch (e) {
      console.error(e)
      setError('দোকান মুছতে সমস্যা হয়েছে')
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
    const matchesArea = !areaFilter || shop.area_id === areaFilter
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && shop.is_active) ||
      (statusFilter === 'inactive' && !shop.is_active)
    return matchesSearch && matchesArea && matchesStatus
  })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', margin: 0 }}>দোকান</h1>
        {!showForm && (
          <button onClick={openAddForm} style={{
            background: '#163a2c', color: 'white', border: 'none', borderRadius: '8px',
            padding: '10px 18px', fontSize: '14px', fontWeight: '600'
          }}>+ নতুন দোকান</button>
        )}
      </div>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        সব দোকান এখান থেকে যোগ, এডিট বা মুছে ফেলা যাবে।
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
            {editingId ? 'দোকান এডিট করুন' : 'নতুন দোকান যোগ করুন'}
          </div>

          {/* Image upload */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>দোকানের ছবি</label>
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
            {uploading && <div style={{ fontSize: '12px', color: '#2d6a4f', marginTop: '6px' }}>ছবি আপলোড হচ্ছে...</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>দোকানের নাম *</label>
              <input style={inputStyle} value={form.name} onChange={e => handleFieldChange('name', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>ক্যাটাগরি</label>
              <input style={inputStyle} value={form.category} onChange={e => handleFieldChange('category', e.target.value)} placeholder="যেমন: গ্রোসারি, ফল, মাংস" />
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>এলাকা *</label>
            <select style={inputStyle} value={form.area_id} onChange={e => handleFieldChange('area_id', e.target.value)}>
              <option value="">নির্বাচন করুন</option>
              {areas.map(area => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>ফোন নাম্বার</label>
            <input style={inputStyle} value={form.phone} onChange={e => handleFieldChange('phone', e.target.value)} placeholder="যেমন: 01712345678" />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>বিবরণ</label>
            <textarea rows={2} style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit' }}
              value={form.description} onChange={e => handleFieldChange('description', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>ডেলিভারি টাইম মিন (মিনিট)</label>
              <input type="number" style={inputStyle} value={form.delivery_time_min} onChange={e => handleFieldChange('delivery_time_min', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>ডেলিভারি টাইম ম্যাক্স (মিনিট)</label>
              <input type="number" style={inputStyle} value={form.delivery_time_max} onChange={e => handleFieldChange('delivery_time_max', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>ডেলিভারি চার্জ (৳)</label>
              <input type="number" style={inputStyle} value={form.delivery_charge} onChange={e => handleFieldChange('delivery_charge', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>ন্যূনতম অর্ডার (৳)</label>
              <input type="number" style={inputStyle} value={form.min_order_amount} onChange={e => handleFieldChange('min_order_amount', e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>সাবস্ক্রিপশন প্যাকেজ</label>
            <select style={inputStyle} value={form.package_id} onChange={e => handleFieldChange('package_id', e.target.value)}>
              <option value="">নির্ধারিত নেই</option>
              {packages.map(pkg => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name_bn} {pkg.max_products != null ? `(সর্বোচ্চ ${pkg.max_products}টি পণ্য)` : '(আনলিমিটেড)'}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '18px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#444' }}>
              <input type="checkbox" checked={form.is_featured} onChange={e => handleFieldChange('is_featured', e.target.checked)} />
              ফিচার্ড দোকান
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#444' }}>
              <input type="checkbox" checked={form.is_active} onChange={e => handleFieldChange('is_active', e.target.checked)} />
              একটিভ (সাইটে দেখাবে)
            </label>
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

      {/* Search & filter bar */}
      {!loading && shops.length > 0 && (
        <div style={{
          display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap'
        }}>
          <input
            style={{ ...inputStyle, maxWidth: '240px' }}
            placeholder="দোকানের নাম দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <select
            style={{ ...inputStyle, maxWidth: '200px' }}
            value={areaFilter}
            onChange={e => setAreaFilter(e.target.value)}
          >
            <option value="">সব এলাকা</option>
            {areas.map(area => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </select>
          <select
            style={{ ...inputStyle, maxWidth: '160px' }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">সব স্ট্যাটাস</option>
            <option value="active">একটিভ</option>
            <option value="inactive">বন্ধ</option>
          </select>
        </div>
      )}

      {/* Shops list */}
      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>লোড হচ্ছে...</div>
      ) : shops.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '50px 20px', color: '#999',
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>🏪</div>
          <p>এখনো কোনো দোকান যোগ করা হয়নি</p>
        </div>
      ) : filteredShops.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '50px 20px', color: '#999',
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔍</div>
          <p>কোনো দোকান পাওয়া যায়নি</p>
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
                  {shop.category} · {shop.areas?.name || 'এলাকা নাই'}{shop.phone ? ` · ${shop.phone}` : ''}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {shop.seller_packages?.name_bn && (
                  <span style={{
                    fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px',
                    background: '#ede7f6', color: '#5e35b1'
                  }}>{shop.seller_packages.name_bn}</span>
                )}
                {shop.is_featured && (
                  <span style={{
                    fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px',
                    background: '#fff3e0', color: '#f4a300'
                  }}>ফিচার্ড</span>
                )}
                <span style={{
                  fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px',
                  background: shop.is_active ? '#e8f5e9' : '#f5f5f5',
                  color: shop.is_active ? '#2d6a4f' : '#999'
                }}>{shop.is_active ? 'একটিভ' : 'বন্ধ'}</span>
              </div>

              <button onClick={() => openEditForm(shop)} style={{
                background: '#e8f5e9', color: '#2d6a4f', border: 'none',
                borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
              }}>এডিট</button>
              <button onClick={() => handleDelete(shop.id)} disabled={deletingId === shop.id} style={{
                background: '#ffebee', color: '#c62828', border: 'none',
                borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
              }}>
                {deletingId === shop.id ? 'মুছছে...' : 'মুছুন'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
