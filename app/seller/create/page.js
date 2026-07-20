'use client'
import { useState, useEffect } from 'react'
import { getSession, supabaseFetch } from '@/lib/supabase'

export default function SellerDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [shop, setShop] = useState(null)
  const [productCount, setProductCount] = useState(0)
  const [orderCount, setOrderCount] = useState(0)
  const [pendingOrderCount, setPendingOrderCount] = useState(0)

  useEffect(() => {
    async function load() {
      const session = getSession()
      if (!session?.user) return
      try {
        const shops = await supabaseFetch(`shops?select=*,areas(name)&owner_id=eq.${session.user.id}`)
        const myShop = shops?.[0]
        setShop(myShop || null)

        if (myShop) {
          const products = await supabaseFetch(`products?select=id&shop_id=eq.${myShop.id}`)
          setProductCount(products?.length || 0)

          const orders = await supabaseFetch(`orders?select=id,status&shop_id=eq.${myShop.id}`)
          setOrderCount(orders?.length || 0)
          setPendingOrderCount((orders || []).filter(o => o.status === 'pending').length)
        }
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <div style={{ color: '#888', fontSize: '14px' }}>লোড হচ্ছে...</div>
  }

  if (!shop) {
    return <div style={{ color: '#888', fontSize: '14px' }}>দোকানের তথ্য পাওয়া যায়নি</div>
  }

  const statCards = [
    { label: 'মোট প্রোডাক্ট', value: productCount, icon: '📦', color: '#2e7d32' },
    { label: 'মোট অর্ডার', value: orderCount, icon: '🧾', color: '#1565c0' },
    { label: 'অপেক্ষমাণ অর্ডার', value: pendingOrderCount, icon: '⏳', color: '#f4a300' },
  ]

  return (
    <div>
      <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#163a2c', margin: '0 0 6px' }}>
        {shop.name}
      </h1>
      <div style={{ fontSize: '13px', color: '#777', marginBottom: '24px' }}>
        {shop.areas?.name ? `📍 ${shop.areas.name}` : ''}
        {'  '}
        <span style={{
          display: 'inline-block', marginLeft: '8px', padding: '2px 10px',
          borderRadius: '12px', fontSize: '12px', fontWeight: '600',
          background: shop.is_active ? '#e8f5e9' : '#ffebee',
          color: shop.is_active ? '#2e7d32' : '#c62828'
        }}>
          {shop.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {statCards.map(card => (
          <div key={card.label} style={{
            background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
            padding: '18px 22px', minWidth: '160px', flex: '1 1 160px'
          }}>
            <div style={{ fontSize: '22px', marginBottom: '8px' }}>{card.icon}</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: card.color }}>{card.value}</div>
            <div style={{ fontSize: '13px', color: '#777', marginTop: '2px' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {shop.description && (
        <div style={{
          marginTop: '24px', background: 'white', borderRadius: '10px',
          border: '1px solid #e0e0e0', padding: '16px 20px'
        }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>বিবরণ</div>
          <div style={{ fontSize: '14px', color: '#333' }}>{shop.description}</div>
        </div>
      )}
    </div>
  )
}
