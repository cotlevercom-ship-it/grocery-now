'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProductList({ categories, products, shop }) {
  const router = useRouter()
  const [cart, setCart] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')

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

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const removeFromCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing?.qty === 1) return prev.filter(i => i.id !== product.id)
      return prev.map(i => i.id === product.id ? { ...i, qty: i.qty - 1 } : i)
    })
  }

  const getQty = (id) => cart.find(i => i.id === id)?.qty || 0

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
      grouped.push({ id: 'none', name: 'অন্যান্য', products: uncategorized })
    }
    return grouped
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
            }}>সব পণ্য</button>
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
                const qty = getQty(product.id)
                return (
                  <div key={product.id} style={{
                    background: 'white', borderRadius: '10px',
                    border: '1px solid #e0e0e0', overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '90px', background: '#f9fbe7',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '36px'
                    }}>
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : '🛍️'}
                    </div>
                    <div style={{ padding: '8px 10px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '500', color: '#1a1a1a' }}>{product.name}</div>
                      <div style={{ fontSize: '11px', color: '#888' }}>{product.unit}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#2e7d32' }}>৳{product.price}</div>
                        {qty === 0 ? (
                          <button onClick={() => addToCart(product)} style={{
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
                            <button onClick={() => addToCart(product)} style={{
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
            <p>কোনো পণ্য পাওয়া যায়নি</p>
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
            <div style={{ fontSize: '13px', opacity: 0.85 }}>{totalItems}টি আইটেম</div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>৳{totalPrice}</div>
          </div>
          <button
            onClick={() => router.push('/cart')}
            style={{
              background: 'white', color: '#2e7d32', padding: '10px 20px',
              borderRadius: '8px', fontSize: '14px', fontWeight: '600'
            }}>চেকআউট →</button>
        </div>
      )}
    </div>
  )
}
