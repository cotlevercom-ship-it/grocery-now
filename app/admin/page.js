'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'

const statusLabels = {
  pending: 'New',
  confirmed: 'Confirmed',
  processing: 'Processing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [orders, setOrders] = useState([])
  const [shopCount, setShopCount] = useState(0)
  const [productCount, setProductCount] = useState(0)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [ordersData, shopsData, productsData] = await Promise.all([
          supabaseFetch('orders?select=id,status,total,created_at,shops(name)&order=created_at.desc'),
          supabaseFetch('shops?select=id'),
          supabaseFetch('products?select=id'),
        ])
        setOrders(ordersData || [])
        setShopCount((shopsData || []).length)
        setProductCount((productsData || []).length)
      } catch (e) {
        console.error(e)
        setError('Failed to load data')
      }
      setLoading(false)
    }
    load()
  }, [])

  const today = new Date()
  const todayOrders = orders.filter(o => isSameDay(new Date(o.created_at), today))
  const pendingOrders = orders.filter(o => o.status === 'pending')
  const deliveredOrders = orders.filter(o => o.status === 'delivered')
  const cancelledOrders = orders.filter(o => o.status === 'cancelled')

  const totalSales = deliveredOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
  const todaySales = todayOrders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0)

  const cards = [
    { label: 'Total Orders', value: orders.length, icon: '🧾', color: '#163a2c' },
    { label: "Today's Orders", value: todayOrders.length, icon: '📅', color: '#1565c0' },
    { label: 'New / Pending Orders', value: pendingOrders.length, icon: '⏳', color: '#f4a300' },
    { label: 'Total Sales (Delivered)', value: `৳${totalSales.toLocaleString('en-US')}`, icon: '💰', color: '#2d6a4f' },
    { label: "Today's Sales", value: `৳${todaySales.toLocaleString('en-US')}`, icon: '📈', color: '#00695c' },
    { label: 'Cancelled Orders', value: cancelledOrders.length, icon: '✕', color: '#c62828' },
    { label: 'Total Shops', value: shopCount, icon: '🏪', color: '#5e35b1' },
    { label: 'Total Products', value: productCount, icon: '📦', color: '#6d4c41' },
  ]

  const recentOrders = orders.slice(0, 6)

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '8px' }}>
        Dashboard
      </h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        Overview of shops, orders, and sales.
      </p>

      {error && (
        <div style={{
          maxWidth: '600px', marginBottom: '16px', padding: '10px 12px',
          background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
        }}>{error}</div>
      )}

      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>Loading...</div>
      ) : (
        <>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '14px', marginBottom: '28px'
          }}>
            {cards.map(card => (
              <div key={card.label} style={{
                background: 'white', borderRadius: '12px', border: '1px solid #e0e0e0',
                padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px'
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: `${card.color}1a`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '18px'
                }}>{card.icon}</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: card.color }}>
                  {card.value}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>{card.label}</div>
              </div>
            ))}
          </div>

          <div style={{
            background: 'white', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', borderBottom: '1px solid #eee'
            }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#163a2c' }}>Recent Orders</div>
              <Link href="/admin/orders" style={{ fontSize: '13px', color: '#2d6a4f', fontWeight: '600' }}>
                View all →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                No orders found
              </div>
            ) : (
              <div>
                {recentOrders.map(order => (
                  <div key={order.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderBottom: '1px solid #f2f2f2', fontSize: '13px'
                  }}>
                    <div style={{ color: '#555' }}>
                      #{order.id.slice(0, 8)} · {order.shops?.name || 'No shop'}
                    </div>
                    <div style={{ color: '#888' }}>
                      {new Date(order.created_at).toLocaleDateString('en-US')}
                    </div>
                    <div style={{ fontWeight: '700', color: '#2e7d32' }}>৳{order.total}</div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#666' }}>
                      {statusLabels[order.status] || order.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
