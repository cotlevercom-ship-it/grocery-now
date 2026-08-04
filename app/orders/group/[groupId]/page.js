import { supabaseFetch } from '@/lib/supabase'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const statusLabels = {
  pending: 'Waiting for merchant',
  confirmed: 'Confirmed',
  processing: 'Processing',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export default async function OrderGroupPage({ params }) {
  const { groupId } = await params

  let orders = []
  try {
    orders = await supabaseFetch(`orders?select=*&order_group_id=eq.${groupId}&order=created_at`)
  } catch (e) {
    console.error(e)
  }

  if (!orders || orders.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#999' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❓</div>
          <p style={{ marginBottom: '20px' }}>Orders not found</p>
          <Link href="/" style={{
            display: 'inline-block', background: '#0a0a0a', color: 'white',
            padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600'
          }}>Back to home</Link>
        </div>
      </div>
    )
  }

  // Fetch shop names for each order
  const shopIds = Array.from(new Set(orders.map(o => o.shop_id).filter(Boolean)))
  let shopsById = {}
  try {
    const shops = await supabaseFetch(`shops?select=id,name&id=in.(${shopIds.join(',')})`)
    shopsById = Object.fromEntries((shops || []).map(s => [s.id, s.name]))
  } catch (e) {
    console.error(e)
  }

  const grandTotal = orders.reduce((a, b) => a + Number(b.total || 0), 0)

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', paddingBottom: '40px' }}>
      {/* Topbar */}
      <div style={{
        background: '#0a0a0a', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <Link href="/">
          <div style={{ color: 'white', fontSize: '22px', lineHeight: 1 }}>←</div>
        </Link>
        <div style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>Your orders</div>
      </div>

      {/* Success banner */}
      <div style={{ padding: '24px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' }}>
          Order placed successfully
        </div>
        <div style={{ fontSize: '12px', color: '#888' }}>
          {orders.length} orders from {orders.length} shops · ৳{grandTotal}
        </div>
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '0 16px' }}>
        {orders.map(order => (
          <Link key={order.id} href={`/orders/${order.id}`} style={{
            display: 'block', background: 'white', borderRadius: '10px', border: '1px solid #eee',
            padding: '16px', marginBottom: '12px', textDecoration: 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>
                  {shopsById[order.shop_id] || 'Shop'}
                </div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                  Order ID: {order.id.slice(0, 8)}
                </div>
              </div>
              <span style={{
                fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '999px',
                background: order.status === 'cancelled' ? '#ffebee' : '#fdf1d9',
                color: order.status === 'cancelled' ? '#c62828' : '#8a6d00',
              }}>
                {statusLabels[order.status] || order.status}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555' }}>
              <span>Subtotal ৳{order.subtotal} + Delivery ৳{order.delivery_charge || 0}</span>
              <span style={{ fontWeight: '700', color: '#1a1a1a' }}>৳{order.total}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
