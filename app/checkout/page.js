'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCart, clearCart } from '@/lib/cart'
import { supabaseFetch, getSession } from '@/lib/supabase'

function generateOrderNumber() {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `BK${Date.now().toString().slice(-6)}${rand}`
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState([])
  const [form, setForm] = useState({ name: '', phone: '', address: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [orderNumber, setOrderNumber] = useState('')

  useEffect(() => {
    const items = getCart()
    setCart(items)
    if (items.length === 0 && !orderNumber) {
      router.replace('/cart')
    }
  }, [])

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError('নাম, ফোন নম্বর ও ঠিকানা দিন')
      return
    }
    if (cart.length === 0) return

    setSubmitting(true)
    try {
      const session = getSession()
      const newOrderNumber = generateOrderNumber()

      const orderPayload = {
        order_number: newOrderNumber,
        customer_name: form.name.trim(),
        customer_phone: form.phone.trim(),
        customer_address: form.address.trim(),
        notes: form.notes.trim() || null,
        total_amount: total,
        user_id: session?.user?.id || null,
      }

      const orderRes = await supabaseFetch('orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      })
      const order = orderRes?.[0]
      if (!order) throw new Error('Order creation failed')

      const itemsPayload = cart.map(item => ({
        order_id: order.id,
        book_id: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
      }))
      await supabaseFetch('order_items', {
        method: 'POST',
        body: JSON.stringify(itemsPayload),
      })

      clearCart()
      setOrderNumber(newOrderNumber)
    } catch (e) {
      console.error(e)
      setError('অর্ডার সম্পন্ন করতে সমস্যা হয়েছে, আবার চেষ্টা করুন')
    }
    setSubmitting(false)
  }

  const inputStyle = {
    width: '100%', padding: '11px 13px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
  }
  const labelStyle = { fontSize: '12.5px', color: '#555', display: 'block', marginBottom: '5px', fontWeight: '600' }

  if (orderNumber) {
    return (
      <div style={{ padding: 'clamp(16px, 3vw, 40px)', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          background: 'white', borderRadius: '14px', border: '1px solid #e5e5e5',
          padding: '40px 24px', marginTop: '30px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '14px' }}>✅</div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#163a2c', marginBottom: '8px' }}>অর্ডার সম্পন্ন হয়েছে!</h1>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '18px' }}>
            অর্ডার নম্বর: <strong>{orderNumber}</strong>
          </p>
          <a href="/" style={{
            display: 'inline-block', background: '#163a2c', color: 'white',
            borderRadius: '8px', padding: '11px 22px', fontSize: '14px', fontWeight: '700'
          }}>আরও বই দেখুন</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 40px)', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: '800', marginBottom: '20px' }}>চেকআউট</h1>

      {error && (
        <div style={{
          marginBottom: '16px', padding: '10px 12px',
          background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
        }}>{error}</div>
      )}

      <div style={{
        background: 'white', borderRadius: '12px', border: '1px solid #e5e5e5',
        padding: '16px 18px', marginBottom: '20px'
      }}>
        {cart.map(item => (
          <div key={item.id} style={{
            display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', padding: '6px 0'
          }}>
            <span>{item.title} × {item.quantity}</span>
            <span>৳{item.price * item.quantity}</span>
          </div>
        ))}
        <div style={{
          display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '800',
          marginTop: '8px', paddingTop: '10px', borderTop: '1px solid #eee', color: '#163a2c'
        }}>
          <span>মোট</span>
          <span>৳{total}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{
        background: 'white', borderRadius: '12px', border: '1px solid #e5e5e5', padding: '20px'
      }}>
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>নাম *</label>
          <input style={inputStyle} value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="আপনার নাম" />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>ফোন নম্বর *</label>
          <input style={inputStyle} value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="01XXXXXXXXX" />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>ঠিকানা *</label>
          <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} value={form.address} onChange={e => handleChange('address', e.target.value)} placeholder="সম্পূর্ণ ঠিকানা" />
        </div>
        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>নোট (ঐচ্ছিক)</label>
          <input style={inputStyle} value={form.notes} onChange={e => handleChange('notes', e.target.value)} placeholder="বিশেষ কোনো নির্দেশনা" />
        </div>

        <button type="submit" disabled={submitting} style={{
          width: '100%', background: submitting ? '#9ca3af' : '#163a2c', color: 'white',
          borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: '700'
        }}>
          {submitting ? 'অর্ডার হচ্ছে...' : 'অর্ডার কনফার্ম করুন'}
        </button>
      </form>
    </div>
  )
}
