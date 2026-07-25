'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch } from '@/lib/supabase'

const STATUS_LABELS = {
  pending: 'অপেক্ষমান',
  confirmed: 'কনফার্ম হয়েছে',
  processing: 'প্রস্তুত করা হচ্ছে',
  out_for_delivery: 'ডেলিভারিতে আছে',
  delivered: 'ডেলিভারি সম্পন্ন',
  cancelled: 'বাতিল হয়েছে',
}

const STATUS_COLORS = {
  pending: { bg: '#fff3e0', text: '#e65100' },
  confirmed: { bg: '#e3f2fd', text: '#1565c0' },
  processing: { bg: '#e3f2fd', text: '#1565c0' },
  out_for_delivery: { bg: '#f3e5f5', text: '#6a1b9a' },
  delivered: { bg: '#e8f5e9', text: '#2e7d32' },
  cancelled: { bg: '#ffebee', text: '#c62828' },
}

export default function OrdersHistoryPage() {
  const router = useRouter()
  const [loaded, setLoaded] = useState(false)
  const [orders, setOrders] = useState([])
  const [shopNames, setShopNames] = useState({})

  useEffect(() => {
    async function init() {
      const session = getSession()
      if (!session?.user?.id) {
        router.replace('/login?next=/account/orders')
        return
      }

      try {
        const allOrders = await supabaseFetch(
          `orders?select=*&user_id=eq.${session.user.id}&order=created_at.desc`
        )
        setOrders(allOrders || [])

        const shopIds = [...new Set((allOrders || []).map(o => o.shop_id).filter(Boolean))]
        if (shopIds.length > 0) {
          const shops = await supabaseFetch(`shops?select=id,name&id=in.(${shopIds.join(',')})`)
          const map = {}
          ;(shops || []).forEach(s => { map[s.id] = s.name })
          setShopNames(map)
        }
      } catch (e) {
        console.error(e)
      }
      setLoaded(true)
    }
    init()
  }, [router])

  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#999', fontSize: '14px' }}>লোড হচ্ছে...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', paddingBottom: '40px' }}>
      {/* Topbar */}
      <div style={{
        background: '#2e7d32', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/account">
            <div style={{ color: 'white', fontSize: '22px', lineHeight: 1 }}>←</div>
          </Link>
          <div style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>আমার অর্ডারসমূহ</div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }}>

      <div style={{
        background: 'white', margin: '16px 16px 14px', borderRadius: '10px',
        border: '1px solid #e0e0e0', padding: orders.length === 0 ? '16px' : '4px 16px'
      }}>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🛒</div>
            <div style={{ fontSize: '13px', marginBottom: '16px' }}>এখনো কোনো অর্ডার করা হয়নি</div>
            <Link href="/shops" style={{
              display: 'inline-block', background: '#2e7d32', color: 'white',
              padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600'
            }}>কেনাকাটা শুরু করুন</Link>
          </div>
        ) : (
          orders.map(order => {
            const colors = STATUS_COLORS[order.status] || STATUS_COLORS.pending
            return (
              <Link key={order.id} href={`/orders/${order.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 0', borderBottom: '1px solid #f0f0f0'
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                      {shopNames[order.shop_id] || 'দোকান'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                      অর্ডার #{order.id.slice(0, 8)} · {new Date(order.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>৳{order.total}</div>
                  </div>
                  <div style={{
                    fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px',
                    background: colors.bg, color: colors.text, whiteSpace: 'nowrap'
                  }}>
                    {STATUS_LABELS[order.status] || order.status}
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>

      </div>
    </div>
  )
}
