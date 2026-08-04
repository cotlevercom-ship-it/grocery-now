'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getAllShopCarts, setShopCart } from '@/lib/cart'

export default function CartPage() {
  const router = useRouter()
  const [shopCarts, setShopCarts] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      setShopCarts(getAllShopCarts())
    } catch (e) {
      console.error(e)
    }
    setLoaded(true)
  }, [])

  const keyOf = (item) => item.cartKey || item.id

  const updateShopItems = (shopId, shopName, newItems) => {
    setShopCart(shopId, shopName, newItems)
    setShopCarts(getAllShopCarts())
  }

  const addQty = (shopId, shopName, items, cartKey) => {
    updateShopItems(shopId, shopName, items.map(i => keyOf(i) === cartKey ? { ...i, qty: i.qty + 1 } : i))
  }

  const removeQty = (shopId, shopName, items, cartKey) => {
    const item = items.find(i => keyOf(i) === cartKey)
    const newItems = item.qty === 1
      ? items.filter(i => keyOf(i) !== cartKey)
      : items.map(i => keyOf(i) === cartKey ? { ...i, qty: i.qty - 1 } : i)
    updateShopItems(shopId, shopName, newItems)
  }

  const deleteItem = (shopId, shopName, items, cartKey) => {
    updateShopItems(shopId, shopName, items.filter(i => keyOf(i) !== cartKey))
  }

  if (!loaded) {
    return null
  }

  const activeShops = shopCarts.filter(s => s.items.length > 0)

  if (activeShops.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <div style={{
          background: '#0a0a0a', padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <Link href="/">
            <div style={{ color: 'white', fontSize: '22px', lineHeight: 1 }}>←</div>
          </Link>
          <div style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>Cart</div>
        </div>
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#999' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
          <p style={{ marginBottom: '20px' }}>Your cart is empty</p>
          <Link href="/shops" style={{
            display: 'inline-block', background: '#0a0a0a', color: 'white',
            padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600'
          }}>Browse shops</Link>
        </div>
      </div>
    )
  }

  const totalItems = activeShops.reduce((sum, s) => sum + s.items.reduce((a, b) => a + b.qty, 0), 0)
  const subtotal = activeShops.reduce((sum, s) => sum + s.items.reduce((a, b) => a + b.qty * b.price, 0), 0)

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', paddingBottom: 'calc(90px + env(safe-area-inset-bottom))' }} className="cart-page">
      {/* Topbar */}
      <div style={{
        background: '#0a0a0a', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <Link href="/">
          <div style={{ color: 'white', fontSize: '22px', lineHeight: 1 }}>←</div>
        </Link>
        <div style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>
          Cart {activeShops.length > 1 ? `· ${activeShops.length} shops` : ''}
        </div>
      </div>

      <div className="cart-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px' }}>
        <div className="cart-layout" style={{ display: 'flex', gap: '20px' }}>

          {/* Left: items, grouped per shop */}
          <div className="cart-items-col" style={{ flex: 1, minWidth: 0 }}>
            {activeShops.map(({ shopId, shopName, items }) => {
              const shopSubtotal = items.reduce((a, b) => a + b.qty * b.price, 0)
              return (
                <div key={shopId} style={{ marginBottom: '18px' }}>
                  <div style={{
                    fontSize: '13px', color: '#1a1a1a', marginBottom: '10px', fontWeight: '700',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'
                  }}>
                    <span>{shopName}</span>
                    <span style={{ fontWeight: '500', color: '#888', fontSize: '12px' }}>৳{shopSubtotal}</span>
                  </div>

                  {items.map(item => {
                    const cartKey = keyOf(item)
                    return (
                      <div key={cartKey} style={{
                        background: 'white', borderRadius: '6px', border: '1px solid #e5e5e5',
                        padding: '14px', marginBottom: '10px',
                        display: 'flex', alignItems: 'center', gap: '14px'
                      }}>
                        <div style={{
                          width: '72px', height: '72px', borderRadius: '4px',
                          background: '#f5f5f5', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '24px', flexShrink: 0, overflow: 'hidden'
                        }}>
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : '🛍️'}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#1a1a1a', marginBottom: '3px' }}>{item.name}</div>
                          <div style={{ fontSize: '11.5px', color: '#888', marginBottom: '6px' }}>
                            {item.variantName || item.unit}
                          </div>
                          <div style={{ fontSize: '13px', color: '#666' }}>
                            ৳{item.price} × {item.qty} = <span style={{ fontWeight: '700', color: '#0a0a0a' }}>৳{item.price * item.qty}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                            <button onClick={() => removeQty(shopId, shopName, items, cartKey)} style={{
                              width: '26px', height: '26px', background: '#f5f5f5', color: '#0a0a0a', fontSize: '15px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none'
                            }}>-</button>
                            <span style={{ fontSize: '13px', fontWeight: '600', minWidth: '28px', textAlign: 'center' }}>{item.qty}</span>
                            <button onClick={() => addQty(shopId, shopName, items, cartKey)} style={{
                              width: '26px', height: '26px', background: '#0a0a0a', color: 'white', fontSize: '15px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none'
                            }}>+</button>
                          </div>
                          <button onClick={() => deleteItem(shopId, shopName, items, cartKey)} style={{
                            fontSize: '11px', color: '#d32f2f', background: 'none', border: 'none'
                          }}>Remove</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>

          {/* Right: sticky summary (desktop) */}
          <div className="cart-summary-col">
            <div style={{
              background: 'white', borderRadius: '6px',
              border: '1px solid #e5e5e5', padding: '18px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a', marginBottom: '14px' }}>
                Order Summary
              </div>
              {activeShops.length > 1 && (
                <div style={{
                  fontSize: '12px', color: '#666', background: '#fdf1d9', padding: '8px 10px',
                  borderRadius: '6px', marginBottom: '12px', lineHeight: 1.5
                }}>
                  Items from {activeShops.length} different shops will be shipped as separate orders.
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', marginBottom: '10px' }}>
                <span>Subtotal ({totalItems} item{totalItems > 1 ? 's' : ''})</span>
                <span>৳{subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', marginBottom: '10px' }}>
                <span>Delivery charge</span>
                <span>Added at checkout</span>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', fontSize: '16px',
                fontWeight: '700', color: '#1a1a1a', paddingTop: '12px', borderTop: '1px solid #eee', marginBottom: '16px'
              }}>
                <span>Total</span>
                <span>৳{subtotal}</span>
              </div>
              <button
                onClick={() => router.push('/checkout')}
                className="desktop-place-order"
                style={{
                  width: '100%', background: '#f4a300', color: '#1a1a1a', padding: '12px',
                  borderRadius: '6px', fontSize: '14px', fontWeight: '700', border: 'none'
                }}>Place order →</button>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar (mobile only) */}
      <div className="mobile-bottom-bar" style={{
        position: 'fixed', bottom: '0', left: '0', right: '0',
        background: '#0a0a0a', padding: '14px 16px calc(14px + env(safe-area-inset-bottom))',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ color: 'white' }}>
          <div style={{ fontSize: '13px', opacity: 0.85 }}>{totalItems} item{totalItems > 1 ? 's' : ''}</div>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>৳{subtotal}</div>
        </div>
        <button
          onClick={() => router.push('/checkout')}
          style={{
            background: 'white', color: '#0a0a0a', padding: '10px 24px',
            borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: 'none'
          }}>Place order →</button>
      </div>

      <style jsx>{`
        .cart-layout { flex-direction: column; }
        .cart-summary-col { width: 100%; }
        .desktop-place-order { display: none; }
        @media (min-width: 860px) {
          .cart-layout { flex-direction: row; align-items: flex-start; }
          .cart-summary-col { width: 320px; flex-shrink: 0; position: sticky; top: 20px; }
          .desktop-place-order { display: block; }
          .mobile-bottom-bar { display: none; }
          .cart-page { padding-bottom: 40px !important; }
        }
      `}</style>
    </div>
  )
}
