import { supabaseFetch } from '@/lib/supabase'
import ShopGrid from './ShopGrid'

export const dynamic = 'force-dynamic'

export default async function ShopSection() {
  let shops = []
  try {
    shops = await supabaseFetch(`shops?select=*&is_active=eq.true&order=is_featured.desc,created_at.desc&limit=12`)
  } catch (e) {
    console.error(e)
  }

  if (!shops || shops.length === 0) return null

  return (
    <section className="shops-section">
      <ShopGrid shops={shops} />
      <style>{`
        .shops-section { background: #eef0ee; padding: 6px 16px 30px; }
      `}</style>
    </section>
  )
}
