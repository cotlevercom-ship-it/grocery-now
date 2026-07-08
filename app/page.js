import { supabaseFetch } from '@/lib/supabase'
import Hero from '@/components/Hero'
import AreaSection from '@/components/AreaSection'
import ShopSection from '@/components/ShopSection'
import Footer from '@/components/Footer'

export const dynamic = 'force-dynamic'

export default async function Home() {
  let areas = []
  try {
    areas = await supabaseFetch('areas?select=*&is_active=eq.true&order=name')
  } catch (e) {
    console.error(e)
  }
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Hero />
      <AreaSection areas={areas} />
      <ShopSection />
      <Footer />
    </div>
  )
}
