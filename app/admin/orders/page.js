'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

const statusLabels = {
  pending: 'অর্ডার গৃহীত হয়েছে',
  confirmed: 'অর্ডার কনফার্ম হয়েছে',
  processing: 'প্রস্তুত করা হচ্ছে',
  out_for_delivery: 'ডেলিভারির পথে',
  delivered: 'ডেলিভারি সম্পন্ন',
  cancelled: 'অর্ডার বাতিল হয়েছে',
}

const statusOrder = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered']

const statusColors = {
  pending: { bg: '#fff3e0', color: '#f4a300' },
  confirmed: { bg: '#e3f2fd', color: '#1565c0' },
  processing: { bg: '#ede7f6', color: '#5e35b1' },
  out_for_delivery: { bg: '#e0f2f1', color: '#00695c' },
  delivered: { bg: '#e8f5e9', color: '#2d6a4f' },
  cancelled: { bg: '#ffebee', color: '#c62828' },
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [orderItems, setOrderItems] = useState({})
  const [updatingId, setUpdatingId] = useState(null)

  async function loadOrders() {
    setLoading(true)
    setError('')
    try {
      const data = await supabaseFetch('orders?select=*,shops(name),areas(name)&order=created_at.desc')
      setOrders(data || [])
    } catch (e) {
      console.error(e)
      setError('অর্ডার লোড করতে সমস্যা হয়েছে')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const toggleExpand = async (order) => {
    if (expandedId === order.id) {
      setExpandedId(null)
      return
    }
    setExpandedId(order.id)
    if (!orderItems[order.id]) {
      try {
        const items = await supabaseFetch(`order_items?select=*&order_id=eq.${order.id}`)
        setOrderItems(prev => ({ ...prev, [order.id]: items || [] }))
      } catch (e) {
        console.error(e)
      }
    }
  }

  const updateStatus = async (order, newStatus) => {
    setUpdatingId(order.id)
    setError('')
    try {
      const history = Array.isArray(order.tracking_history) ? order.tracking_history : []
      const updatedHistory = [
        ...history,
        { status: newStatus, note: statusLabels[newStatus] || newStatus, time: new Date().toISOString() },
      ]
      await supabaseFetch(`orders?id=eq.${order.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, tracking_history: updatedHistory }),
      })
      await loadOrders()
    } catch (e) {
      console.error(e)
      setError('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে')
    }
    setUpdatingId(null)
  }

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const filterOptions = [
    { key: 'all', label: 'সব' },
    { key: 'pending', label: 'নতুন' },
    { key: 'confirmed', label: 'কনফার্ম' },
    { key: 'processing', label: 'প্রস্তুত হচ্ছে' },
    { key: 'out_for_delivery', label: 'ডেলিভারির পথে' },
    { key: 'delivered', label: 'সম্পন্ন' },
    { key: 'cancelled', label: 'বাতিল' },
  ]

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '8px' }}>অর্ডার</h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        সব অর্ডার এখান থেকে দেখা ও স্ট্যাটাস আপডেট করা যাবে।
      </p>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {filterOptions.map(opt => (
          <button key={opt.key} onClick={() => setFilter(opt.key)} style={{
            padding: '7px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
            border: '1px solid', whiteSpace: 'nowrap',
            background: filter === opt.key ? '#163a2c' : 'white',
            color: filter === opt.key ? 'white' : '#555',
            borderColor: filter === opt.key ? '#163a2c' : '#ddd',
          }}>{opt.label}</button>
        ))}
      </div>

      {error && (
        <div style={{
          maxWidth: '600px', marginBottom: '16px', padding: '10px 12px',
          background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
        }}>{error}</div>
      )}

      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>লোড হচ্ছে...</div>
      ) : filteredOrders.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '50px 20px', color: '#999',
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>🧾</div>
          <p>কোনো অর্ডার পাওয়া যায়নি</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredOrders.map(order => {
            const colors = statusColors[order.status] || statusColors.pending
            const isExpanded = expandedId === order.id
            const isCancelled = order.status === 'cancelled'
            const nextStatusIndex = statusOrder.indexOf(order.status) + 1
            const nextStatus = statusOrder[nextStatusIndex]

            return (
              <div key={order.id} style={{
                background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0', overflow: 'hidden'
              }}>
                <div onClick={() => toggleExpand(order)} style={{
                  display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', cursor: 'pointer'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                      {order.delivery_name} · {order.delivery_phone}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                      {order.shops?.name || 'দোকান নাই'} · {order.areas?.name || ''} · অর্ডার #{order.id.slice(0, 8)}
                    </div>
                    <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>
                      {new Date(order.created_at).toLocaleString('bn-BD')}
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#2e7d32', whiteSpace: 'nowrap' }}>
                    ৳{order.total}
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px',
                    background: colors.bg, color: colors.color, whiteSpace: 'nowrap'
                  }}>{statusLabels[order.status] || order.status}</span>
                </div>

                {isExpanded && (
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid #eee' }}>
                    <div style={{ paddingTop: '12px', fontSize: '13px', color: '#555', marginBottom: '8px' }}>
                      <strong>ঠিকানা:</strong> {order.delivery_address}
                    </div>
                    {order.note && (
                      <div style={{ fontSize: '13px', color: '#555', marginBottom: '8px' }}>
                        <strong>নোট:</strong> {order.note}
                      </div>
                    )}
                    <div style={{ fontSize: '13px', color: '#555', marginBottom: '12px' }}>
                      <strong>পেমেন্ট:</strong> {order.payment_method === 'cod' ? 'ক্যাশ অন ডেলিভারি' : order.payment_method} ({order.payment_status})
                    </div>

                    {/* Items */}
                    <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px' }}>
                      {(orderItems[order.id] || []).map(item => (
                        <div key={item.id} style={{
                          display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', marginBottom: '4px'
                        }}>
                          <span>{item.product_name}{item.variant_name ? ` (${item.variant_name})` : ''} × {item.quantity}</span>
                          <span>৳{item.total_price}</span>
                        </div>
                      ))}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', fontSize: '13px',
                        fontWeight: '600', color: '#1a1a1a', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e5e5'
                      }}>
                        <span>সাবটোটাল + ডেলিভারি</span>
                        <span>৳{order.subtotal} + ৳{order.delivery_charge}</span>
                      </div>
                    </div>

                    {/* Status actions */}
                    {!isCancelled && order.status !== 'delivered' && (
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {nextStatus && (
                          <button
                            onClick={(e) => { e.stopPropagation(); updateStatus(order, nextStatus) }}
                            disabled={updatingId === order.id}
                            style={{
                              background: '#163a2c', color: 'white', border: 'none', borderRadius: '8px',
                              padding: '9px 16px', fontSize: '13px', fontWeight: '600'
                            }}>
                            {updatingId === order.id ? 'আপডেট হচ্ছে...' : `→ ${statusLabels[nextStatus]}`}
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); updateStatus(order, 'cancelled') }}
                          disabled={updatingId === order.id}
                          style={{
                            background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '8px',
                            padding: '9px 16px', fontSize: '13px', fontWeight: '600'
                          }}>অর্ডার বাতিল করুন</button>
                      </div>
                    )}
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
