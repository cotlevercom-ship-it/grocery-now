'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getCart, updateCartQuantity, removeFromCart, getCartTotal } from '@/lib/cart'

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState([])

  const refresh = () => setCart(getCart())

  useEffect(() => {
    refresh()
    const onChange = () => refresh()
    window.addEventListener('cart-changed', onChange)
    window.addEventListener('storage', onChange)
    return () => {
      window.removeEventListener('cart-changed', onChange)
      window.removeEventListener('storage', onChange)
    }
  }, [])

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 40px)', maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: '800', marginBottom: '20px' }}>আপনার কার্ট</h1>

      {cart.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '50px 20px', color: '#999',
          background: 'white', borderRadius: '12px', border: '1px solid #e5e5e5'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>🛒</div>
          <p style={{ marginBottom: '16px' }}>আপনার কার্ট খালি</p>
          <Link href="/" style={{
            display: 'inline-block', background: '#163a2c', color: 'white',
            borderRadius: '8px', padding: '10px 20px', fontSize: '13.5px', fontWeight: '600'
          }}>বই দেখুন</Link>
        </div>
      ) : (
        <>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e5e5', overflow: 'hidden', marginBottom: '20px' }}>
            {cart.map((item, i) => (
              <div key={item.id} style={{
                display: 'flex', gap: '12px', padding: '14px 16px', alignItems: 'center',
                borderBottom: i < cart.length - 1 ? '1px solid #eee' : 'none', flexWrap: 'wrap'
              }}>
                <div style={{
                  width: '52px', height: '72px', borderRadius: '6px', background: '#f5f5f5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0
                }}>
                  {item.image_url ? (
                    <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : '📕'}
                </div>

                <div style={{ flex: 1, minWidth: '140px' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: '700' }}>{item.title}</div>
                  <div style={{ fontSize: '13px', color: '#163a2c', fontWeight: '700', marginTop: '4px' }}>৳{item.price}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px' }}>
                  <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} style={{ padding: '6px 12px', background: 'white', fontSize: '13px' }}>−</button>
                  <span style={{ padding: '0 12px', fontSize: '13px', fontWeight: '600' }}>{item.quantity}</span>
                  <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} style={{ padding: '6px 12px', background: 'white', fontSize: '13px' }}>+</button>
                </div>

                <button onClick={() => removeFromCart(item.id)} style={{
                  background: '#ffebee', color: '#c62828', borderRadius: '6px',
                  padding: '7px 12px', fontSize: '11.5px', fontWeight: '600'
                }}>সরান</button>
              </div>
            ))}
          </div>

          <div style={{
            background: 'white', borderRadius: '12px', border: '1px solid #e5e5e5',
            padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px'
          }}>
            <span style={{ fontSize: '14px', color: '#555' }}>মোট</span>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#163a2c' }}>৳{total}</span>
          </div>

          <button onClick={() => router.push('/checkout')} style={{
            width: '100%', background: '#163a2c', color: 'white', borderRadius: '10px',
            padding: '14px', fontSize: '15px', fontWeight: '700'
          }}>চেকআউট করুন</button>
        </>
      )}
    </div>
  )
}
