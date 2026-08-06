import { supabaseFetch } from '@/lib/supabase'
import ProductGrid from './ProductGrid'
import CategorySections from './CategorySections'

export default async function PopularProducts() {
  let products = []
  let departments = []
  let categories = []
  try {
    ;[products, departments, categories] = await Promise.all([
      supabaseFetch(
        `products?select=id,name,price,sale_price,moq,unit,image_url,shop_id,category_id,shops(name,department_id)&is_available=eq.true&order=created_at.desc&limit=40`
      ),
      supabaseFetch(`departments?select=*&is_active=eq.true&order=sort_order`),
      supabaseFetch(`categories?select=id,name,parent_id,sort_order&is_active=eq.true&order=sort_order`),
    ])
  } catch (e) {
    console.error(e)
  }

  if (!products || products.length === 0) return null

  return (
    <div style={{ background: '#f5f5f5', padding: '24px 16px 8px' }}>
      <div>
        <h2 className="shop-heading" style={{ fontWeight: '800', color: '#0a0a0a', marginBottom: '14px' }}>
          Popular Products
        </h2>

        <ProductGrid products={products} departments={departments || []} categories={categories || []} />
      </div>

      <CategorySections products={products} categories={categories || []} />
    </div>
  )
}
