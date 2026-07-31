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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {group.products.map(product => {
                const hasVariants = (product.product_variants || []).length > 0
                const qty = getQty(product.id)
                return (
                  <div key={product.id} style={{
                    background: 'white', borderRadius: '10px',
                    border: '1px solid #e0e0e0', overflow: 'hidden'
                  }}>
                    <div
                      onClick={() => setDetailProduct(product)}
                      style={{
                        height: '90px', background: '#f9fbe7',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '36px',
                        position: 'relative', cursor: 'pointer'
                      }}
                    >
                      {hasImages(product) ? (
                        <img src={mainImage(product)} alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : '🛍️'}
                      {hasMultipleImages(product) && (
                        <span style={{
                          position: 'absolute', bottom: '4px', right: '6px',
                          background: 'rgba(0,0,0,0.55)', color: 'white',
                          fontSize: '10px', padding: '1px 6px', borderRadius: '8px'
                        }}>+{product.image_urls.length - 1}</span>
                      )}
                    </div>
                    <div style={{ padding: '8px 10px' }}>
                      <div
                        onClick={() => setDetailProduct(product)}
                        style={{ fontSize: '12px', fontWeight: '500', color: '#1a1a1a', cursor: 'pointer' }}
                      >{product.name}</div>
                      <div style={{ fontSize: '11px', color: '#888' }}>{product.unit}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#2e7d32' }}>{priceLabel(product)}</div>

                        {hasVariants ? (
                          <button
                            onClick={() => setDetailProduct(product)}
                            style={{
                              padding: '5px 10px', borderRadius: '14px', fontSize: '11px',
                              fontWeight: '600', background: '#2e7d32', color: 'white'
                            }}
                          >Select</button>
                        ) : qty === 0 ? (
                          <button onClick={() => addToCart(product, null, 1)} style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: '#2e7d32', color: 'white', fontSize: '18px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>+</button>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button onClick={() => removeFromCart(product)} style={{
                              width: '24px', height: '24px', borderRadius: '50%',
                              background: '#e8f5e9', color: '#2e7d32', fontSize: '16px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>-</button>
                            <span style={{ fontSize: '13px', fontWeight: '600' }}>{qty}</span>
                            <button onClick={() => addToCart(product, null, 1)} style={{
                              width: '24px', height: '24px', borderRadius: '50%',
                              background: '#2e7d32', color: 'white', fontSize: '16px',
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
