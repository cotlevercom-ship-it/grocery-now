import { supabaseFetch } from '@/lib/supabase'
import Link from 'next/link'
import CancelOrderButton from './CancelOrderButton'

export const dynamic = 'force-dynamic'

export default async function OrderPage({ params }) {
  const { id } = await params

  let order = null
  let items = []
  let shop = null

  try {
    const orders = await supabaseFetch(`orders?select=*&id=eq.${id}`)
    order = orders[0]

    if (order) {
      items = await supabaseFetch(`order_items?select=*&order_id=eq.${id}`)

      if (order.shop_id) {
        const shops = await supabaseFetch(`shops?select=*&id=eq.${order.shop_id}`)
        shop = shops[0]
      }
    }
  } catch (e) {
    console.error(e)
  }

  if (!order) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#999' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❓</div>
          <p style={{ marginBottom: '20px' }}>Order not found</p>
          <Link href="/" style={{
            display: 'inline-block', background: '#2e7d32', color: 'white',
            padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600'
          }}>Back to home</Link>
        </div>
      </div>
    )
  }

  // db status -> which timeline step index is "current" (0-based, 6 steps)
  const statusToStepIndex = {
    pending: 1,            // order placed (0) is done, waiting for seller (1) is current
    confirmed: 2,           // seller accepted
    processing: 3,          // order processing
    out_for_delivery: 4,    // handed to courier
    delivered: 5,           // delivered
  }

  const timelineSteps = [
    'Order placed',
    'Waiting for seller confirmation',
    'Seller accepted your order',
    'Order is being prepared',
    'Handed to courier',
    'Delivered',
  ]

  const isCancelled = order.status === 'cancelled'
  const currentStepIndex = statusToStepIndex[order.status] ?? 0
  // customer can cancel only before the seller has accepted (still 'pending')
  const canCancel = order.status === 'pending'

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', paddingBottom: '40px' }}>
      {/* Topbar */}
      <div style={{
        background: '#2e7d32', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <Link href="/">
          <div style={{ color: 'white', fontSize: '22px', lineHeight: 1 }}>←</div>
        </Link>
        <div style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>Order details</div>
      </div>

      {/* Success banner */}
      <div style={{ padding: '24px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>
          {isCancelled ? '❌' : '✅'}
        </div>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' }}>
          {isCancelled ? 'Order was cancelled' : 'Order placed successfully'}
        </div>
        <div style={{ fontSize: '12px', color: '#888' }}>Order ID: {order.id.slice(0, 8)}</div>
      </div>

      {/* Status tracker */}
      {!isCancelled && (
        <div style={{
          background: 'white', margin: '0 16px 14px', borderRadius: '10px',
          border: '1px solid #e0e0e0', padding: '16px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1a1a1a' }}>
            Order status
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {timelineSteps.map((label, i) => (
              <div key={label} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: i <= currentStepIndex ? '#2e7d32' : '#e0e0e0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', color: 'white', flexShrink: 0
                  }}>{i <= currentStepIndex ? '✓' : ''}</div>
                  {i < timelineSteps.length - 1 && (
                    <div style={{
                      width: '2px', height: '28px',
                      background: i < currentStepIndex ? '#2e7d32' : '#e0e0e0'
                    }} />
                  )}
                </div>
                <div style={{ paddingBottom: '10px' }}>
                  <div style={{
                    fontSize: '13px', fontWeight: i === currentStepIndex ? '600' : '400',
                    color: i <= currentStepIndex ? '#1a1a1a' : '#999'
                  }}>{label}</div>
                  {/* courier info shows once the parcel has been handed to the courier */}
                  {i === 4 && currentStepIndex >= 4 && (order.courier_name || order.courier_tracking_id) && (
                    <div style={{
                      marginTop: '4px', fontSize: '12px', color: '#555',
                      background: '#f5f5f5', borderRadius: '6px', padding: '6px 10px'
                    }}>
                      {order.courier_name && <div>Courier: {order.courier_name}</div>}
                      {order.courier_tracking_id && <div>Tracking ID: {order.courier_tracking_id}</div>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {canCancel && (
            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #eee' }}>
              <CancelOrderButton orderId={order.id} />
            </div>
          )}
        </div>
      )}

      {/* Shop info */}
      {shop && (
        <div style={{
          background: 'white', margin: '0 16px 14px', borderRadius: '10px',
          border: '1px solid #e0e0e0', padding: '16px'
        }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Shop</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>{shop.name}</div>
        </div>
      )}

      {/* Items */}
      <div style={{
        background: 'white', margin: '0 16px 14px', borderRadius: '10px',
        border: '1px solid #e0e0e0', padding: '16px'
      }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: '#1a1a1a' }}>
          Order items
        </div>
        {items.map(item => (
          <div key={item.id} style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '13px', color: '#555', marginBottom: '8px'
          }}>
            <span>
              {item.product_name}{item.variant_name ? ` (${item.variant_name})` : ''} × {item.quantity}
            </span>
            <span>৳{item.total_price}</span>
          </div>
        ))}
        <div style={{
          display: 'flex', justifyContent: 'space-between', fontSize: '13px',
          color: '#555', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee'
        }}>
          <span>Subtotal</span>
          <span>৳{order.subtotal}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', marginTop: '6px' }}>
          <span>Delivery charge</span>
          <span>{order.delivery_charge === 0 ? 'Free' : `৳${order.delivery_charge}`}</span>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', fontSize: '15px',
          fontWeight: '600', color: '#1a1a1a', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee'
        }}>
          <span>Total</span>
          <span>৳{order.total}</span>
        </div>
      </div>

      {/* Delivery info */}
      <div style={{
        background: 'white', margin: '0 16px 14px', borderRadius: '10px',
        border: '1px solid #e0e0e0', padding: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
            {order.delivery_method === 'pickup' ? 'Pickup details' : 'Delivery details'}
          </div>
          {order.delivery_method === 'pickup' && (
            <div style={{
              fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
              background: '#e3f2fd', color: '#1565c0'
            }}>Store pickup</div>
          )}
        </div>
        <div style={{ fontSize: '13px', color: '#555', marginBottom: '4px' }}>{order.delivery_name}</div>
        <div style={{ fontSize: '13px', color: '#555', marginBottom: '4px' }}>{order.delivery_phone}</div>
        {order.delivery_method === 'pickup' ? (
          <div style={{ fontSize: '13px', color: '#555' }}>
            <span style={{ color: '#888' }}>Collect from: </span>{order.delivery_address}
          </div>
        ) : (
          <div style={{ fontSize: '13px', color: '#555' }}>{order.delivery_address}</div>
        )}
        {order.note && (
          <div style={{ fontSize: '12px', color: '#888', marginTop: '8px', fontStyle: 'italic' }}>
            Note: {order.note}
          </div>
        )}
        {(order.courier_name || order.courier_tracking_id) && (
          <div style={{
            marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee',
            fontSize: '13px', color: '#555'
          }}>
            <div style={{ fontWeight: '600', color: '#1a1a1a', marginBottom: '2px' }}>Courier</div>
            {order.courier_name && <div>{order.courier_name}</div>}
            {order.courier_tracking_id && <div style={{ color: '#888' }}>Tracking ID: {order.courier_tracking_id}</div>}
          </div>
        )}
      </div>

      <div style={{ padding: '0 16px' }}>
        <Link href="/shops" style={{
          display: 'block', textAlign: 'center', background: '#2e7d32', color: 'white',
          padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '600'
        }}>Continue shopping</Link>
      </div>
    </div>
  )
}
