import { supabaseFetch } from '@/lib/supabase'
import ShopDetailClient from './ShopDetailClient'

export const dynamic = 'force-dynamic'

export default async function ShopDetailPage({ params }) {
  const { id } = await params

  let shop = null
  let products = []

  try {
    const shopData = await supabaseFetch(`shops?select=*&id=eq.${id}`)
    shop = shopData?.[0] || null
  } catch (e) {
    console.error(e)
  }

  try {
    products = await supabaseFetch(
      `products?select=*&shop_id=eq.${id}&is_available=eq.true&order=sort_order,name`
    )
  } catch (e) {
    console.error(e)
  }

  if (!shop) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
        দোকান খুঁজে পাওয়া যায়নি
      </div>
    )
  }

  return <ShopDetailClient shop={shop} products={products} />
}
