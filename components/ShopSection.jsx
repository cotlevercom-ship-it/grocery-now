import { supabaseFetch } from '@/lib/supabase'
import ShopGrid from './ShopGrid'

export const dynamic = 'force-dynamic'

export default async function ShopSection() {
  let shops = []
  try {
    shops = await supabaseFetch(`shops?select=*&is_active=eq.true&order=is_featured.desc,created_at.desc`)
  } catch (e) {
    console.error(e)
  }

  if (!shops || shops.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏪</div>
        <p>No shops available right now</p>
      </div>
    )
  }

  return (
    <section style={{ padding: '28px 16px 8px' }}>
      <ShopGrid shops={shops} />
    </section>
  )
}
