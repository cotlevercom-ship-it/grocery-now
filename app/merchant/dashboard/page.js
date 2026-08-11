'use client'
import { useState, useEffect } from 'react'
import { getSession, supabaseFetch } from '@/lib/supabase'
import MerchantNav from '@/components/MerchantNav'

export default function MerchantDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [shop, setShop] = useState(null)
  const [productCount, setProductCount] = useState(0)
  const [inquiryCount, setInquiryCount] = useState(0)

  useEffect(() => {
    async function load() {
      const session = getSession()
      if (!session?.user) {
        setLoading(false)
        return
      }
      try {
        const shops = await supabaseFetch(`shops?select=*,areas(name),seller_packages(name_bn,max_products)&owner_id=eq.${session.user.id}`)
        const myShop = shops?.[0]
        setShop(myShop || null)
        if (myShop) {
          const products = await supabaseFetch(`products?select=id&shop_id=eq.${myShop.id}`)
          setProductCount(products?.length || 0)
          const inquiries = await supabaseFetch(`inquiries?select=id&shop_id=eq.${myShop.id}`)
          setInquiryCount(inquiries?.length || 0)
        }
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <MerchantNav>
        <div style={{ color: '#888', fontSize: '14px' }}>Loading...</div>
      </MerchantNav>
    )
  }

  if (!shop) {
    return (
      <MerchantNav>
        <div style={{ color: '#888', fontSize: '14px' }}>Shop information not found</div>
      </MerchantNav>
    )
  }

  const pkg = shop.seller_packages || null
  const maxProducts = pkg?.max_products ?? null

  const statCards = [
    {
      label: 'Total Products',
      value: maxProducts != null ? `${productCount}/${maxProducts}` : productCount,
      icon: '📦', color: '#0a0a0a', href: '/merchant/products'
    },
    { label: 'Buyer Inquiries', value: inquiryCount, icon: '💬', color: '#1565c0', href: '/merchant/orders' },
  ]

  return (
    <MerchantNav>
    <div>
      <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#163a2c', margin: '0 0 6px' }}>
        {shop.name}
      </h1>
      <div style={{ marginBottom: '10px' }}>
        {pkg ? (
          <span style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
            fontSize: '12px', fontWeight: '600', background: '#f3e8fd', color: '#8e24aa'
          }}>💎 {pkg.name_bn} Package</span>
        ) : (
          <a href="/merchant/package" style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
            fontSize: '12px', fontWeight: '600', background: '#fff3e0', color: '#f4a300',
            textDecoration: 'none'
          }}>Not subscribed — Choose a package →</a>
        )}
      </div>
      <div style={{ fontSize: '13px', color: '#777', marginBottom: '24px' }}>
        {shop.areas?.name ? `📍 ${shop.areas.name}` : ''}
        {'  '}
        <span style={{
          display: 'inline-block', marginLeft: '8px', padding: '2px 10px',
          borderRadius: '12px', fontSize: '12px', fontWeight: '600',
          background: shop.is_active ? '#f5f5f5' : '#ffebee',
          color: shop.is_active ? '#0a0a0a' : '#c62828'
        }}>
          {shop.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {statCards.map(card => (
          <a key={card.label} href={card.href} style={{
            background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
            padding: '18px 22px', minWidth: '160px', flex: '1 1 160px',
            textDecoration: 'none', cursor: 'pointer', display: 'block'
          }}>
            <div style={{ fontSize: '22px', marginBottom: '8px' }}>{card.icon}</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: card.color }}>{card.value}</div>
            <div style={{ fontSize: '13px', color: '#777', marginTop: '2px' }}>{card.label}</div>
          </a>
        ))}
      </div>
      {shop.description && (
        <div style={{
          marginTop: '24px', background: 'white', borderRadius: '10px',
          border: '1px solid #e0e0e0', padding: '16px 20px'
        }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>Description</div>
          <div style={{ fontSize: '14px', color: '#333' }}>{shop.description}</div>
        </div>
      )}
    </div>
    </MerchantNav>
  )
}
