import Hero from '@/components/Hero'
import AreaSectionWrapper from '@/components/AreaSectionWrapper'
import ShopSection from '@/components/ShopSection'
import Footer from '@/components/Footer'

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Hero />
      <AreaSectionWrapper />
      <ShopSection />
      <Footer />
    </div>
  )
}
