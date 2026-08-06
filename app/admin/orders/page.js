'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

const statusLabels = {
  pending: 'Order received',
  confirmed: 'Order confirmed',
  processing: 'Preparing',
  packed: 'Packed by merchant',
  shipped_to_warehouse: 'Shipped to warehouse',
  received_at_warehouse: 'Received & paid at warehouse',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Order cancelled',
}

// received_at_warehouse is set via the dedicated "Receive & Pay" action, not the generic next-status button
const statusOrder = ['pending', 'confirmed', 'processing', 'packed', 'shipped_to_warehouse', 'received_at_warehouse', 'out_for_delivery', 'delivered']
const genericNextStatusOrder = ['pending', 'confirmed', 'processing', 'packed']

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [orderItems, setOrderItems] = useState({})
  const [updatingId, setUpdatingId] = useState(null)
  const [courierDrafts, setCourierDrafts] = useState({})
  const [savingCourierId, setSavingCourierId] = useState(null)

  // Warehouse receive & pay
  const [categoryCommissions, setCategoryCommissions] = useState({}) // { categoryId: percent }
  const [defaultCommission, setDefaultCommission] = useState(10)
  const [receivingId, setReceivingId] = useState(null) // order id whose receive-panel is open
  const [receiveDraft, setReceiveDraft] = useState({ commission_percent: '', payout_amount: '', note: '' })
  const [confirmingReceiveId, setConfirmingReceiveId] = useState(null)

  async function loadOrders() {
    setLoading(true)
    setError('')
    try {
      const data = await supabaseFetch('orders?select=*,shops(name),areas(name)&order=created_at.desc')
      setOrders(data || [])
    } catch (e) {
      console.error(e)
      setError('Failed to load orders')
    }
    setLoading(false)
  }

  async function loadCommissionConfig() {
    try {
      const [cats, settings] = await Promise.all([
        supabaseFetch('categories?select=id,commission_percent'),
        supabaseFetch('app_settings?select=value&key=eq.default_commission_percent'),
      ])
      const map = {}
      ;(cats || []).forEach(c => { map[c.id] = c.commission_percent })
      setCategoryCommissions(map)
      const def = settings && settings[0] ? Number(settings[0].value) : 10
      setDefaultCommission(isNaN(def) ? 10 : def)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadOrders()
    loadCommissionConfig()
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
      await loadOrders()
    } catch (e) {
      console.error(e)
      setError('Failed to save courier info')
    }
    setSavingCourierId(null)
  }

  const openReceivePanel = async (order) => {
    setError('')
    setReceivingId(order.id)
    try {
      // Need product_id -> category_id for each line item to compute a weighted commission %.
      const items = orderItems[order.id] || await (async () => {
        const data = await supabaseFetch(`order_items?select=*&order_id=eq.${order.id}`)
        setOrderItems(prev => ({ ...prev, [order.id]: data || [] }))
        return data || []
      })()

      const productIds = [...new Set(items.map(i => i.product_id).filter(Boolean))]
      let productCategoryMap = {}
      if (productIds.length > 0) {
        const products = await supabaseFetch(`products?select=id,category_id&id=in.(${productIds.join(',')})`)
        ;(products || []).forEach(p => { productCategoryMap[p.id] = p.category_id })
      }

      let weightedSum = 0
      let totalValue = 0
      items.forEach(item => {
        const catId = productCategoryMap[item.product_id]
        const catPercent = catId ? categoryCommissions[catId] : null
        const percent = (catPercent === null || catPercent === undefined) ? defaultCommission : catPercent
        const value = Number(item.total_price) || 0
        weightedSum += percent * value
        totalValue += value
      })
      const suggestedPercent = totalValue > 0 ? (weightedSum / totalValue) : defaultCommission
      const suggestedPayout = (Number(order.total) || 0) * (1 - suggestedPercent / 100)

      setReceiveDraft({
        commission_percent: suggestedPercent.toFixed(2),
        payout_amount: suggestedPayout.toFixed(2),
        note: '',
      })
    } catch (e) {
      console.error(e)
      setError('Failed to calculate suggested payout')
      setReceiveDraft({ commission_percent: String(defaultCommission), payout_amount: '', note: '' })
    }
  }

  const closeReceivePanel = () => {
    setReceivingId(null)
    setReceiveDraft({ commission_percent: '', payout_amount: '', note: '' })
  }

  const confirmReceive = async (order) => {
    if (!receiveDraft.payout_amount || isNaN(Number(receiveDraft.payout_amount))) {
      setError('Enter a valid payout amount')
      return
    }
    setConfirmingReceiveId(order.id)
    setError('')
    try {
      const nowIso = new Date().toISOString()
      const history = Array.isArray(order.tracking_history) ? order.tracking_history : []
      const updatedHistory = [
        ...history,
        { status: 'received_at_warehouse', note: statusLabels.received_at_warehouse, time: nowIso },
      ]
      await supabaseFetch(`orders?id=eq.${order.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'received_at_warehouse',
          tracking_history: updatedHistory,
          warehouse_received_at: nowIso,
          warehouse_paid_at: nowIso,
          commission_percent_applied: Number(receiveDraft.commission_percent) || 0,
          merchant_payout_amount: Number(receiveDraft.payout_amount),
          warehouse_note: receiveDraft.note.trim() || null,
        }),
      })
      closeReceivePanel()
      await loadOrders()
    } catch (e) {
      console.error(e)
      setError('Failed to confirm receive & payout')
    }
    setConfirmingReceiveId(null)
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
    { key: 'out_for_delivery', label: 'Out for delivery' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '8px' }}>Orders</h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        View all orders and update their status from here.
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
            const genericIdx = genericNextStatusOrder.indexOf(order.status)
            const nextStatus = genericIdx >= 0 ? genericNextStatusOrder[genericIdx + 1] : (order.status === 'received_at_warehouse' ? 'out_for_delivery' : undefined)

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
                      {order.shops?.name || 'No shop'} · {order.areas?.name || ''} · Order #{order.id.slice(0, 8)}
                    </div>
                    <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>
                      {new Date(order.created_at).toLocaleString('en-US')}
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0a0a0a', whiteSpace: 'nowrap' }}>
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

                    {/* Courier / carrier */}
                    <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#163a2c', marginBottom: '8px' }}>Courier / Carrier (final delivery to buyer — set this once out for delivery)</div>
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

                    {/* Warehouse payout — shown once received */}
                    {order.warehouse_received_at && (
                      <div style={{ background: '#e0f7fa', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#00838f', marginBottom: '6px' }}>Warehouse Payout</div>
                        <div style={{ fontSize: '13px', color: '#333' }}>
                          Commission: {order.commission_percent_applied}% · Merchant payout: <strong>৳{order.merchant_payout_amount}</strong> · Paid {order.warehouse_paid_at ? new Date(order.warehouse_paid_at).toLocaleString('en-US') : ''}
                        </div>
                        {order.warehouse_note && <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>Note: {order.warehouse_note}</div>}
                      </div>
                    )}

                    {/* Receive & Pay panel — only actionable once merchant has shipped to warehouse */}
                    {order.status === 'shipped_to_warehouse' && (
                      <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
                        {receivingId !== order.id ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); openReceivePanel(order) }}
                            style={{
                              background: '#f4a300', color: 'white', border: 'none', borderRadius: '8px',
                              padding: '9px 16px', fontSize: '13px', fontWeight: '700'
                            }}>📦 Mark Received & Pay Merchant</button>
                        ) : (
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#8a6d00', marginBottom: '8px' }}>
                              Confirm warehouse receipt & payout
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                              <div>
                                <label style={{ fontSize: '11px', color: '#8a6d00' }}>Commission %</label>
                                <input
                                  value={receiveDraft.commission_percent}
                                  onChange={e => { e.stopPropagation(); setReceiveDraft(d => ({ ...d, commission_percent: e.target.value })) }}
                                  onClick={e => e.stopPropagation()}
                                  type="number" step="0.1"
                                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1.5px solid #d4b106', fontSize: '13px', boxSizing: 'border-box' }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '11px', color: '#8a6d00' }}>Payout Amount (৳)</label>
                                <input
                                  value={receiveDraft.payout_amount}
                                  onChange={e => { e.stopPropagation(); setReceiveDraft(d => ({ ...d, payout_amount: e.target.value })) }}
                                  onClick={e => e.stopPropagation()}
                                  type="number" step="0.01"
                                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1.5px solid #d4b106', fontSize: '13px', boxSizing: 'border-box' }}
                                />
                              </div>
                            </div>
                            <input
                              value={receiveDraft.note}
                              onChange={e => { e.stopPropagation(); setReceiveDraft(d => ({ ...d, note: e.target.value })) }}
                              onClick={e => e.stopPropagation()}
                              placeholder="Note (optional) — e.g. cash paid in hand at warehouse"
                              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1.5px solid #d4b106', fontSize: '13px', boxSizing: 'border-box', marginBottom: '8px' }}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); confirmReceive(order) }}
                                disabled={confirmingReceiveId === order.id}
                                style={{
                                  background: '#163a2c', color: 'white', border: 'none', borderRadius: '8px',
                                  padding: '9px 16px', fontSize: '13px', fontWeight: '700'
                                }}>{confirmingReceiveId === order.id ? 'Saving...' : '✓ Confirm Received & Paid'}</button>
                              <button
                                onClick={(e) => { e.stopPropagation(); closeReceivePanel() }}
                                style={{ background: '#f0f0f0', color: '#555', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '13px' }}
                              >Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Status actions */}
                    {!isCancelled && order.status !== 'delivered' && order.status !== 'shipped_to_warehouse' && (
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
  )
}
