import { supabaseFetch } from '@/lib/supabase'
import ProductGrid from './ProductGrid'
import CategorySections from './CategorySections'

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

  let soldCounts = {}
  try {
    const ids = products.map(p => p.id).join(',')
    const items = await supabaseFetch(`order_items?select=product_id,quantity&product_id=in.(${ids})`)
    soldCounts = (items || []).reduce((acc, item) => {
      acc[item.product_id] = (acc[item.product_id] || 0) + (item.quantity || 0)
      return acc
    }, {})
  } catch (e) {
    console.error(e)
  }

  return (
    <div style={{ background: '#f5f5f5', padding: '24px 16px 8px' }}>
      <div>
        <h2 className="shop-heading" style={{ fontWeight: '800', color: '#0a0a0a', marginBottom: '14px' }}>
          Popular Products
        </h2>

        <ProductGrid products={products} categories={categories || []} soldCounts={soldCounts} />
      </div>

      <CategorySections products={products} categories={categories || []} soldCounts={soldCounts} />
    </div>
  )
}
