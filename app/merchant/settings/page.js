'use client'
import { useState, useEffect } from 'react'
import { getSession, supabaseFetch, uploadImage } from '@/lib/supabase'
import MerchantNav from '@/components/MerchantNav'

export default function MerchantSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [shopId, setShopId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    name: '',
    category: '',
    location: '',
    phone: '',
    whatsapp_number: '',
    contact_email: '',
    description: '',
    image_url: '',
    banner_url: '',
    delivery_time_min: 20,
    delivery_time_max: 40,
    delivery_charge: 0,
    min_order_amount: 0,
    is_active: true,
    pickup_available: false,
    pickup_address: '',
  })

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [bannerFile, setBannerFile] = useState(null)
  const [bannerPreview, setBannerPreview] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function load() {
      const session = getSession()
      if (!session?.user) return
      try {
        const shops = await supabaseFetch(`shops?select=*&owner_id=eq.${session.user.id}`)
        const shop = shops?.[0]
        if (shop) {
          setShopId(shop.id)
          setForm({
            name: shop.name || '',
            category: shop.category || '',
            location: shop.location || '',
            phone: shop.phone || '',
            whatsapp_number: shop.whatsapp_number || '',
            contact_email: shop.contact_email || '',
            description: shop.description || '',
            image_url: shop.image_url || '',
            banner_url: shop.banner_url || '',
            delivery_time_min: shop.delivery_time_min ?? 20,
            delivery_time_max: shop.delivery_time_max ?? 40,
            delivery_charge: shop.delivery_charge ?? 0,
            min_order_amount: shop.min_order_amount ?? 0,
            is_active: !!shop.is_active,
            pickup_available: !!shop.pickup_available,
            pickup_address: shop.pickup_address || '',
          })
          setImagePreview(shop.image_url || '')
          setBannerPreview(shop.banner_url || '')
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

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerFile(file)
    setBannerPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.name.trim()) {
      setError('Please enter a shop name')
      return
    }
    if (form.pickup_available && !form.pickup_address.trim()) {
      setError('Please enter a pickup address')
      return
    }
    if (!form.whatsapp_number.trim() && !form.contact_email.trim()) {
      setError('Please add a WhatsApp number or an email so buyers can contact you')
      return
    }

    setSaving(true)
    try {
      let imageUrl = form.image_url
      let bannerUrl = form.banner_url
      if (imageFile || bannerFile) {
        setUploading(true)
        if (imageFile) {
          imageUrl = await uploadImage(imageFile, 'shops')
        }
        if (bannerFile) {
          bannerUrl = await uploadImage(bannerFile, 'shops')
        }
        setUploading(false)
      }

      const payload = {
        name: form.name.trim(),
        category: form.category.trim() || 'general',
        location: form.location.trim() || null,
        phone: form.phone.trim() || null,
        whatsapp_number: form.whatsapp_number.trim() || null,
        contact_email: form.contact_email.trim() || null,
        description: form.description.trim() || null,
        image_url: imageUrl || null,
        banner_url: bannerUrl || null,
        delivery_time_min: Number(form.delivery_time_min) || 0,
        delivery_time_max: Number(form.delivery_time_max) || 0,
        delivery_charge: Number(form.delivery_charge) || 0,
        min_order_amount: Number(form.min_order_amount) || 0,
        is_active: !!form.is_active,
        pickup_available: !!form.pickup_available,
        pickup_address: form.pickup_available ? (form.pickup_address.trim() || null) : null,
      }

      await supabaseFetch(`shops?id=eq.${shopId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })

      setForm(prev => ({ ...prev, image_url: imageUrl, banner_url: bannerUrl }))
      setImageFile(null)
      setBannerFile(null)
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
    return (
      <MerchantNav>
        <div style={{ color: '#888', fontSize: '14px' }}>Loading...</div>
      </MerchantNav>
    )
  }

  return (
    <MerchantNav>
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
          background: '#f5f5f5', color: '#2d6a4f', borderRadius: '8px', fontSize: '13px'
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
          background: form.is_active ? '#f5f5f5' : '#ffebee'
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

        {/* Cover photo upload */}
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Cover Photo</label>
          <div style={{
            width: '100%', height: '140px', borderRadius: '8px', background: '#f5f5f5',
            border: '1px solid #ddd', display: 'flex', alignItems: 'center',
            justifyContent: 'center', overflow: 'hidden', marginBottom: '8px'
          }}>
            {bannerPreview ? (
              <img src={bannerPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: '#aaa', fontSize: '13px' }}>No cover photo</span>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleBannerChange} style={{ fontSize: '13px' }} />
          <div style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>
            Recommended size: 1200 x 400px (3:1 ratio), JPG or PNG, under 2MB. This appears as the banner at the top of your shop page.
          </div>
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
          <div style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>
            Recommended size: 400 x 400px (square), JPG or PNG, under 1MB.
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
            <label style={labelStyle}>Location / City (optional)</label>
            <input style={inputStyle} value={form.location} onChange={e => handleFieldChange('location', e.target.value)} placeholder="e.g. Dhaka, Chittagong, or any city/country" />
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

        <div style={{ marginBottom: '14px' }}>
          <div>
            <label style={labelStyle}>Minimum Order Amount (৳)</label>
            <input type="number" style={inputStyle} value={form.min_order_amount} onChange={e => handleFieldChange('min_order_amount', e.target.value)} />
          </div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>
            Delivery charge is now set centrally by Cot Lever (based on the buyer's country, order weight, and item count) — it's no longer set per shop.
          </div>
        </div>

        <div style={{ marginBottom: '6px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#0a0a0a' }}>Buyer Contact</div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '2px', marginBottom: '10px' }}>
            Buyers will see these on your products to message you directly — add at least one.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>WhatsApp Number</label>
            <input style={inputStyle} value={form.whatsapp_number} onChange={e => handleFieldChange('whatsapp_number', e.target.value)} placeholder="e.g. 8801712345678" />
          </div>
          <div>
            <label style={labelStyle}>Contact Email</label>
            <input type="email" style={inputStyle} value={form.contact_email} onChange={e => handleFieldChange('contact_email', e.target.value)} placeholder="e.g. shop@example.com" />
          </div>
        </div>

        {/* Pickup option */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 14px', borderRadius: '8px', marginBottom: form.pickup_available ? '12px' : '20px',
          background: '#f5f5f5', border: '1px solid #e0e0e0'
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
              Store Pickup Available
            </div>
            <div style={{ fontSize: '12px', color: '#777', marginTop: '2px' }}>
              Let customers pick up their order from your store (no delivery charge)
            </div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', flexShrink: 0 }}>
            <input
              type="checkbox"
              checked={form.pickup_available}
              onChange={e => handleFieldChange('pickup_available', e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute', cursor: 'pointer', inset: 0,
              background: form.pickup_available ? '#2d6a4f' : '#ccc',
              borderRadius: '24px', transition: '0.2s'
            }}>
              <span style={{
                position: 'absolute', height: '18px', width: '18px', left: form.pickup_available ? '23px' : '3px',
                bottom: '3px', background: 'white', borderRadius: '50%', transition: '0.2s'
              }} />
            </span>
          </label>
        </div>

        {form.pickup_available && (
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Pickup Address *</label>
            <textarea rows={2} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              value={form.pickup_address} onChange={e => handleFieldChange('pickup_address', e.target.value)}
              placeholder="Full address customers should visit to pick up their order" />
          </div>
        )}

        <button type="submit" disabled={saving} style={{
          background: saving ? '#9ca3af' : '#163a2c', color: 'white', border: 'none',
          borderRadius: '8px', padding: '10px 22px', fontSize: '14px', fontWeight: '600'
        }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
    </MerchantNav>
  )
}
