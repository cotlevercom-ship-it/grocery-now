'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProductDetailModal from './ProductDetailModal'

export default function ProductList({ categories, products, shop }) {
  const router = useRouter()
  const [cart, setCart] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [detailProduct, setDetailProduct] = useState(null)

  // Load cart from localStorage on mount (only if it belongs to this shop)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.shopId === shop.id) {
          setCart(parsed.items || [])
        }
      }
    } catch (e) {
      console.error(e)
    }
  }, [shop.id])

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      if (cart.length > 0) {
        localStorage.setItem('cart', JSON.stringify({
          shopId: shop.id,
          shopName: shop.name,
          items: cart
        }))
      } else {
        // If cart is empty, only clear localStorage if it was for this shop
        const saved = localStorage.getItem('cart')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed.shopId === shop.id) {
            localStorage.removeItem('cart')
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
  }, [cart, shop.id, shop.name])

  const cartKeyFor = (productId, variantId) => variantId ? `${productId}:${variantId}` : productId

  const addToCart = (product, variant, qty = 1) => {
    const cartKey = cartKeyFor(product.id, variant?.id)
    const unitPrice = variant ? (variant.sale_price || variant.price) : (product.sale_price || product.price)

    setCart(prev => {
      const existing = prev.find(i => i.cartKey === cartKey)
      if (existing) {
        return prev.map(i => i.cartKey === cartKey ? { ...i, qty: i.qty + qty } : i)
      }
      return [...prev, {
        cartKey,
        id: product.id,
        variantId: variant?.id || null,
        name: product.name,
        variantName: variant?.name || null,
        price: unitPrice,
        unit: product.unit,
        weightGrams: product.weight_grams || 0,
        image_url: (product.image_urls && product.image_urls[0]) || product.image_url,
        qty,
      }]
    })
  }

  const removeFromCart = (product) => {
    const cartKey = cartKeyFor(product.id, null)
    setCart(prev => {
      const existing = prev.find(i => i.cartKey === cartKey)
      if (existing?.qty === 1) return prev.filter(i => i.cartKey !== cartKey)
      return prev.map(i => i.cartKey === cartKey ? { ...i, qty: i.qty - 1 } : i)
    })
  }

  const getQty = (productId) => cart.find(i => i.cartKey === productId)?.qty || 0

  const totalItems = cart.reduce((a, b) => a + b.qty, 0)
  const totalPrice = cart.reduce((a, b) => a + b.qty * b.price, 0)

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category_id === activeCategory)

  const groupedByCategory = () => {
    if (activeCategory !== 'all') {
      return [{ id: activeCategory, name: '', products: filteredProducts }]
    }
    const uncategorized = products.filter(p => !p.category_id)
    const grouped = categories.map(cat => ({
      ...cat,
      products: products.filter(p => p.category_id === cat.id)
    })).filter(cat => cat.products.length > 0)

    if (uncategorized.length > 0) {
      grouped.push({ id: 'none', name: 'Other', products: uncategorized })
    }
    return grouped
  }

  const priceLabel = (product) => {
    const variants = product.product_variants || []
    if (variants.length === 0) {
      return `৳${product.sale_price || product.price}`
    }
    const prices = variants.map(v => v.sale_price || v.price)
    const min = Math.min(...prices)
    return `From ৳${min}`
  }

  const hasImages = (product) => (product.image_urls && product.image_urls.length > 0) || product.image_url
  const hasMultipleImages = (product) => (product.image_urls && product.image_urls.length > 1)
  const mainImage = (product) => (product.image_urls && product.image_urls[0]) || product.image_url

  const isNew = (product) => {
    if (!product.created_at) return false
    const ageMs = Date.now() - new Date(product.created_at).getTime()
    return ageMs < 7 * 24 * 60 * 60 * 1000
  }
  const isOutOfStock = (product) => product.is_available === false || product.stock === 0
  const discountPercent = (product) => {
    if (!product.sale_price || Number(product.sale_price) >= Number(product.price)) return 0
    return Math.round((1 - Number(product.sale_price) / Number(product.price)) * 100)
  }

  return (
    <div style={{ paddingBottom: totalItems > 0 ? '80px' : '16px' }}>
      {/* Category filter */}
      {categories.length > 0 && (
        <div style={{
          display: 'flex', gap: '8px', padding: '12px 16px',
          overflowX: 'auto', scrollbarWidth: 'none', background: 'white',
          borderBottom: '1px solid #eee'
        }}>
          <button
            onClick={() => setActiveCategory('all')}
            style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
              border: '1px solid', whiteSpace: 'nowrap',
              background: activeCategory === 'all' ? '#2e7d32' : 'white',
              color: activeCategory === 'all' ? 'white' : '#555',
              borderColor: activeCategory === 'all' ? '#2e7d32' : '#ddd',
            }}>All Products</button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
                border: '1px solid', whiteSpace: 'nowrap',
                background: activeCategory === cat.id ? '#2e7d32' : 'white',
                color: activeCategory === cat.id ? 'white' : '#555',
                borderColor: activeCategory === cat.id ? '#2e7d32' : '#ddd',
              }}>{cat.name}</button>
          ))}
        </div>
      )}

      {/* Product groups */}
      <div style={{ padding: '12px 16px' }}>
        {groupedByCategory().map(group => (
          <div key={group.id} style={{ marginBottom: '20px' }}>
            {group.name && (
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '10px' }}>
                {group.name}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {group.products.map(product => {
                const hasVariants = (product.product_variants || []).length > 0
                const qty = getQty(product.id)
                const outOfStock = isOutOfStock(product)
                const discount = discountPercent(product)
                return (
                  <div key={product.id} style={{
                    background: 'white', borderRadius: '14px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden'
                  }}>
                    <div
                      onClick={() => setDetailProduct(product)}
                      style={{
                        aspectRatio: '1 / 1', background: '#f5f5f5',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '40px',
                        position: 'relative', cursor: 'pointer'
                      }}
                    >
                      {hasImages(product) ? (
                        <img src={mainImage(product)} alt={product.name}
                          style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            opacity: outOfStock ? 0.45 : 1
                          }} />
                      ) : '🛍️'}

                      {hasMultipleImages(product) && (
                        <span style={{
                          position: 'absolute', bottom: '6px', right: '6px',
                          background: 'rgba(0,0,0,0.55)', color: 'white',
                          fontSize: '10px', padding: '1px 6px', borderRadius: '8px'
                        }}>+{product.image_urls.length - 1}</span>
                      )}

                      {isNew(product) && !outOfStock && (
                        <span style={{
                          position: 'absolute', top: '8px', left: '8px',
                          background: '#e53935', color: 'white', fontSize: '10px',
                          fontWeight: '700', padding: '3px 8px', borderRadius: '5px',
                          letterSpacing: '0.3px'
                        }}>NEW</span>
                      )}

                      {discount > 0 && !outOfStock && (
                        <span style={{
                          position: 'absolute', top: '8px', right: '8px',
                          background: '#2e7d32', color: 'white', fontSize: '10px',
                          fontWeight: '700', padding: '3px 8px', borderRadius: '5px'
                        }}>-{discount}%</span>
                      )}

                      {outOfStock && (
                        <div style={{
                          position: 'absolute', inset: 0, display: 'flex',
                          alignItems: 'center', justifyContent: 'center'
                        }}>
                          <span style={{
                            background: 'rgba(0,0,0,0.7)', color: 'white',
                            fontSize: '11px', fontWeight: '600', padding: '4px 12px',
                            borderRadius: '6px'
                          }}>Out of Stock</span>
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '10px 10px 12px' }}>
                      <div
                        onClick={() => setDetailProduct(product)}
                        style={{
                          fontSize: '12.5px', fontWeight: '500', color: '#1a1a1a', cursor: 'pointer',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                          overflow: 'hidden', lineHeight: '1.35', minHeight: '34px'
                        }}
                      >{product.name}</div>
                      <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>{product.unit}</div>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '800', color: '#e53935' }}>
                          {hasVariants ? priceLabel(product) : `৳${product.sale_price || product.price}`}
                        </span>
                        {!hasVariants && discount > 0 && (
                          <span style={{ fontSize: '11px', color: '#aaa', textDecoration: 'line-through' }}>
                            ৳{product.price}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                        {outOfStock ? (
                          <span style={{ fontSize: '11px', color: '#c62828', fontWeight: '600' }}>Unavailable</span>
                        ) : hasVariants ? (
                          <button
                            onClick={() => setDetailProduct(product)}
                            style={{
                              padding: '5px 12px', borderRadius: '14px', fontSize: '11px',
                              fontWeight: '600', background: '#2e7d32', color: 'white', border: 'none'
                            }}
                          >Select</button>
                        ) : qty === 0 ? (
                          <button onClick={() => addToCart(product, null, 1)} style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: '#2e7d32', color: 'white', fontSize: '18px', border: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>+</button>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button onClick={() => removeFromCart(product)} style={{
                              width: '24px', height: '24px', borderRadius: '50%',
                              background: '#e8f5e9', color: '#2e7d32', fontSize: '16px', border: 'none',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>-</button>
                            <span style={{ fontSize: '13px', fontWeight: '600' }}>{qty}</span>
                            <button onClick={() => addToCart(product, null, 1)} style={{
                              width: '24px', height: '24px', borderRadius: '50%',
                              background: '#2e7d32', color: 'white', fontSize: '16px', border: 'none',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📦</div>
            <p>No products found</p>
          </div>
        )}
      </div>

      {/* Cart bar */}
      {totalItems > 0 && (
        <div style={{
          position: 'fixed', bottom: '0', left: '0', right: '0',
          background: '#2e7d32', padding: '14px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ color: 'white' }}>
            <div style={{ fontSize: '13px', opacity: 0.85 }}>{totalItems} item{totalItems > 1 ? 's' : ''}</div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>৳{totalPrice}</div>
          </div>
          <button
            onClick={() => router.push('/cart')}
            style={{
              background: 'white', color: '#2e7d32', padding: '10px 20px',
              borderRadius: '8px', fontSize: '14px', fontWeight: '600'
            }}>Checkout →</button>
        </div>
      )}

      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onAddToCart={addToCart}
        />
      )}
    </div>
  )
}
