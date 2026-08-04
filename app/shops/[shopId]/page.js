import { supabaseFetch } from '@/lib/supabase'
import Link from 'next/link'
import { Suspense } from 'react'
import ProductList from './ProductList'

export default async function ShopPage({ params }) {
  const { shopId } = await params

  let shop = null
  let categories = []
  let products = []

  try {
    const shops = await supabaseFetch(`shops?select=*&id=eq.${shopId}`)
    shop = shops[0]

    categories = await supabaseFetch(
      `product_categories?select=*&shop_id=eq.${shopId}&order=sort_order`
    )

    products = await supabaseFetch(
      `products?select=id,shop_id,category_id,name,description,price,sale_price,unit,image_url,image_urls,stock,is_available,sort_order,brand,weight_grams,sku,moq,product_variants(id,name,price,sale_price,stock,sku,is_available,sort_order)&shop_id=eq.${shopId}&is_available=eq.true&order=sort_order`
    )
  } catch (e) {
    console.error(e)
  }

  if (!shop) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
        <p>Shop not found</p>
        <Link href="/">Back to home</Link>
      </div>
    )
  }

  const yearsActive = shop.created_at
    ? Math.max(1, Math.floor((Date.now() - new Date(shop.created_at).getTime()) / (365 * 24 * 60 * 60 * 1000)))
    : 1

  const whatsappLink = shop.phone
    ? `https://wa.me/${shop.phone.replace(/[^0-9]/g, '')}`
    : null

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Back bar */}
      <div style={{ background: '#0a0a0a', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/shops">
          <div style={{ color: 'white', fontSize: '20px', lineHeight: 1 }}>←</div>
        </Link>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>Back to shops</div>
      </div>

      {/* Supplier banner */}
      <div style={{
        position: 'relative',
        background: shop.banner_url
          ? `linear-gradient(rgba(10,10,10,0.55), rgba(10,10,10,0.75)), url(${shop.banner_url})`
          : 'linear-gradient(135deg, #163a2c 0%, #0a0a0a 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '20px 16px 22px',
      }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '8px', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(255,255,255,0.9)'
          }}>
            {shop.image_url ? (
              <img src={shop.image_url} alt={shop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : <span style={{ fontSize: '26px' }}>🏪</span>}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'white', fontSize: '18px', fontWeight: '700', lineHeight: '1.25' }}>
              {shop.name}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', marginTop: '3px' }}>
              {shop.category}{shop.location ? ` · ${shop.location}` : ''}
            </div>
          </div>
        </div>

        {/* Badge row */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}>
          <span style={{
            background: 'rgba(255,255,255,0.14)', color: 'white', fontSize: '11px',
            padding: '4px 10px', borderRadius: '5px', fontWeight: '600'
          }}>
            {yearsActive} yr{yearsActive > 1 ? 's' : ''} on Cot Lever
          </span>
          <span style={{
            background: 'rgba(255,255,255,0.14)', color: 'white', fontSize: '11px',
            padding: '4px 10px', borderRadius: '5px', fontWeight: '600'
          }}>
            ⭐ {shop.rating || '4.5'}{shop.review_count ? ` (${shop.review_count})` : ''}
          </span>
          {shop.is_featured && (
            <span style={{
              background: '#f4a300', color: '#1a1a1a', fontSize: '11px',
              padding: '4px 10px', borderRadius: '5px', fontWeight: '700'
            }}>
              Featured Merchant
            </span>
          )}
        </div>

        {/* Contact button */}
        {whatsappLink && (
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '14px',
            background: '#f4a300', color: '#1a1a1a', fontSize: '13px', fontWeight: '700',
            padding: '9px 18px', borderRadius: '6px', textDecoration: 'none'
          }}>
            💬 Contact Merchant
          </a>
        )}
      </div>

      {/* Products */}
      <Suspense fallback={null}>
        <ProductList categories={categories} products={products} shop={shop} />
      </Suspense>

      {/* Floating contact button (desktop-style Alibaba widget) */}
      {whatsappLink && (
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" style={{
          position: 'fixed', right: '16px', bottom: '90px', zIndex: 30,
          background: '#0a0a0a', color: 'white', width: '48px', height: '48px',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', boxShadow: '0 4px 14px rgba(0,0,0,0.3)', textDecoration: 'none'
        }} title="Contact Merchant">
          💬
        </a>
      )}
    </div>
  )
}
