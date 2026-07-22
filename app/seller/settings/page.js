'use client'
import { useState, useEffect } from 'react'
import { getSession, supabaseFetch, uploadImage } from '@/lib/supabase'

export default function SellerSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [shopId, setShopId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [areas, setAreas] = useState([])
  const [form, setForm] = useState({
    name: '',
    category: '',
    area_id: '',
    phone: '',
    description: '',
    image_url: '',
    delivery_time_min: 20,
    delivery_time_max: 40,
    delivery_charge: 0,
    min_order_amount: 0,
    is_active: true,
  })

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function load() {
      const session = getSession()
      if (!session?.user) return
      try {
        const [shops, areaRows] = await Promise.all([
          supabaseFetch(`shops?select=*&owner_id=eq.${session.user.id}`),
          supabaseFetch('areas?select=id,name&is_active=eq.true&order=name'),
        ])
        setAreas(areaRows || [])
        const shop = shops?.[0]
        if (shop) {
          setShopId(shop.id)
          setForm({
            name: shop.name || '',
            category: shop.category || '',
            area_id: shop.area_id || '',
            phone: shop.phone || '',
            description: shop.description || '',
            image_url: shop.image_url || '',
            delivery_time_min: shop.delivery_time_min ?? 20,
            delivery_time_max: shop.delivery_time_max ?? 40,
            delivery_charge: shop.delivery_charge ?? 0,
            min_order_amount: shop.min_order_amount ?? 0,
            is_active: !!shop.is_active,
          })
          setImagePreview(shop.image_url || '')
        }
      } catch (e) {
        console.error(e)
        setError('Failed to load shop details')
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleFieldChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
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
    setSuccess('')

    if (!form.name.trim()) {
      setError('Please enter a shop name')
      return
    }
    if (!form.area_id) {
      setError('Please select an area')
      return
    }

    setSaving(true)
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
        is_active: !!form.is_active,
      }

      await supabaseFetch(`shops?id=eq.${shopId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })

      setForm(prev => ({ ...prev, image_url: imageUrl }))
      setImageFile(null)
      setSuccess('Shop details updated successfully')
    } catch (e) {
      console.error(e)
      setError('Failed to save changes, please try again')
    }
    setSaving(false)
    setUploading(false)
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
  }
  const labelStyle = {
    fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px', fontWeight: '500'
  }

  if (loading) {
    return <div style={{ color: '#888', fontSize: '14px' }}>Loading...</div>
  }

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '8px' }}>
        Shop Settings
      </h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        Update your shop's profile, delivery settings, and availability.
      </p>

      {error && (
        <div style={{
          maxWidth: '600px', marginBottom: '16px', padding: '10px 12px',
          background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
        }}>{error}</div>
      )}
      {success && (
        <div style={{
          maxWidth: '600px', marginBottom: '16px', padding: '10px 12px',
          background: '#e8f5e9', color: '#2d6a4f', borderRadius: '8px', fontSize: '13px'
        }}>{success}</div>
      )}

      <form onSubmit={handleSubmit} style={{
        background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
        padding: '20px', maxWidth: '600px'
      }}>
        {/* Active status */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 14px', borderRadius: '8px', marginBottom: '18px',
          background: form.is_active ? '#e8f5e9' : '#ffebee'
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: form.is_active ? '#2d6a4f' : '#c62828' }}>
              {form.is_active ? 'Shop is Active' : 'Shop is Inactive'}
            </div>
            <div style={{ fontSize: '12px', color: '#777', marginTop: '2px' }}>
              {form.is_active ? 'Customers can see and order from your shop' : 'Your shop is hidden from customers'}
            </div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => handleFieldChange('is_active', e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute', cursor: 'pointer', inset: 0,
              background: form.is_active ? '#2d6a4f' : '#ccc',
              borderRadius: '24px', transition: '0.2s'
            }}>
              <span style={{
                position: 'absolute', height: '18px', width: '18px', left: form.is_active ? '23px' : '3px',
                bottom: '3px', background: 'white', borderRadius: '50%', transition: '0.2s'
              }} />
            </span>
          </label>
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
            <input style={inputStyle} value={form.category} onChange={e => handleFieldChange('category', e.target.value)} placeholder="e.g. Grocery, Pharmacy" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div>
            <label style={labelStyle}>Area *</label>
            <select style={inputStyle} value={form.area_id} onChange={e => handleFieldChange('area_id', e.target.value)}>
              <option value="">Select an area</option>
              {areas.map(area => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Phone Number</label>
            <input style={inputStyle} value={form.phone} onChange={e => handleFieldChange('phone', e.target.value)} placeholder="e.g. 01712345678" />
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Description</label>
          <textarea rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            value={form.description} onChange={e => handleFieldChange('description', e.target.value)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div>
            <label style={labelStyle}>Min Delivery Time (minutes)</label>
            <input type="number" style={inputStyle} value={form.delivery_time_min} onChange={e => handleFieldChange('delivery_time_min', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Max Delivery Time (minutes)</label>
            <input type="number" style={inputStyle} value={form.delivery_time_max} onChange={e => handleFieldChange('delivery_time_max', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>Delivery Charge (৳)</label>
            <input type="number" style={inputStyle} value={form.delivery_charge} onChange={e => handleFieldChange('delivery_charge', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Minimum Order Amount (৳)</label>
            <input type="number" style={inputStyle} value={form.min_order_amount} onChange={e => handleFieldChange('min_order_amount', e.target.value)} />
          </div>
        </div>

        <button type="submit" disabled={saving} style={{
          background: saving ? '#a5d6a7' : '#163a2c', color: 'white', border: 'none',
          borderRadius: '8px', padding: '10px 22px', fontSize: '14px', fontWeight: '600'
        }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
