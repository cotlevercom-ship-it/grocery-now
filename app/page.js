import Hero from '@/components/Hero'
import CategoryPreviewRow from '@/components/CategoryPreviewRow'
import PopularProducts from '@/components/PopularProducts'
import ShopSection from '@/components/ShopSection'
import Footer from '@/components/Footer'

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#eef0ee' }}>
      <Hero />
      <CategoryPreviewRow />
      <PopularProducts />
      <ShopSection />
      <Footer />
    </div>
  )
}







