'use client'
import { useState, useEffect, useRef, Fragment } from 'react'
import { getSession, supabaseFetch, uploadImage } from '@/lib/supabase'
import SellerNav from '@/components/SellerNav'

const emptyProductForm = {
  name: '',
  category_id: '',
  price: '',
  sale_price: '',
  cost_price: '',
  unit: 'pcs',
  stock: 999,
  image_url: '',
  is_available: true,
  description: '',
  sku: '',
  brand: '',
  weight_grams: '',
  moq: '',
  uom: '',
  carton_size: '',
  model_number: '',
  origin: '',
  certification: '',
  lead_time: '',
  payment_terms: '',
  sample_available: false,
}
const emptyVariant = { id: null, name: '', price: '', sale_price: '', stock: 0, sku: '', is_available: true }
const emptyTier = { min_qty: '', max_qty: '', price: '' }

export default function SellerProductsPage() {
  const [shopId, setShopId] = useState('')
  const [loadingShop, setLoadingShop] = useState(true)
  const [maxProducts, setMaxProducts] = useState(null) // null = unlimited
  const [packageName, setPackageName] = useState('')

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState('')

  // Product form
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)
  const [productForm, setProductForm] = useState(emptyProductForm)
  const [imageSlots, setImageSlots] = useState([]) // [{ id, file: File|null, url: string|null }] — slot 0 is the main image, rest are gallery
  const [activeSlotId, setActiveSlotId] = useState(null)
  const slotFileInputRef = useRef(null)
  const [variants, setVariants] = useState([]) // [{id, name, price, sale_price, stock, sku, is_available}]
  const [tierPricing, setTierPricing] = useState([]) // [{min_qty, max_qty, price}]
  const [savingProduct, setSavingProduct] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [deletingProductId, setDeletingProductId] = useState(null)

  useEffect(() => {
    async function loadShop() {
      setLoadingShop(true)
      try {
        const session = getSession()
        if (session?.user) {
          const shops = await supabaseFetch(`shops?select=id,seller_packages(name_bn,max_products)&owner_id=eq.${session.user.id}`)
          if (shops && shops.length > 0) {
            setShopId(shops[0].id)
            setMaxProducts(shops[0].seller_packages?.max_products ?? null)
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
        supabaseFetch(`products?select=*,product_variants(count)&shop_id=eq.${id}&order=sort_order`),
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

  // ---------- Product handlers ----------
  const atProductLimit = maxProducts != null && products.length >= maxProducts
  const makeSlotId = () => `slot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  const openAddProduct = () => {
    if (atProductLimit) {
      setError(`Your "${packageName}" package allows a maximum of ${maxProducts} products. Upgrade your package to add more.`)
      return
    }
    setEditingProductId(null)
    setProductForm(emptyProductForm)
    setImageSlots([{ id: makeSlotId(), file: null, url: null }])
    setVariants([])
    setTierPricing([])
    setShowProductForm(true)
  }
  const openEditProduct = async (p) => {
    setEditingProductId(p.id)
    setProductForm({
      name: p.name || '',
      category_id: p.category_id || '',
      price: p.price ?? '',
      sale_price: p.sale_price ?? '',
      cost_price: p.cost_price ?? '',
      unit: p.unit || 'pcs',
      stock: p.stock ?? 999,
      image_url: p.image_url || '',
      is_available: !!p.is_available,
      description: p.description || '',
      sku: p.sku || '',
      brand: p.brand || '',
      weight_grams: p.weight_grams ?? '',
      moq: p.moq ?? '',
      uom: p.uom || '',
      carton_size: p.carton_size ?? '',
      model_number: p.model_number || '',
      origin: p.origin || '',
      certification: p.certification || '',
      lead_time: p.lead_time || '',
      payment_terms: p.payment_terms || '',
      sample_available: !!p.sample_available,
    })
    const existingUrls = [p.image_url, ...(p.image_urls || [])].filter(Boolean)
    setImageSlots(existingUrls.length > 0
      ? existingUrls.map(url => ({ id: makeSlotId(), file: null, url }))
      : [{ id: makeSlotId(), file: null, url: null }])
    setTierPricing(Array.isArray(p.tier_pricing) ? p.tier_pricing.map(t => ({
      min_qty: t.min_qty ?? '', max_qty: t.max_qty ?? '', price: t.price ?? '',
    })) : [])
    setShowProductForm(true)
    try {
      const rows = await supabaseFetch(`product_variants?select=*&product_id=eq.${p.id}&order=sort_order`)
      setVariants((rows || []).map(v => ({
        id: v.id, name: v.name || '', price: v.price ?? '', sale_price: v.sale_price ?? '',
        stock: v.stock ?? 0, sku: v.sku || '', is_available: !!v.is_available,
      })))
    } catch (e) {
      console.error(e)
      setVariants([])
    }
  }
  const closeProductForm = () => {
    setShowProductForm(false)
    setEditingProductId(null)
    setProductForm(emptyProductForm)
    setImageSlots([])
    setVariants([])
    setTierPricing([])
  }
  const handleProductFieldChange = (field, value) => {
    setProductForm((prev) => ({ ...prev, [field]: value }))
  }
  const openFilePickerForSlot = (id) => {
    setActiveSlotId(id)
    slotFileInputRef.current?.click()
  }
  const handleSlotFileChange = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !activeSlotId) return
    setImageSlots(prev => prev.map(s => s.id === activeSlotId ? { ...s, file, url: null } : s))
    setActiveSlotId(null)
  }
  const addImageSlot = () => {
    setImageSlots(prev => [...prev, { id: makeSlotId(), file: null, url: null }])
  }
  const removeImageSlot = (id) => {
    setImageSlots(prev => prev.filter(s => s.id !== id))
  }
  const addVariantRow = () => {
    setVariants(prev => [...prev, { ...emptyVariant }])
  }
  const updateVariantField = (idx, field, value) => {
    setVariants(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v))
  }
  const removeVariantRow = (idx) => {
    setVariants(prev => prev.filter((_, i) => i !== idx))
  }
  const addTierRow = () => {
    setTierPricing(prev => [...prev, { ...emptyTier }])
  }
  const updateTierField = (idx, field, value) => {
    setTierPricing(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t))
  }
  const removeTierRow = (idx) => {
    setTierPricing(prev => prev.filter((_, i) => i !== idx))
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
      setError(`Your "${packageName}" package allows a maximum of ${maxProducts} products. Upgrade your package to add more.`)
      return
    }
    setSavingProduct(true)
    try {
      setUploading(true)
      const finalUrls = await Promise.all(imageSlots.map(async (slot) => {
        if (slot.file) return uploadImage(slot.file, 'products')
        return slot.url
      }))
      setUploading(false)
      const cleanUrls = finalUrls.filter(Boolean)
      const imageUrl = cleanUrls[0] || null
      const finalExtraImageUrls = cleanUrls.slice(1)

      const payload = {
        shop_id: shopId,
        category_id: productForm.category_id || null,
        name: productForm.name.trim(),
        description: productForm.description.trim() || null,
        price: Number(productForm.price),
        sale_price: productForm.sale_price ? Number(productForm.sale_price) : null,
        cost_price: productForm.cost_price ? Number(productForm.cost_price) : null,
        unit: productForm.unit.trim() || 'pcs',
        stock: Number(productForm.stock) || 0,
        image_url: imageUrl,
        image_urls: finalExtraImageUrls,
        is_available: !!productForm.is_available,
        sku: productForm.sku.trim() || null,
        brand: productForm.brand.trim() || null,
        weight_grams: productForm.weight_grams ? Number(productForm.weight_grams) : null,
        moq: productForm.moq ? Number(productForm.moq) : null,
        uom: productForm.uom.trim() || null,
        carton_size: productForm.carton_size ? Number(productForm.carton_size) : null,
        model_number: productForm.model_number.trim() || null,
        origin: productForm.origin.trim() || null,
        certification: productForm.certification.trim() || null,
        lead_time: productForm.lead_time.trim() || null,
        payment_terms: productForm.payment_terms.trim() || null,
        sample_available: !!productForm.sample_available,
        tier_pricing: tierPricing
          .filter(t => t.min_qty && t.price)
          .map(t => ({
            min_qty: Number(t.min_qty),
            max_qty: t.max_qty ? Number(t.max_qty) : null,
            price: Number(t.price),
          })),
      }

      let productId = editingProductId
      if (editingProductId) {
        await supabaseFetch(`products?id=eq.${editingProductId}`, {
          method: 'PATCH', body: JSON.stringify(payload),
        })
      } else {
        const rows = await supabaseFetch('products', {
          method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(payload),
        })
        productId = Array.isArray(rows) ? rows[0]?.id : rows?.id
      }

      // Sync variants: delete removed ones, update existing, insert new ones
      if (productId) {
        const existingIds = editingProductId
          ? (await supabaseFetch(`product_variants?select=id&product_id=eq.${productId}`) || []).map(v => v.id)
          : []
        const keptIds = variants.filter(v => v.id).map(v => v.id)
        const toDelete = existingIds.filter(id => !keptIds.includes(id))
        await Promise.all(toDelete.map(id => supabaseFetch(`product_variants?id=eq.${id}`, { method: 'DELETE' })))

        for (let i = 0; i < variants.length; i++) {
          const v = variants[i]
          if (!v.name.trim()) continue
          const vPayload = {
            product_id: productId,
            name: v.name.trim(),
            price: v.price ? Number(v.price) : null,
            sale_price: v.sale_price ? Number(v.sale_price) : null,
            stock: Number(v.stock) || 0,
            sku: v.sku.trim() || null,
            is_available: !!v.is_available,
            sort_order: i,
          }
          if (v.id) {
            await supabaseFetch(`product_variants?id=eq.${v.id}`, { method: 'PATCH', body: JSON.stringify(vPayload) })
          } else {
            await supabaseFetch('product_variants', { method: 'POST', body: JSON.stringify(vPayload) })
          }
        }
      }

      closeProductForm()
      await loadShopData(shopId)
    } catch (e) {
      console.error(e)
      setError('Failed to save product')
    }
    setSavingProduct(false)
    setUploading(false)
    setUploadingExtra(false)
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
    border: '1.5px solid #9ca3af', fontSize: '14px', boxSizing: 'border-box',
    color: '#111', background: '#fff'
  }
  const labelStyle = {
    fontSize: '13px', color: '#333', display: 'block', marginBottom: '6px', fontWeight: '600'
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
      {error && (
        <div style={{
          maxWidth: '600px', marginBottom: '16px', padding: '10px 12px',
          background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
        }}>{error}</div>
      )}

      {!loadingData && (
        <>
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
                  <label style={labelStyle}>Product Images <span style={{ color: '#aaa', fontWeight: '400' }}>— first image is the main photo</span></label>
                  <input ref={slotFileInputRef} type="file" accept="image/*" onChange={handleSlotFileChange} style={{ display: 'none' }} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {imageSlots.map((slot) => {
                      const preview = slot.file ? URL.createObjectURL(slot.file) : slot.url
                      return (
                        <div key={slot.id} style={{ position: 'relative', width: '84px', height: '84px' }}>
                          {preview ? (
                            <>
                              <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1.5px solid #9ca3af' }} />
                              <button type="button" onClick={() => removeImageSlot(slot.id)} style={{
                                position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px',
                                borderRadius: '50%', background: '#c62828', color: 'white', border: 'none', fontSize: '11px', lineHeight: 1
                              }}>×</button>
                            </>
                          ) : (
                            <button type="button" onClick={() => openFilePickerForSlot(slot.id)} style={{
                              width: '100%', height: '100%', borderRadius: '8px', background: '#f9fafb',
                              border: '1.5px dashed #9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '11px', color: '#666', fontWeight: '600', textAlign: 'center', padding: '4px'
                            }}>+ Add Image</button>
                          )}
                        </div>
                      )
                    })}
                    <button type="button" onClick={addImageSlot} title="Add another image box" style={{
                      width: '84px', height: '84px', borderRadius: '8px', background: '#e8f5e9',
                      border: '1.5px dashed #2d6a4f', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '30px', color: '#2d6a4f', fontWeight: '700', lineHeight: 1
                    }}>+</button>
                  </div>
                  {uploading && <div style={{ fontSize: '12px', color: '#2d6a4f', marginTop: '6px' }}>Uploading images...</div>}
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
                    <label style={labelStyle}>Cost Price (৳) <span style={{ color: '#aaa', fontWeight: '400' }}>— private, only you see this</span></label>
                    <input type="number" style={inputStyle} value={productForm.cost_price} onChange={e => handleProductFieldChange('cost_price', e.target.value)} placeholder="optional" />
                  </div>
                  <div>
                    <label style={labelStyle}>Weight (grams)</label>
                    <input type="number" style={inputStyle} value={productForm.weight_grams} onChange={e => handleProductFieldChange('weight_grams', e.target.value)} placeholder="optional" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={labelStyle}>Brand</label>
                    <input style={inputStyle} value={productForm.brand} onChange={e => handleProductFieldChange('brand', e.target.value)} placeholder="optional" />
                  </div>
                  <div>
                    <label style={labelStyle}>SKU / Product Code</label>
                    <input style={inputStyle} value={productForm.sku} onChange={e => handleProductFieldChange('sku', e.target.value)} placeholder="optional" />
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Variants (e.g. Size, Color) — optional</label>
                    <button type="button" onClick={addVariantRow} style={{
                      background: '#e8f5e9', color: '#2d6a4f', border: 'none', borderRadius: '6px',
                      padding: '5px 12px', fontSize: '12px', fontWeight: '600'
                    }}>+ Add Variant</button>
                  </div>
                  {variants.length === 0 ? (
                    <div style={{ fontSize: '12px', color: '#999' }}>No variants — this product will be sold as a single option.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {variants.map((v, idx) => (
                        <div key={v.id || `new-${idx}`} style={{
                          display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center',
                          background: '#faf9f7', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '10px'
                        }}>
                          <input style={{ ...inputStyle, flex: '1 1 140px' }} value={v.name} onChange={e => updateVariantField(idx, 'name', e.target.value)} placeholder="e.g. Large / Red" />
                          <input type="number" style={{ ...inputStyle, width: '90px' }} value={v.price} onChange={e => updateVariantField(idx, 'price', e.target.value)} placeholder="Price ৳" />
                          <input type="number" style={{ ...inputStyle, width: '90px' }} value={v.sale_price} onChange={e => updateVariantField(idx, 'sale_price', e.target.value)} placeholder="Sale ৳" />
                          <input type="number" style={{ ...inputStyle, width: '80px' }} value={v.stock} onChange={e => updateVariantField(idx, 'stock', e.target.value)} placeholder="Stock" />
                          <input style={{ ...inputStyle, width: '100px' }} value={v.sku} onChange={e => updateVariantField(idx, 'sku', e.target.value)} placeholder="SKU" />
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#444' }}>
                            <input type="checkbox" checked={v.is_available} onChange={e => updateVariantField(idx, 'is_available', e.target.checked)} />
                            On
                          </label>
                          <button type="button" onClick={() => removeVariantRow(idx)} style={{
                            background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '50%',
                            width: '22px', height: '22px', fontSize: '11px'
                          }}>×</button>
                        </div>
                      ))}
                      <div style={{ fontSize: '11px', color: '#999' }}>Leave Price/Sale ৳ empty to use the product's own price for that variant.</div>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '8px', marginTop: '4px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#163a2c', borderTop: '1px solid #eee', paddingTop: '14px' }}>
                    B2B / Wholesale Details <span style={{ color: '#aaa', fontWeight: '400' }}>— optional</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={labelStyle}>MOQ (Minimum Order Qty)</label>
                    <input type="number" style={inputStyle} value={productForm.moq} onChange={e => handleProductFieldChange('moq', e.target.value)} placeholder="e.g. 50" />
                  </div>
                  <div>
                    <label style={labelStyle}>Unit of Measure (UOM)</label>
                    <input style={inputStyle} value={productForm.uom} onChange={e => handleProductFieldChange('uom', e.target.value)} placeholder="e.g. Piece, Dozen, Carton, Sack" />
                  </div>
                  <div>
                    <label style={labelStyle}>Carton / Packing Size</label>
                    <input type="number" style={inputStyle} value={productForm.carton_size} onChange={e => handleProductFieldChange('carton_size', e.target.value)} placeholder="units per carton" />
                  </div>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Bulk / Tier Pricing — optional</label>
                    <button type="button" onClick={addTierRow} style={{
                      background: '#e8f5e9', color: '#2d6a4f', border: 'none', borderRadius: '6px',
                      padding: '5px 12px', fontSize: '12px', fontWeight: '600'
                    }}>+ Add Tier</button>
                  </div>
                  {tierPricing.length === 0 ? (
                    <div style={{ fontSize: '12px', color: '#999' }}>No tiers — product will sell at the price above regardless of quantity.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {tierPricing.map((t, idx) => (
                        <div key={idx} style={{
                          display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center',
                          background: '#faf9f7', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '10px'
                        }}>
                          <input type="number" style={{ ...inputStyle, width: '90px' }} value={t.min_qty} onChange={e => updateTierField(idx, 'min_qty', e.target.value)} placeholder="Min qty" />
                          <span style={{ fontSize: '12px', color: '#999' }}>to</span>
                          <input type="number" style={{ ...inputStyle, width: '90px' }} value={t.max_qty} onChange={e => updateTierField(idx, 'max_qty', e.target.value)} placeholder="Max qty (blank = ∞)" />
                          <span style={{ fontSize: '12px', color: '#999' }}>=</span>
                          <input type="number" style={{ ...inputStyle, width: '100px' }} value={t.price} onChange={e => updateTierField(idx, 'price', e.target.value)} placeholder="Price ৳" />
                          <button type="button" onClick={() => removeTierRow(idx)} style={{
                            background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '50%',
                            width: '22px', height: '22px', fontSize: '11px'
                          }}>×</button>
                        </div>
                      ))}
                      <div style={{ fontSize: '11px', color: '#999' }}>Example: 1–50 units = ৳100, 51–100 = ৳95, 101+ = ৳90 (leave Max qty blank on the last tier).</div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={labelStyle}>Model / Item Number</label>
                    <input style={inputStyle} value={productForm.model_number} onChange={e => handleProductFieldChange('model_number', e.target.value)} placeholder="optional" />
                  </div>
                  <div>
                    <label style={labelStyle}>Origin / Manufacturer</label>
                    <input style={inputStyle} value={productForm.origin} onChange={e => handleProductFieldChange('origin', e.target.value)} placeholder="e.g. Made in Bangladesh" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={labelStyle}>Certification</label>
                    <input style={inputStyle} value={productForm.certification} onChange={e => handleProductFieldChange('certification', e.target.value)} placeholder="e.g. BSTI, ISO" />
                  </div>
                  <div>
                    <label style={labelStyle}>Lead Time</label>
                    <input style={inputStyle} value={productForm.lead_time} onChange={e => handleProductFieldChange('lead_time', e.target.value)} placeholder="e.g. 7-10 days after order" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                  <div>
                    <label style={labelStyle}>Payment Terms</label>
                    <input style={inputStyle} value={productForm.payment_terms} onChange={e => handleProductFieldChange('payment_terms', e.target.value)} placeholder="e.g. 50% advance, rest on delivery" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#444' }}>
                      <input type="checkbox" checked={productForm.sample_available} onChange={e => handleProductFieldChange('sample_available', e.target.checked)} />
                      Sample available
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
                        {p.brand ? ` · ${p.brand}` : ''}
                        {p.sku ? ` · SKU ${p.sku}` : ''}
                        {p.product_variants?.[0]?.count > 0 ? ` · ${p.product_variants[0].count} variant${p.product_variants[0].count !== 1 ? 's' : ''}` : ''}
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
