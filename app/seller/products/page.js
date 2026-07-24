'use client'
import { useState, useEffect, Fragment } from 'react'
import { getSession, supabaseFetch, uploadImage } from '@/lib/supabase'
import SellerNav from '@/components/SellerNav'

const emptyCategoryForm = { name: '', sort_order: 0, parent_id: '' }
const emptyProductForm = {
  name: '',
  category_id: '',
  price: '',
  sale_price: '',
  unit: 'pcs',
  stock: 999,
  image_url: '',
  is_available: true,
  description: '',
}

export default function SellerProductsPage() {
  const [shopId, setShopId] = useState('')
  const [loadingShop, setLoadingShop] = useState(true)
  const [maxProducts, setMaxProducts] = useState(null) // null = unlimited
  const [maxCategories, setMaxCategories] = useState(null) // null = unlimited
  const [maxSubcategories, setMaxSubcategories] = useState(null) // null = unlimited
  const [packageName, setPackageName] = useState('')

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
    async function loadShop() {
      setLoadingShop(true)
      try {
        const session = getSession()
        if (session?.user) {
          const shops = await supabaseFetch(`shops?select=id,seller_packages(name_bn,max_products,max_categories,max_subcategories)&owner_id=eq.${session.user.id}`)
          if (shops && shops.length > 0) {
            setShopId(shops[0].id)
            setMaxProducts(shops[0].seller_packages?.max_products ?? null)
            setMaxCategories(shops[0].seller_packages?.max_categories ?? null)
            setMaxSubcategories(shops[0].seller_packages?.max_subcategories ?? null)
            setPackageName(shops[0].seller_packages?.name_bn || '')
          }
        }
      } catch (e) {
        console.error(e)
        setError('Failed to load your shop')
      }
      setLoadingShop(false)
    }
    loadShop()
  }, [])

  async function loadShopData(id) {
    setLoadingData(true)
    setError('')
    try {
      const [catsData, productsData] = await Promise.all([
        supabaseFetch(`product_categories?select=*&shop_id=eq.${id}&order=sort_order`),
        supabaseFetch(`products?select=*&shop_id=eq.${id}&order=sort_order`),
      ])
      setCategories(catsData || [])
      setProducts(productsData || [])
    } catch (e) {
      console.error(e)
      setError('Failed to load products/categories')
    }
    setLoadingData(false)
  }

  useEffect(() => {
    if (shopId) loadShopData(shopId)
  }, [shopId])

  // ---------- Category handlers ----------
  const topCategories = categories.filter(c => !c.parent_id)
  const subcategoriesOf = (parentId) => categories.filter(c => c.parent_id === parentId)
  const allSubcategories = categories.filter(c => c.parent_id)

  const atCategoryLimit = maxCategories != null && topCategories.length >= maxCategories
  const atSubcategoryLimit = maxSubcategories != null && allSubcategories.length >= maxSubcategories

  const openAddCat = (parentId = null) => {
    if (!parentId && atCategoryLimit) {
      setError(`আপনার "${packageName}" প্যাকেজে সর্বোচ্চ ${maxCategories}টি Category যোগ করা যায়। আরও Category যোগ করতে প্যাকেজ আপগ্রেড করুন।`)
      return
    }
    if (parentId && atSubcategoryLimit) {
      setError(`আপনার "${packageName}" প্যাকেজে সর্বোচ্চ ${maxSubcategories}টি Sub-category যোগ করা যায়। আরও Sub-category যোগ করতে প্যাকেজ আপগ্রেড করুন।`)
      return
    }
    setEditingCatId(null)
    setCatForm({ name: '', sort_order: categories.length + 1, parent_id: parentId || '' })
    setShowCatForm(true)
  }
  const openEditCat = (cat) => {
    setEditingCatId(cat.id)
    setCatForm({ name: cat.name, sort_order: cat.sort_order ?? 0, parent_id: cat.parent_id || '' })
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
    if (!editingCatId) {
      if (!catForm.parent_id && atCategoryLimit) {
        setError(`আপনার "${packageName}" প্যাকেজে সর্বোচ্চ ${maxCategories}টি Category যোগ করা যায়।`)
        return
      }
      if (catForm.parent_id && atSubcategoryLimit) {
        setError(`আপনার "${packageName}" প্যাকেজে সর্বোচ্চ ${maxSubcategories}টি Sub-category যোগ করা যায়।`)
        return
      }
    }
    setSavingCat(true)
    setError('')
    try {
      const payload = {
        name: catForm.name.trim(),
        sort_order: Number(catForm.sort_order) || 0,
        shop_id: shopId,
        parent_id: catForm.parent_id || null,
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
      await loadShopData(shopId)
    } catch (e) {
      console.error(e)
      setError('Failed to save category')
    }
    setSavingCat(false)
  }
  const handleDeleteCat = async (id) => {
    if (!confirm('Delete this category? Its products will move to "Other".')) return
    setDeletingCatId(id)
    try {
      await supabaseFetch(`product_categories?id=eq.${id}`, { method: 'DELETE' })
      await loadShopData(shopId)
    } catch (e) {
      console.error(e)
      setError('Failed to delete category')
    }
    setDeletingCatId(null)
  }

  // ---------- Product handlers ----------
  const atProductLimit = maxProducts != null && products.length >= maxProducts

  const openAddProduct = () => {
    if (atProductLimit) {
      setError(`আপনার "${packageName}" প্যাকেজে সর্বোচ্চ ${maxProducts}টি পণ্য যোগ করা যায়। আরও পণ্য যোগ করতে প্যাকেজ আপগ্রেড করুন।`)
      return
    }
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
      setError('Please enter a product name')
      return
    }
    if (!productForm.price) {
      setError('Please enter a price')
      return
    }
    if (!editingProductId && maxProducts != null && products.length >= maxProducts) {
      setError(`আপনার "${packageName}" প্যাকেজে সর্বোচ্চ ${maxProducts}টি পণ্য যোগ করা যায়। আরও পণ্য যোগ করতে প্যাকেজ আপগ্রেড করুন।`)
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
        shop_id: shopId,
        category_id: productForm.category_id || null,
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
      await loadShopData(shopId)
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
      await loadShopData(shopId)
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

  const categoryName = (id) => categories.find(c => c.id === id)?.name || 'Other'

  if (loadingShop) {
    return (
      <SellerNav>
        <div style={{ color: '#888', fontSize: '14px' }}>Loading...</div>
      </SellerNav>
    )
  }

  if (!shopId) {
    return (
      <SellerNav>
        <div style={{ color: '#c62828', fontSize: '14px' }}>Could not find your shop.</div>
      </SellerNav>
    )
  }

  return (
    <SellerNav>
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '8px' }}>Products</h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        Manage categories and products for your shop.
      </p>

      {error && (
        <div style={{
          maxWidth: '600px', marginBottom: '16px', padding: '10px 12px',
          background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
        }}>{error}</div>
      )}

      {!loadingData && (
        <>
          {/* ---------- Categories section ---------- */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#163a2c' }}>Categories</div>
                {(maxCategories != null || maxSubcategories != null) && (
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                    {maxCategories != null && (
                      <span style={{ color: atCategoryLimit ? '#c62828' : '#888' }}>
                        Category: {topCategories.length} / {maxCategories}
                      </span>
                    )}
                    {maxCategories != null && maxSubcategories != null && ' · '}
                    {maxSubcategories != null && (
                      <span style={{ color: atSubcategoryLimit ? '#c62828' : '#888' }}>
                        Sub-category: {allSubcategories.length} / {maxSubcategories}
                      </span>
                    )}
                    {(atCategoryLimit || atSubcategoryLimit) && (
                      <a href="/seller/package" style={{ color: '#2d6a4f', fontWeight: '600', marginLeft: '6px' }}>Upgrade →</a>
                    )}
                  </div>
                )}
              </div>
              {!showCatForm && (
                <button onClick={() => openAddCat(null)} style={{
                  background: atCategoryLimit ? '#eee' : '#e8f5e9', color: atCategoryLimit ? '#999' : '#2d6a4f',
                  border: 'none', borderRadius: '6px',
                  padding: '6px 14px', fontSize: '12px', fontWeight: '600', cursor: atCategoryLimit ? 'not-allowed' : 'pointer'
                }}>+ New Category</button>
              )}
            </div>

            {showCatForm && (
              <form onSubmit={handleCatSubmit} style={{
                background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
                padding: '14px', marginBottom: '14px', maxWidth: '520px',
                display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-end'
              }}>
                {catForm.parent_id && (
                  <div style={{ width: '100%', fontSize: '12px', color: '#2d6a4f', fontWeight: '600' }}>
                    Sub-category under: {categories.find(c => c.id === catForm.parent_id)?.name}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <label style={labelStyle}>Name</label>
                  <input style={inputStyle} value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} placeholder={catForm.parent_id ? 'e.g. Leafy Greens' : 'e.g. Vegetables'} />
                </div>
                <div style={{ width: '80px' }}>
                  <label style={labelStyle}>Order</label>
                  <input type="number" style={inputStyle} value={catForm.sort_order} onChange={e => setCatForm(f => ({ ...f, sort_order: e.target.value }))} />
                </div>
                <button type="submit" disabled={savingCat} style={{
                  background: '#163a2c', color: 'white', border: 'none', borderRadius: '8px',
                  padding: '10px 16px', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap'
                }}>{savingCat ? '...' : (editingCatId ? 'Update' : 'Add')}</button>
                <button type="button" onClick={closeCatForm} style={{
                  background: '#f0f0f0', color: '#555', border: 'none', borderRadius: '8px',
                  padding: '10px 16px', fontSize: '13px'
                }}>Cancel</button>
              </form>
            )}

            {topCategories.length === 0 ? (
              <div style={{ color: '#999', fontSize: '13px' }}>No categories yet. Products can still be added without one (shown under "Other").</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {topCategories.map(cat => (
                  <div key={cat.id} style={{
                    background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '10px 14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#163a2c' }}>{cat.name}</span>
                      <button onClick={() => openEditCat(cat)} style={{
                        background: '#e8f5e9', color: '#2d6a4f', border: 'none', borderRadius: '50%',
                        width: '22px', height: '22px', fontSize: '11px'
                      }}>✎</button>
                      <button onClick={() => handleDeleteCat(cat.id)} disabled={deletingCatId === cat.id} style={{
                        background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '50%',
                        width: '22px', height: '22px', fontSize: '11px'
                      }}>×</button>
                      <button onClick={() => openAddCat(cat.id)} style={{
                        background: atSubcategoryLimit ? '#eee' : '#f1f8f2', color: atSubcategoryLimit ? '#999' : '#2d6a4f',
                        border: 'none', borderRadius: '20px', padding: '4px 12px', fontSize: '11px', fontWeight: '600',
                        cursor: atSubcategoryLimit ? 'not-allowed' : 'pointer', marginLeft: 'auto'
                      }}>+ Sub-category</button>
                    </div>

                    {subcategoriesOf(cat.id).length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px', paddingLeft: '12px', borderLeft: '2px solid #eee' }}>
                        {subcategoriesOf(cat.id).map(sub => (
                          <div key={sub.id} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: '16px',
                            padding: '4px 6px 4px 12px', fontSize: '12px'
                          }}>
                            <span>{sub.name}</span>
                            <button onClick={() => openEditCat(sub)} style={{
                              background: '#e8f5e9', color: '#2d6a4f', border: 'none', borderRadius: '50%',
                              width: '18px', height: '18px', fontSize: '9px'
                            }}>✎</button>
                            <button onClick={() => handleDeleteCat(sub.id)} disabled={deletingCatId === sub.id} style={{
                              background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '50%',
                              width: '18px', height: '18px', fontSize: '9px'
                            }}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ---------- Products section ---------- */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#163a2c' }}>Products</div>
                {maxProducts != null && (
                  <div style={{ fontSize: '12px', color: atProductLimit ? '#c62828' : '#888', marginTop: '2px' }}>
                    {products.length} / {maxProducts} used ({packageName} package)
                    {atProductLimit && (
                      <a href="/seller/package" style={{ color: '#2d6a4f', fontWeight: '600', marginLeft: '6px' }}>Upgrade →</a>
                    )}
                  </div>
                )}
              </div>
              {!showProductForm && (
                <button onClick={openAddProduct} style={{
                  background: atProductLimit ? '#ccc' : '#163a2c', color: 'white', border: 'none', borderRadius: '8px',
                  padding: '10px 18px', fontSize: '14px', fontWeight: '600', cursor: atProductLimit ? 'not-allowed' : 'pointer'
                }}>+ Add Product</button>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={labelStyle}>Product Name *</label>
                    <input style={inputStyle} value={productForm.name} onChange={e => handleProductFieldChange('name', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Category</label>
                    <select style={inputStyle} value={productForm.category_id} onChange={e => handleProductFieldChange('category_id', e.target.value)}>
                      <option value="">Other</option>
                      {topCategories.map(cat => (
                        <Fragment key={cat.id}>
                          <option value={cat.id}>{cat.name}</option>
                          {subcategoriesOf(cat.id).map(sub => (
                            <option key={sub.id} value={sub.id}>&nbsp;&nbsp;— {sub.name}</option>
                          ))}
                        </Fragment>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={labelStyle}>Price (৳) *</label>
                    <input type="number" style={inputStyle} value={productForm.price} onChange={e => handleProductFieldChange('price', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Sale Price (৳)</label>
                    <input type="number" style={inputStyle} value={productForm.sale_price} onChange={e => handleProductFieldChange('sale_price', e.target.value)} placeholder="optional" />
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
                    background: savingProduct ? '#a5d6a7' : '#163a2c', color: 'white', border: 'none',
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
                <p>You haven&apos;t added any products yet</p>
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
                        {categoryName(p.category_id)} · {p.unit} · Stock {p.stock}
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
                    }}>{p.is_available ? 'Available' : 'Hidden'}</span>
                    <button onClick={() => openEditProduct(p)} style={{
                      background: '#e8f5e9', color: '#2d6a4f', border: 'none',
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
    </SellerNav>
  )
}
