'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch, uploadImage } from '@/lib/supabase'

const emptyProductForm = {
  name: '',
  price: '',
  sale_price: '',
  unit: 'pcs',
  stock: 999,
  image_url: '',
  is_available: true,
  description: '',
}

export default function AdminProductsPage() {
  const [shops, setShops] = useState([])
  const [selectedShopId, setSelectedShopId] = useState('')
  const [loadingShops, setLoadingShops] = useState(true)

  const [products, setProducts] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState('')

  // Product form
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)
  const [productForm, setProductForm] = useState(emptyProductForm)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [savingProduct, setSavingProduct] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [deletingProductId, setDeletingProductId] = useState(null)

  useEffect(() => {
    async function loadShops() {
      setLoadingShops(true)
      try {
        const data = await supabaseFetch('shops?select=*&order=name')
        setShops(data || [])
        if (data && data.length > 0) setSelectedShopId(data[0].id)
      } catch (e) {
        console.error(e)
        setError('Failed to load shops')
      }
      setLoadingShops(false)
    }
    loadShops()
  }, [])

  async function loadShopData(shopId) {
    setLoadingData(true)
    setError('')
    try {
      const productsData = await supabaseFetch(`products?select=*&shop_id=eq.${shopId}&order=sort_order`)
      setProducts(productsData || [])
    } catch (e) {
      console.error(e)
      setError('Failed to load products')
    }
    setLoadingData(false)
  }

  useEffect(() => {
    if (selectedShopId) loadShopData(selectedShopId)
  }, [selectedShopId])

  // ---------- Product handlers ----------
  const openAddProduct = () => {
    setEditingProductId(null)
    setProductForm(emptyProductForm)
    setImageFile(null)
    setImagePreview('')
    setShowProductForm(true)
  }
  const openEditProduct = (p) => {
    setEditingProductId(p.id)
    setProductForm({
      name: p.name || '',
      price: p.price ?? '',
      sale_price: p.sale_price ?? '',
      unit: p.unit || 'pcs',
      stock: p.stock ?? 999,
      image_url: p.image_url || '',
      is_available: !!p.is_available,
      description: p.description || '',
    })
    setImageFile(null)
    setImagePreview(p.image_url || '')
    setShowProductForm(true)
  }
  const closeProductForm = () => {
    setShowProductForm(false)
    setEditingProductId(null)
    setProductForm(emptyProductForm)
    setImageFile(null)
    setImagePreview('')
  }
  const handleProductFieldChange = (field, value) => {
    setProductForm((prev) => ({ ...prev, [field]: value }))
  }
  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }
  const handleProductSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!productForm.name.trim()) {
      setError('Please enter the product name')
      return
    }
    if (!productForm.price) {
      setError('Please enter the price')
      return
    }
    setSavingProduct(true)
    try {
      let imageUrl = productForm.image_url
      if (imageFile) {
        setUploading(true)
        imageUrl = await uploadImage(imageFile, 'products')
        setUploading(false)
      }
      const payload = {
        shop_id: selectedShopId,
        name: productForm.name.trim(),
        description: productForm.description.trim() || null,
        price: Number(productForm.price),
        sale_price: productForm.sale_price ? Number(productForm.sale_price) : null,
        unit: productForm.unit.trim() || 'pcs',
        stock: Number(productForm.stock) || 0,
        image_url: imageUrl || null,
        is_available: !!productForm.is_available,
      }
      if (editingProductId) {
        await supabaseFetch(`products?id=eq.${editingProductId}`, {
          method: 'PATCH', body: JSON.stringify(payload),
        })
      } else {
        await supabaseFetch('products', {
          method: 'POST', body: JSON.stringify(payload),
        })
      }
      closeProductForm()
      await loadShopData(selectedShopId)
    } catch (e) {
      console.error(e)
      setError('Failed to save product')
    }
    setSavingProduct(false)
    setUploading(false)
  }
  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return
    setDeletingProductId(id)
    try {
      await supabaseFetch(`products?id=eq.${id}`, { method: 'DELETE' })
      await loadShopData(selectedShopId)
    } catch (e) {
      console.error(e)
      setError('Failed to delete product')
    }
    setDeletingProductId(null)
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
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '8px' }}>Products</h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        First pick a shop, then manage that shop's products.
      </p>

      {/* Shop selector */}
      <div style={{ marginBottom: '24px', maxWidth: '400px' }}>
        <label style={labelStyle}>Select a shop</label>
        {loadingShops ? (
          <div style={{ color: '#888', fontSize: '14px' }}>Loading...</div>
        ) : shops.length === 0 ? (
          <div style={{ color: '#c62828', fontSize: '13px' }}>First add a shop from the "Shops" tab</div>
        ) : (
          <select style={inputStyle} value={selectedShopId} onChange={e => setSelectedShopId(e.target.value)}>
            {shops.map(shop => (
              <option key={shop.id} value={shop.id}>{shop.name}</option>
            ))}
          </select>
        )}
      </div>

      {error && (
        <div style={{
          maxWidth: '600px', marginBottom: '16px', padding: '10px 12px',
          background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
        }}>{error}</div>
      )}

      {selectedShopId && !loadingData && (
        <>
          {/* ---------- Products section ---------- */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#163a2c' }}>Products</div>
              {!showProductForm && (
                <button onClick={openAddProduct} style={{
                  background: '#163a2c', color: 'white', border: 'none', borderRadius: '8px',
                  padding: '10px 18px', fontSize: '14px', fontWeight: '600'
                }}>+ New Product</button>
              )}
            </div>

            {showProductForm && (
              <form onSubmit={handleProductSubmit} style={{
                background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
                padding: '20px', marginBottom: '20px', maxWidth: '600px'
              }}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#163a2c', marginBottom: '16px' }}>
                  {editingProductId ? 'Edit Product' : 'Add New Product'}
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>Product Image</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '8px', background: '#f5f5f5',
                      border: '1px solid #ddd', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', overflow: 'hidden', flexShrink: 0
                    }}>
                      {imagePreview ? (
                        <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : '🛍️'}
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: '13px' }} />
                  </div>
                  {uploading && <div style={{ fontSize: '12px', color: '#2d6a4f', marginTop: '6px' }}>Uploading image...</div>}
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>Product Name *</label>
                  <input style={inputStyle} value={productForm.name} onChange={e => handleProductFieldChange('name', e.target.value)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={labelStyle}>Price (৳) *</label>
                    <input type="number" style={inputStyle} value={productForm.price} onChange={e => handleProductFieldChange('price', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Sale Price (৳)</label>
                    <input type="number" style={inputStyle} value={productForm.sale_price} onChange={e => handleProductFieldChange('sale_price', e.target.value)} placeholder="Optional" />
                  </div>
                  <div>
                    <label style={labelStyle}>Unit</label>
                    <input style={inputStyle} value={productForm.unit} onChange={e => handleProductFieldChange('unit', e.target.value)} placeholder="e.g. kg, pcs" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={labelStyle}>Stock</label>
                    <input type="number" style={inputStyle} value={productForm.stock} onChange={e => handleProductFieldChange('stock', e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#444' }}>
                      <input type="checkbox" checked={productForm.is_available} onChange={e => handleProductFieldChange('is_available', e.target.checked)} />
                      Available (visible on site)
                    </label>
                  </div>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={labelStyle}>Description</label>
                  <textarea rows={2} style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit' }}
                    value={productForm.description} onChange={e => handleProductFieldChange('description', e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" disabled={savingProduct} style={{
                    background: savingProduct ? '#9ca3af' : '#163a2c', color: 'white', border: 'none',
                    borderRadius: '8px', padding: '10px 22px', fontSize: '14px', fontWeight: '600'
                  }}>{savingProduct ? 'Saving...' : (editingProductId ? 'Update' : 'Add')}</button>
                  <button type="button" onClick={closeProductForm} style={{
                    background: '#f0f0f0', color: '#555', border: 'none',
                    borderRadius: '8px', padding: '10px 22px', fontSize: '14px'
                  }}>Cancel</button>
                </div>
              </form>
            )}

            {products.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '40px 20px', color: '#999',
                background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
                <p>No products in this shop yet</p>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                {products.map((p, i) => (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px',
                    borderBottom: i < products.length - 1 ? '1px solid #eee' : 'none'
                  }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '8px', background: '#f5f5f5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', flexShrink: 0
                    }}>
                      {p.image_url ? (
                        <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : '🛍️'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>{p.name}</div>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        {p.unit} · Stock {p.stock}
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#0a0a0a', whiteSpace: 'nowrap' }}>
                      {p.sale_price ? (
                        <>
                          <span style={{ textDecoration: 'line-through', color: '#999', fontWeight: '400', marginRight: '4px' }}>৳{p.price}</span>
                          ৳{p.sale_price}
                        </>
                      ) : `৳${p.price}`}
                    </div>
                    <span style={{
                      fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px',
                      background: p.is_available ? '#f5f5f5' : '#f5f5f5',
                      color: p.is_available ? '#2d6a4f' : '#999'
                    }}>{p.is_available ? 'Available' : 'Unavailable'}</span>
                    <button onClick={() => openEditProduct(p)} style={{
                      background: '#f5f5f5', color: '#2d6a4f', border: 'none',
                      borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                    }}>Edit</button>
                    <button onClick={() => handleDeleteProduct(p.id)} disabled={deletingProductId === p.id} style={{
                      background: '#ffebee', color: '#c62828', border: 'none',
                      borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                    }}>{deletingProductId === p.id ? 'Deleting...' : 'Delete'}</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
