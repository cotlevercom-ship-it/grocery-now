'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getSession, supabaseFetch } from '@/lib/supabase'
import MerchantNav from '@/components/MerchantNav'

const statusLabels = {
  pending: 'Order received',
  confirmed: 'Order confirmed',
  processing: 'Preparing',
  packed: 'Packed',
  shipped_to_warehouse: 'Shipped to Cot Lever warehouse',
  received_at_warehouse: 'Received at warehouse',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const statusOrder = ['pending', 'confirmed', 'processing', 'packed', 'shipped_to_warehouse', 'received_at_warehouse', 'out_for_delivery', 'delivered']
// Merchant can push the order forward through packing/shipping, but only Cot Lever admin
// marks it received at the warehouse (which also triggers the payout calculation) — so the
// merchant's "next status" button stops there.
const merchantStatusOrder = ['pending', 'confirmed', 'processing', 'packed', 'shipped_to_warehouse']

const statusColors = {
  pending: { bg: '#fff3e0', color: '#f4a300' },
  confirmed: { bg: '#e3f2fd', color: '#1565c0' },
  processing: { bg: '#ede7f6', color: '#5e35b1' },
  packed: { bg: '#fce4ec', color: '#ad1457' },
  shipped_to_warehouse: { bg: '#e8eaf6', color: '#3949ab' },
  received_at_warehouse: { bg: '#e0f7fa', color: '#00838f' },
  out_for_delivery: { bg: '#e0f2f1', color: '#00695c' },
  delivered: { bg: '#f5f5f5', color: '#2d6a4f' },
  cancelled: { bg: '#ffebee', color: '#c62828' },
}

export default function MerchantOrdersPage() {
  return (
    <Suspense fallback={null}>
      <MerchantOrdersInner />
    </Suspense>
  )
}

function MerchantOrdersInner() {
  const [shopId, setShopId] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loadingShop, setLoadingShop] = useState(true)

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const [filter, setFilter] = useState(searchParams.get('status') || 'all')
  const [expandedId, setExpandedId] = useState(null)
  const [orderItems, setOrderItems] = useState({})
  const [updatingId, setUpdatingId] = useState(null)
  const [courierDrafts, setCourierDrafts] = useState({}) // { [orderId]: { courier_name, courier_tracking_id } }
  const [savingCourierId, setSavingCourierId] = useState(null)

  useEffect(() => {
    async function loadShop() {
      setLoadingShop(true)
      try {
        const session = getSession()
        if (session?.user) {
          const shops = await supabaseFetch(`shops?select=id,package_id&owner_id=eq.${session.user.id}`)
          if (shops && shops.length > 0) {
            setShopId(shops[0].id)
            setIsSubscribed(!!shops[0].package_id)
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

  async function loadOrders(id) {
    setLoading(true)
    setError('')
    try {
      const data = await supabaseFetch(`orders?select=*,areas(name)&shop_id=eq.${id}&order=created_at.desc`)
      setOrders(data || [])
    } catch (e) {
      console.error(e)
      setError('Failed to load orders')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (shopId) loadOrders(shopId)
  }, [shopId])

  const toggleExpand = async (order) => {
    if (!isSubscribed) return
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
      await loadOrders(shopId)
    } catch (e) {
      console.error(e)
      setError('Failed to update status')
    }
    setUpdatingId(null)
  }

  const getCourierDraft = (order) => courierDrafts[order.id] ?? {
    courier_name: order.courier_name || '', courier_tracking_id: order.courier_tracking_id || '',
  }
  const setCourierDraftField = (order, field, value) => {
    setCourierDrafts(prev => ({ ...prev, [order.id]: { ...getCourierDraft(order), [field]: value } }))
  }
  const saveCourier = async (order) => {
    const draft = getCourierDraft(order)
    setSavingCourierId(order.id)
    setError('')
    try {
      await supabaseFetch(`orders?id=eq.${order.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          courier_name: draft.courier_name.trim() || null,
          courier_tracking_id: draft.courier_tracking_id.trim() || null,
        }),
      })
      await loadOrders(shopId)
    } catch (e) {
      console.error(e)
      setError('Failed to save courier info')
    }
    setSavingCourierId(null)
  }

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const filterOptions = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'New' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'processing', label: 'Preparing' },
    { key: 'packed', label: 'Packed' },
    { key: 'shipped_to_warehouse', label: 'Shipped to Warehouse' },
    { key: 'received_at_warehouse', label: 'Received & Paid' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ]

  if (loadingShop) {
    return (
      <MerchantNav>
        <div style={{ color: '#888', fontSize: '14px' }}>Loading...</div>
      </MerchantNav>
    )
  }

  if (!shopId) {
    return (
      <MerchantNav>
        <div style={{ color: '#c62828', fontSize: '14px' }}>Could not find your shop.</div>
      </MerchantNav>
    )
  }

  return (
    <MerchantNav>
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '8px' }}>Orders</h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        View and update the status of orders placed at your shop.
      </p>

      {!isSubscribed && (
        <div style={{
          maxWidth: '700px', marginBottom: '20px', padding: '14px 16px', borderRadius: '10px',
          background: '#fff3e0', border: '1px solid #ffe0b2', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap'
        }}>
          <div style={{ fontSize: '13px', color: '#8a5a00' }}>
            🔒 Subscribe to a package to view your customers' order details and manage orders.
          </div>
          <a href="/merchant/package" style={{
            background: '#f4a300', color: 'white', borderRadius: '8px', padding: '8px 16px',
            fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap', textDecoration: 'none'
          }}>Subscribe now</a>
        </div>
      )}

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
        <div style={{ color: '#888', fontSize: '14px' }}>Loading...</div>
      ) : filteredOrders.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '50px 20px', color: '#999',
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>🧾</div>
          <p>No orders found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredOrders.map(order => {
            const colors = statusColors[order.status] || statusColors.pending
            const isExpanded = expandedId === order.id
            const isCancelled = order.status === 'cancelled'
            const merchantIdx = merchantStatusOrder.indexOf(order.status)
            const nextStatus = merchantIdx >= 0 ? merchantStatusOrder[merchantIdx + 1] : undefined

            return (
              <div key={order.id} style={{
                background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0', overflow: 'hidden'
              }}>
                <div onClick={() => toggleExpand(order)} style={{
                  display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
                  cursor: isSubscribed ? 'pointer' : 'default'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {isSubscribed ? (
                      <>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                          {order.delivery_name} · {order.delivery_phone}
                        </div>
                        <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                          {order.areas?.name || ''} · Order #{order.id.slice(0, 8)}
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#999' }}>
                        🔒 Order #{order.id.slice(0, 8)} · Subscribe to view details
                      </div>
                    )}
                    <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>
                      {new Date(order.created_at).toLocaleString('en-US')}
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0a0a0a', whiteSpace: 'nowrap' }}>
                    {isSubscribed ? `৳${order.total}` : '🔒 ৳---'}
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px',
                    background: colors.bg, color: colors.color, whiteSpace: 'nowrap'
                  }}>{statusLabels[order.status] || order.status}</span>
                  {isSubscribed ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleExpand(order) }}
                      style={{
                        background: isExpanded ? '#163a2c' : '#f5f5f5', color: isExpanded ? 'white' : '#163a2c',
                        border: 'none', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: '700',
                        whiteSpace: 'nowrap'
                      }}>{isExpanded ? 'Hide' : 'View Order'}</button>
                  ) : (
                    <a href="/merchant/package" onClick={e => e.stopPropagation()} style={{
                      background: '#f0f0f0', color: '#999', border: 'none', borderRadius: '8px',
                      padding: '7px 12px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap',
                      textDecoration: 'none', cursor: 'pointer'
                    }}>🔒 View Order</a>
                  )}
                </div>

                {isExpanded && isSubscribed && (
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid #eee' }}>
                    <div style={{ paddingTop: '12px', fontSize: '13px', color: '#555', marginBottom: '8px' }}>
                      <strong>Address:</strong> {order.delivery_address}
                    </div>
                    {order.note && (
                      <div style={{ fontSize: '13px', color: '#555', marginBottom: '8px' }}>
                        <strong>Note:</strong> {order.note}
                      </div>
                    )}
                    <div style={{ fontSize: '13px', color: '#555', marginBottom: '12px' }}>
                      <strong>Payment:</strong> {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method} ({order.payment_status})
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
                        <span>Subtotal + Delivery</span>
                        <span>৳{order.subtotal} + ৳{order.delivery_charge}</span>
                      </div>
                    </div>

                    {order.warehouse_received_at && (
                      <div style={{ background: '#e0f7fa', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#00838f', marginBottom: '6px' }}>
                          Warehouse Payout {order.warehouse_paid_at ? '(Paid)' : '(Pending)'}
                        </div>
                        <div style={{ fontSize: '13px', color: '#333' }}>
                          Commission applied: {order.commission_percent_applied}% · Your payout: <strong>৳{order.merchant_payout_amount}</strong>
                        </div>
                        {order.warehouse_note && (
                          <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>Note: {order.warehouse_note}</div>
                        )}
                      </div>
                    )}

                    {/* Courier / carrier */}
                    <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#163a2c', marginBottom: '8px' }}>Courier / Carrier (to Cot Lever warehouse)</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        <input
                          value={getCourierDraft(order).courier_name}
                          onChange={e => { e.stopPropagation(); setCourierDraftField(order, 'courier_name', e.target.value) }}
                          onClick={e => e.stopPropagation()}
                          placeholder="e.g. Sundarban, Pathao, DHL"
                          style={{
                            width: '100%', padding: '8px 10px', borderRadius: '6px',
                            border: '1.5px solid #9ca3af', fontSize: '13px', boxSizing: 'border-box'
                          }}
                        />
                        <input
                          value={getCourierDraft(order).courier_tracking_id}
                          onChange={e => { e.stopPropagation(); setCourierDraftField(order, 'courier_tracking_id', e.target.value) }}
                          onClick={e => e.stopPropagation()}
                          placeholder="Tracking / consignment number"
                          style={{
                            width: '100%', padding: '8px 10px', borderRadius: '6px',
                            border: '1.5px solid #9ca3af', fontSize: '13px', boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); saveCourier(order) }}
                        disabled={savingCourierId === order.id}
                        style={{
                          background: '#f5f5f5', color: '#2d6a4f', border: 'none', borderRadius: '6px',
                          padding: '7px 14px', fontSize: '12px', fontWeight: '600'
                        }}>{savingCourierId === order.id ? 'Saving...' : 'Save courier info'}</button>
                    </div>

                    {/* Status actions */}
                    {!isCancelled && !['shipped_to_warehouse', 'received_at_warehouse', 'out_for_delivery', 'delivered'].includes(order.status) && (
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {nextStatus && (
                          <button
                            onClick={(e) => { e.stopPropagation(); updateStatus(order, nextStatus) }}
                            disabled={updatingId === order.id}
                            style={{
                              background: '#163a2c', color: 'white', border: 'none', borderRadius: '8px',
                              padding: '9px 16px', fontSize: '13px', fontWeight: '600'
                            }}>
                            {updatingId === order.id ? 'Updating...' : `→ ${statusLabels[nextStatus]}`}
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); updateStatus(order, 'cancelled') }}
                          disabled={updatingId === order.id}
                          style={{
                            background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '8px',
                            padding: '9px 16px', fontSize: '13px', fontWeight: '600'
                          }}>Cancel Order</button>
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
    </MerchantNav>
  )
}
