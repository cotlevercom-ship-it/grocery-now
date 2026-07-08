import Hero from '@/components/Hero'
import ShopSection from '@/components/ShopSection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Hero />
      <ShopSection />
      <Footer />
    </div>
  )
}
