import { supabaseFetch } from '@/lib/supabase'
import ProductGrid from './ProductGrid'

export default async function PopularProducts() {
  let products = []
  let categories = []
  try {
    ;[products, categories] = await Promise.all([
      supabaseFetch(
        `products?select=id,name,price,sale_price,moq,unit,image_url,shop_id,category_id,shops(name)&is_available=eq.true&order=created_at.desc&limit=40`
      ),
      supabaseFetch(`categories?select=id,name,parent_id,sort_order&is_active=eq.true&order=sort_order`),
    ])
  } catch (e) {
    console.error(e)
  }

  if (!products || products.length === 0) return null

  return (
    <div id="products-grid" className="picks-section" style={{ scrollMarginTop: '70px' }}>
      <div className="picks-header">
        <h2 className="shop-heading picks-title">Today's picks</h2>
        <p className="picks-subtitle">Message a seller directly — no checkout, no waiting.</p>
      </div>
      <ProductGrid products={products} categories={categories || []} />
      <style>{`
        .picks-section { background: #eef0ee; padding: 22px 16px 26px; }
        .picks-header { margin-bottom: 14px; }
        .picks-title { font-weight: 800; color: #0a0a0a; margin: 0 0 4px; }
        .picks-subtitle { font-size: 12.5px; color: #767672; margin: 0; }
      `}</style>
    </div>
  )
}
