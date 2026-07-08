import { supabaseFetch } from '@/lib/supabase'
import Link from 'next/link'

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
          <p style={{ marginBottom: '20px' }}>অর্ডারটি পাওয়া যায়নি</p>
          <Link href="/" style={{
            display: 'inline-block', background: '#2e7d32', color: 'white',
            padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600'
          }}>হোমে ফিরুন</Link>
        </div>
      </div>
    )
  }

  const statusLabels = {
    pending: 'অর্ডার গৃহীত হয়েছে',
    confirmed: 'অর্ডার কনফার্ম হয়েছে',
    processing: 'প্রস্তুত করা হচ্ছে',
    out_for_delivery: 'ডেলিভারির পথে',
    delivered: 'ডেলিভারি সম্পন্ন',
    cancelled: 'অর্ডার বাতিল হয়েছে',
  }

  const statusSteps = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered']
  const currentStepIndex = statusSteps.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'

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
        <div style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>অর্ডার বিস্তারিত</div>
      </div>

      {/* Success banner */}
      <div style={{ padding: '24px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>
          {isCancelled ? '❌' : '✅'}
        </div>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' }}>
          {isCancelled ? 'অর্ডারটি বাতিল হয়েছে' : 'অর্ডারটি সফলভাবে প্লেস হয়েছে'}
        </div>
        <div style={{ fontSize: '12px', color: '#888' }}>অর্ডার আইডি: {order.id.slice(0, 8)}</div>
      </div>

      {/* Status tracker */}
      {!isCancelled && (
        <div style={{
          background: 'white', margin: '0 16px 14px', borderRadius: '10px',
          border: '1px solid #e0e0e0', padding: '16px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1a1a1a' }}>
            অর্ডার স্ট্যাটাস
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {statusSteps.map((step, i) => (
              <div key={step} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: i <= currentStepIndex ? '#2e7d32' : '#e0e0e0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', color: 'white', flexShrink: 0
                  }}>{i <= currentStepIndex ? '✓' : ''}</div>
                  {i < statusSteps.length - 1 && (
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
                  }}>{statusLabels[step]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shop info */}
      {shop && (
        <div style={{
          background: 'white', margin: '0 16px 14px', borderRadius: '10px',
          border: '1px solid #e0e0e0', padding: '16px'
        }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>দোকান</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>{shop.name}</div>
        </div>
      )}

      {/* Items */}
      <div style={{
        background: 'white', margin: '0 16px 14px', borderRadius: '10px',
        border: '1px solid #e0e0e0', padding: '16px'
      }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: '#1a1a1a' }}>
          অর্ডার আইটেম
        </div>
        {items.map(item => (
          <div key={item.id} style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '13px', color: '#555', marginBottom: '8px'
          }}>
            <span>{item.product_name} × {item.quantity}</span>
            <span>৳{item.total_price}</span>
          </div>
        ))}
        <div style={{
          display: 'flex', justifyContent: 'space-between', fontSize: '13px',
          color: '#555', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee'
        }}>
          <span>সাবটোটাল</span>
          <span>৳{order.subtotal}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', marginTop: '6px' }}>
          <span>ডেলিভারি চার্জ</span>
          <span>{order.delivery_charge === 0 ? 'ফ্রি' : `৳${order.delivery_charge}`}</span>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', fontSize: '15px',
          fontWeight: '600', color: '#1a1a1a', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee'
        }}>
          <span>মোট</span>
          <span>৳{order.total}</span>
        </div>
      </div>

      {/* Delivery info */}
      <div style={{
        background: 'white', margin: '0 16px 14px', borderRadius: '10px',
        border: '1px solid #e0e0e0', padding: '16px'
      }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: '#1a1a1a' }}>
          ডেলিভারি তথ্য
        </div>
        <div style={{ fontSize: '13px', color: '#555', marginBottom: '4px' }}>{order.delivery_name}</div>
        <div style={{ fontSize: '13px', color: '#555', marginBottom: '4px' }}>{order.delivery_phone}</div>
        <div style={{ fontSize: '13px', color: '#555' }}>{order.delivery_address}</div>
        {order.note && (
          <div style={{ fontSize: '12px', color: '#888', marginTop: '8px', fontStyle: 'italic' }}>
            নোট: {order.note}
          </div>
        )}
      </div>

      <div style={{ padding: '0 16px' }}>
        <Link href="/shops" style={{
          display: 'block', textAlign: 'center', background: '#2e7d32', color: 'white',
          padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '600'
        }}>আরও কেনাকাটা করুন</Link>
      </div>
    </div>
  )
}
