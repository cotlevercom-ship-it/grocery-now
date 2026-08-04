import Hero from '@/components/Hero'
import HomeSearch from '@/components/HomeSearch'
import TrustBadges from '@/components/TrustBadges'
import ShopSection from '@/components/ShopSection'
import Footer from '@/components/Footer'

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Hero />
      <HomeSearch />
      <TrustBadges />
      <ShopSection />
      <Footer />
    </div>
  )
}

