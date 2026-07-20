'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch, uploadImage } from '@/lib/supabase'

const emptyCategoryForm = { name: '', sort_order: 0 }
const emptyProductForm = {
  name: '',
  category_id: '',
  price: '',
  sale_price: '',
  unit: 'পিস',
  stock: 999,
  image_url: '',
  is_available: true,
  description: '',
}

export default function AdminProductsPage() {
  const [shops, setShops] = useState([])
  const [selectedShopId, setSelectedShopId] = useState('')
  const [loadingShops, setLoadingShops] = useState(true)

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState('')

  // Category form
  const [showCatForm, setShowCatForm] = useState(false)
  const [editingCatId, setEditingCatId] = useState(null)
  const [catForm, setCatForm] = useState(emptyCategoryForm)
  const [savingCat, setSavingCat] = useState(false)

  // Product form
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)
  const [productForm, setProductForm] = useState(emptyProductForm)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [savingProduct, setSavingProduct] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [deletingCatId, setDeletingCatId] = useState(null)
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
        setError('দোকান লোড করতে সমস্যা হয়েছে')
      }
      setLoadingShops(false)
    }
    loadShops()
  }, [])

  async function loadShopData(shopId) {
    setLoadingData(true)
    setError('')
    try {
      const [catsData, productsData] = await Promise.all([
        supabaseFetch(`product_categories?select=*&shop_id=eq.${shopId}&order=sort_order`),
        supabaseFetch(`products?select=*&shop_id=eq.${shopId}&order=sort_order`),
      ])
      setCategories(catsData || [])
      setProducts(productsData || [])
    } catch (e) {
      console.error(e)
      setError('প্রোডাক্ট/ক্যাটাগরি লোড করতে সমস্যা হয়েছে')
    }
    setLoadingData(false)
  }

  useEffect(() => {
    if (selectedShopId) loadShopData(selectedShopId)
  }, [selectedShopId])

  // ---------- Category handlers ----------
  const openAddCat = () => {
    setEditingCatId(null)
    setCatForm({ name: '', sort_order: categories.length + 1 })
    setShowCatForm(true)
  }
  const openEditCat = (cat) => {
    setEditingCatId(cat.id)
    setCatForm({ name: cat.name, sort_order: cat.sort_order ?? 0 })
    setShowCatForm(true)
  }
  const closeCatForm = () => {
    setShowCatForm(false)
    setEditingCatId(null)
    setCatForm(emptyCategoryForm)
  }
  const handleCatSubmit = async (e) => {
    e.preventDefault()
    if (!catForm.name.trim()) return
    setSavingCat(true)
    setError('')
    try {
      const payload = {
        name: catForm.name.trim(),
        sort_order: Number(catForm.sort_order) || 0,
        shop_id: selectedShopId,
      }
      if (editingCatId) {
        await supabaseFetch(`product_categories?id=eq.${editingCatId}`, {
          method: 'PATCH', body: JSON.stringify(payload),
        })
      } else {
        await supabaseFetch('product_categories', {
          method: 'POST', body: JSON.stringify(payload),
        })
      }
      closeCatForm()
      await loadShopData(selectedShopId)
    } catch (e) {
      console.error(e)
      setError('ক্যাটাগরি সেভ করতে সমস্যা হয়েছে')
    }
    setSavingCat(false)
  }
  const handleDeleteCat = async (id) => {
    if (!confirm('এই ক্যাটাগরিটি মুছে ফেলতে চান? এই ক্যাটাগরির প্রোডাক্টগুলো "অন্যান্য"-তে চলে যাবে।')) return
    setDeletingCatId(id)
    try {
      await supabaseFetch(`product_categories?id=eq.${id}`, { method: 'DELETE' })
      await loadShopData(selectedShopId)
    } catch (e) {
      console.error(e)
      setError('ক্যাটাগরি মুছতে সমস্যা হয়েছে')
    }
    setDeletingCatId(null)
  }

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
      category_id: p.category_id || '',
      price: p.price ?? '',
      sale_price: p.sale_price ?? '',
      unit: p.unit || 'পিস',
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
      setError('প্রোডাক্টের নাম দিন')
      return
    }
    if (!productForm.price) {
      setError('দাম দিন')
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
        category_id: productForm.category_id || null,
        name: productForm.name.trim(),
        description: productForm.description.trim() || null,
        price: Number(productForm.price),
        sale_price: productForm.sale_price ? Number(productForm.sale_price) : null,
        unit: productForm.unit.trim() || 'পিস',
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
      setError('প্রোডাক্ট সেভ করতে সমস্যা হয়েছে')
    }
    setSavingProduct(false)
    setUploading(false)
  }
  const handleDeleteProduct = async (id) => {
    if (!confirm('এই প্রোডাক্টটি মুছে ফেলতে চান?')) return
    setDeletingProductId(id)
    try {
      await supabaseFetch(`products?id=eq.${id}`, { method: 'DELETE' })
      await loadShopData(selectedShopId)
    } catch (e) {
      console.error(e)
      setError('প্রোডাক্ট মুছতে সমস্যা হয়েছে')
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

  const categoryName = (id) => categories.find(c => c.id === id)?.name || 'অন্যান্য'

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '8px' }}>প্রোডাক্ট</h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        প্রথমে একটা দোকান বাছাই করো, তারপর সেই দোকানের ক্যাটাগরি ও প্রোডাক্ট ম্যানেজ করো।
      </p>

      {/* Shop selector */}
      <div style={{ marginBottom: '24px', maxWidth: '400px' }}>
        <label style={labelStyle}>দোকান বাছাই করো</label>
        {loadingShops ? (
          <div style={{ color: '#888', fontSize: '14px' }}>লোড হচ্ছে...</div>
        ) : shops.length === 0 ? (
          <div style={{ color: '#c62828', fontSize: '13px' }}>প্রথমে "দোকান" ট্যাব থেকে একটা দোকান যোগ করো</div>
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
          {/* ---------- Categories section ---------- */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#163a2c' }}>ক্যাটাগরি</div>
              {!showCatForm && (
                <button onClick={openAddCat} style={{
                  background: '#e8f5e9', color: '#2d6a4f', border: 'none', borderRadius: '6px',
                  padding: '6px 14px', fontSize: '12px', fontWeight: '600'
                }}>+ নতুন ক্যাটাগরি</button>
              )}
            </div>

            {showCatForm && (
              <form onSubmit={handleCatSubmit} style={{
                background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
                padding: '14px', marginBottom: '14px', maxWidth: '480px',
                display: 'flex', gap: '10px', alignItems: 'flex-end'
              }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>নাম</label>
                  <input style={inputStyle} value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} placeholder="যেমন: সবজি" />
                </div>
                <div style={{ width: '80px' }}>
                  <label style={labelStyle}>ক্রম</label>
                  <input type="number" style={inputStyle} value={catForm.sort_order} onChange={e => setCatForm(f => ({ ...f, sort_order: e.target.value }))} />
                </div>
                <button type="submit" disabled={savingCat} style={{
                  background: '#163a2c', color: 'white', border: 'none', borderRadius: '8px',
                  padding: '10px 16px', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap'
                }}>{savingCat ? '...' : (editingCatId ? 'আপডেট' : 'যোগ')}</button>
                <button type="button" onClick={closeCatForm} style={{
                  background: '#f0f0f0', color: '#555', border: 'none', borderRadius: '8px',
                  padding: '10px 16px', fontSize: '13px'
                }}>বাতিল</button>
              </form>
            )}

            {categories.length === 0 ? (
              <div style={{ color: '#999', fontSize: '13px' }}>কোনো ক্যাটাগরি নাই। ক্যাটাগরি ছাড়াও প্রোডাক্ট যোগ করা যাবে ("অন্যান্য"-তে দেখাবে)।</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {categories.map(cat => (
                  <div key={cat.id} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'white', border: '1px solid #e0e0e0', borderRadius: '20px',
                    padding: '6px 8px 6px 14px', fontSize: '13px'
                  }}>
                    <span>{cat.name}</span>
                    <button onClick={() => openEditCat(cat)} style={{
                      background: '#e8f5e9', color: '#2d6a4f', border: 'none', borderRadius: '50%',
                      width: '22px', height: '22px', fontSize: '11px'
                    }}>✎</button>
                    <button onClick={() => handleDeleteCat(cat.id)} disabled={deletingCatId === cat.id} style={{
                      background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '50%',
                      width: '22px', height: '22px', fontSize: '11px'
                    }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ---------- Products section ---------- */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#163a2c' }}>প্রোডাক্ট</div>
              {!showProductForm && (
                <button onClick={openAddProduct} style={{
                  background: '#163a2c', color: 'white', border: 'none', borderRadius: '8px',
                  padding: '10px 18px', fontSize: '14px', fontWeight: '600'
                }}>+ নতুন প্রোডাক্ট</button>
              )}
            </div>

            {showProductForm && (
              <form onSubmit={handleProductSubmit} style={{
                background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
                padding: '20px', marginBottom: '20px', maxWidth: '600px'
              }}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#163a2c', marginBottom: '16px' }}>
                  {editingProductId ? 'প্রোডাক্ট এডিট করুন' : 'নতুন প্রোডাক্ট যোগ করুন'}
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>প্রোডাক্টের ছবি</label>
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
                  {uploading && <div style={{ fontSize: '12px', color: '#2d6a4f', marginTop: '6px' }}>ছবি আপলোড হচ্ছে...</div>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={labelStyle}>প্রোডাক্টের নাম *</label>
                    <input style={inputStyle} value={productForm.name} onChange={e => handleProductFieldChange('name', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>ক্যাটাগরি</label>
                    <select style={inputStyle} value={productForm.category_id} onChange={e => handleProductFieldChange('category_id', e.target.value)}>
                      <option value="">অন্যান্য</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={labelStyle}>দাম (৳) *</label>
                    <input type="number" style={inputStyle} value={productForm.price} onChange={e => handleProductFieldChange('price', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>ছাড়ের দাম (৳)</label>
                    <input type="number" style={inputStyle} value={productForm.sale_price} onChange={e => handleProductFieldChange('sale_price', e.target.value)} placeholder="ঐচ্ছিক" />
                  </div>
                  <div>
                    <label style={labelStyle}>ইউনিট</label>
                    <input style={inputStyle} value={productForm.unit} onChange={e => handleProductFieldChange('unit', e.target.value)} placeholder="যেমন: কেজি, পিস" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={labelStyle}>স্টক</label>
                    <input type="number" style={inputStyle} value={productForm.stock} onChange={e => handleProductFieldChange('stock', e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#444' }}>
                      <input type="checkbox" checked={productForm.is_available} onChange={e => handleProductFieldChange('is_available', e.target.checked)} />
                      Available (সাইটে দেখাবে)
                    </label>
                  </div>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={labelStyle}>বিবরণ</label>
                  <textarea rows={2} style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit' }}
                    value={productForm.description} onChange={e => handleProductFieldChange('description', e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" disabled={savingProduct} style={{
                    background: savingProduct ? '#a5d6a7' : '#163a2c', color: 'white', border: 'none',
                    borderRadius: '8px', padding: '10px 22px', fontSize: '14px', fontWeight: '600'
                  }}>{savingProduct ? 'সেভ হচ্ছে...' : (editingProductId ? 'আপডেট করুন' : 'যোগ করুন')}</button>
                  <button type="button" onClick={closeProductForm} style={{
                    background: '#f0f0f0', color: '#555', border: 'none',
                    borderRadius: '8px', padding: '10px 22px', fontSize: '14px'
                  }}>বাতিল</button>
                </div>
              </form>
            )}

            {products.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '40px 20px', color: '#999',
                background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
                <p>এই দোকানে এখনো কোনো প্রোডাক্ট নাই</p>
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
                        {categoryName(p.category_id)} · {p.unit} · স্টক {p.stock}
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#2e7d32', whiteSpace: 'nowrap' }}>
                      {p.sale_price ? (
                        <>
                          <span style={{ textDecoration: 'line-through', color: '#999', fontWeight: '400', marginRight: '4px' }}>৳{p.price}</span>
                          ৳{p.sale_price}
                        </>
                      ) : `৳${p.price}`}
                    </div>
                    <span style={{
                      fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px',
                      background: p.is_available ? '#e8f5e9' : '#f5f5f5',
                      color: p.is_available ? '#2d6a4f' : '#999'
                    }}>{p.is_available ? 'Available' : 'বন্ধ'}</span>
                    <button onClick={() => openEditProduct(p)} style={{
                      background: '#e8f5e9', color: '#2d6a4f', border: 'none',
                      borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                    }}>এডিট</button>
                    <button onClick={() => handleDeleteProduct(p.id)} disabled={deletingProductId === p.id} style={{
                      background: '#ffebee', color: '#c62828', border: 'none',
                      borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                    }}>{deletingProductId === p.id ? 'মুছছে...' : 'মুছুন'}</button>
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
