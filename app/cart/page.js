'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const router = useRouter()
  const [cartData, setCartData] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart')
      if (saved) {
        setCartData(JSON.parse(saved))
      }
    } catch (e) {
      console.error(e)
    }
    setLoaded(true)
  }, [])

  const saveCart = (updated) => {
    setCartData(updated)
    if (updated && updated.items && updated.items.length > 0) {
      localStorage.setItem('cart', JSON.stringify(updated))
    } else {
      localStorage.removeItem('cart')
    }
  }

  const addQty = (id) => {
    const updated = {
      ...cartData,
      items: cartData.items.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i)
    }
    saveCart(updated)
  }

  const removeQty = (id) => {
    const item = cartData.items.find(i => i.id === id)
    let newItems
    if (item.qty === 1) {
      newItems = cartData.items.filter(i => i.id !== id)
    } else {
      newItems = cartData.items.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i)
    }
    saveCart({ ...cartData, items: newItems })
  }

  const deleteItem = (id) => {
    const newItems = cartData.items.filter(i => i.id !== id)
    saveCart({ ...cartData, items: newItems })
  }

  if (!loaded) {
    return null
  }

  if (!cartData || !cartData.items || cartData.items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <div style={{
          background: '#2e7d32', padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <Link href="/">
            <div style={{ color: 'white', fontSize: '22px', lineHeight: 1 }}>←</div>
          </Link>
          <div style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>কার্ট</div>
        </div>
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#999' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
          <p style={{ marginBottom: '20px' }}>আপনার কার্ট খালি</p>
          <Link href="/shops" style={{
            display: 'inline-block', background: '#2e7d32', color: 'white',
            padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600'
          }}>দোকান দেখুন</Link>
        </div>
      </div>
    )
  }

  const totalItems = cartData.items.reduce((a, b) => a + b.qty, 0)
  const subtotal = cartData.items.reduce((a, b) => a + b.qty * b.price, 0)

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', paddingBottom: '100px' }}>
      {/* Topbar */}
      <div style={{
        background: '#2e7d32', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <Link href={`/shops/${cartData.shopId}`}>
          <div style={{ color: 'white', fontSize: '22px', lineHeight: 1 }}>←</div>
        </Link>
        <div style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>কার্ট</div>
      </div>

      {/* Shop name */}
      <div style={{ padding: '14px 16px 6px', fontSize: '13px', color: '#666' }}>
        {cartData.shopName} থেকে
      </div>

      {/* Cart items */}
      <div style={{ padding: '8px 16px' }}>
        {cartData.items.map(item => (
          <div key={item.id} style={{
            background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
            padding: '12px', marginBottom: '10px',
            display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '8px',
              background: '#f9fbe7', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '24px', flexShrink: 0, overflow: 'hidden'
            }}>
              {item.image_url ? (
                <img src={item.image_url} alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : '🛍️'}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a' }}>{item.name}</div>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{item.unit}</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#2e7d32' }}>৳{item.price} × {item.qty} = ৳{item.price * item.qty}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button onClick={() => removeQty(item.id)} style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: '#e8f5e9', color: '#2e7d32', fontSize: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>-</button>
                <span style={{ fontSize: '13px', fontWeight: '600', minWidth: '16px', textAlign: 'center' }}>{item.qty}</span>
                <button onClick={() => addQty(item.id)} style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: '#2e7d32', color: 'white', fontSize: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>+</button>
              </div>
              <button onClick={() => deleteItem(item.id)} style={{
                fontSize: '11px', color: '#d32f2f'
              }}>মুছুন</button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{
        background: 'white', margin: '8px 16px', borderRadius: '10px',
        border: '1px solid #e0e0e0', padding: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', marginBottom: '8px' }}>
          <span>সাবটোটাল ({totalItems}টি আইটেম)</span>
          <span>৳{subtotal}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', marginBottom: '8px' }}>
          <span>ডেলিভারি চার্জ</span>
          <span>যোগ হবে চেকআউটে</span>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', fontSize: '15px',
          fontWeight: '600', color: '#1a1a1a', paddingTop: '8px', borderTop: '1px solid #eee'
        }}>
          <span>মোট</span>
          <span>৳{subtotal}</span>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        position: 'fixed', bottom: '0', left: '0', right: '0',
        background: '#2e7d32', padding: '14px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ color: 'white' }}>
          <div style={{ fontSize: '13px', opacity: 0.85 }}>{totalItems}টি আইটেম</div>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>৳{subtotal}</div>
        </div>
        <button
          onClick={() => alert('অর্ডার প্লেসমেন্ট শীঘ্রই আসছে')}
          style={{
            background: 'white', color: '#2e7d32', padding: '10px 24px',
            borderRadius: '8px', fontSize: '14px', fontWeight: '600'
          }}>অর্ডার করুন →</button>
      </div>
    </div>
  )
}
