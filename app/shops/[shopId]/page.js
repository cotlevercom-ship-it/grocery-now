import { supabaseFetch } from '@/lib/supabase'
import Link from 'next/link'
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
      `products?select=id,shop_id,category_id,name,description,price,sale_price,unit,image_url,image_urls,stock,is_available,sort_order,brand,weight_grams,sku,product_variants(id,name,price,sale_price,stock,sku,is_available,sort_order)&shop_id=eq.${shopId}&is_available=eq.true&order=sort_order`
    )
  } catch (e) {
    console.error(e)
  }

  if (!shop) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
        <p>দোকান পাওয়া যায়নি</p>
        <Link href="/">হোমে ফিরুন</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Topbar */}
      <div style={{ background: '#2e7d32', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/shops">
          <div style={{ color: 'white', fontSize: '22px', lineHeight: 1 }}>←</div>
        </Link>
        <div style={{ color: 'white', fontSize: '16px', fontWeight: '500', flex: 1 }}>{shop.name}</div>
      </div>

      {/* Shop info */}
      <div style={{ background: '#2e7d32', padding: '14px 16px 20px' }}>
        <div style={{ display: 'flex', gap: '16px', color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>
          <span>⭐ {shop.rating || '৪.৫'}</span>
          <span>⏱ {shop.delivery_time_min}-{shop.delivery_time_max} মি.</span>
          <span>🚴 {shop.delivery_charge === 0 ? 'ফ্রি' : `৳${shop.delivery_charge}`}</span>
        </div>
      </div>

      {/* Products */}
      <ProductList categories={categories} products={products} shop={shop} />
    </div>
  )
}
