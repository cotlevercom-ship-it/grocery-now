'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

const STATUSES = [
  { value: 'pending', label: 'Pending', color: '#f4a300' },
  { value: 'confirmed', label: 'Confirmed', color: '#2d6a4f' },
  { value: 'shipped', label: 'Shipped', color: '#1971c2' },
  { value: 'delivered', label: 'Delivered', color: '#163a2c' },
  { value: 'cancelled', label: 'Cancelled', color: '#c62828' },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [items, setItems] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  async function loadOrders() {
    setLoading(true)
    setError('')
    try {
      const data = await supabaseFetch('orders?select=*&order=created_at.desc')
      setOrders(data || [])
    } catch (e) {
      console.error(e)
      setError('অর্ডার লোড করতে সমস্যা হয়েছে')
    }
    setLoading(false)
  }

  useEffect(() => { loadOrders() }, [])

  const toggleExpand = async (orderId) => {
    if (expandedId === orderId) { setExpandedId(null); return }
    setExpandedId(orderId)
    if (!items[orderId]) {
      try {
        const data = await supabaseFetch(`order_items?select=*&order_id=eq.${orderId}`)
        setItems(prev => ({ ...prev, [orderId]: data || [] }))
      } catch (e) {
        console.error(e)
      }
    }
  }

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId)
    try {
      await supabaseFetch(`orders?id=eq.${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      await loadOrders()
    } catch (e) {
      console.error(e)
      setError('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে')
    }
    setUpdatingId(null)
  }

  const filteredOrders = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus)

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '4px' }}>Orders</h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        গ্রাহকদের অর্ডার দেখুন ও স্ট্যাটাস আপডেট করুন।
      </p>

      {error && (
        <div style={{
          marginBottom: '16px', padding: '10px 12px',
          background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
        }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button onClick={() => setFilterStatus('all')} style={{
          padding: '6px 14px', borderRadius: '20px', border: '1px solid #ddd', fontSize: '12.5px',
          background: filterStatus === 'all' ? '#163a2c' : 'white',
          color: filterStatus === 'all' ? 'white' : '#444'
        }}>সব ({orders.length})</button>
        {STATUSES.map(s => {
          const count = orders.filter(o => o.status === s.value).length
          return (
            <button key={s.value} onClick={() => setFilterStatus(s.value)} style={{
              padding: '6px 14px', borderRadius: '20px', border: '1px solid #ddd', fontSize: '12.5px',
              background: filterStatus === s.value ? '#163a2c' : 'white',
              color: filterStatus === s.value ? 'white' : '#444'
            }}>{s.label} ({count})</button>
          )
        })}
      </div>

      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>লোড হচ্ছে...</div>
      ) : filteredOrders.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '50px 20px', color: '#999',
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>🧾</div>
          <p>কোনো অর্ডার নেই</p>
        </div>
      ) : (
        <div style={{
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0', overflow: 'hidden'
        }}>
          {filteredOrders.map((order, i) => {
            const statusInfo = STATUSES.find(s => s.value === order.status)
            const isExpanded = expandedId === order.id
            return (
              <div key={order.id} style={{
                borderBottom: i < filteredOrders.length - 1 ? '1px solid #eee' : 'none'
              }}>
                <div onClick={() => toggleExpand(order.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                  cursor: 'pointer', flexWrap: 'wrap'
                }}>
                  <div style={{ flex: 1, minWidth: '160px' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#1a1a1a' }}>
                      #{order.order_number} — {order.customer_name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                      {order.customer_phone} · {new Date(order.created_at).toLocaleDateString('bn-BD')}
                    </div>
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#163a2c' }}>
                    ৳{order.total_amount}
                  </div>
                  <span style={{
                    fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px',
                    background: '#f5f5f5', color: statusInfo?.color || '#666'
                  }}>{statusInfo?.label}</span>
                </div>

                {isExpanded && (
                  <div style={{ padding: '0 16px 16px', background: '#fafafa' }}>
                    <div style={{ fontSize: '12.5px', color: '#555', marginBottom: '10px' }}>
                      <strong>ঠিকানা:</strong> {order.customer_address}
                      {order.notes && <div style={{ marginTop: '4px' }}><strong>নোট:</strong> {order.notes}</div>}
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      {(items[order.id] || []).map(item => (
                        <div key={item.id} style={{
                          display: 'flex', justifyContent: 'space-between', fontSize: '12.5px',
                          padding: '6px 0', borderBottom: '1px solid #eee'
                        }}>
                          <span>{item.title} × {item.quantity}</span>
                          <span>৳{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {STATUSES.map(s => (
                        <button
                          key={s.value}
                          disabled={updatingId === order.id || order.status === s.value}
                          onClick={() => updateStatus(order.id, s.value)}
                          style={{
                            padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd',
                            fontSize: '12px', cursor: 'pointer',
                            background: order.status === s.value ? s.color : 'white',
                            color: order.status === s.value ? 'white' : '#444',
                            opacity: updatingId === order.id ? 0.6 : 1
                          }}
                        >{s.label}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
