import Hero from '@/components/Hero'
import CategorySidebar from '@/components/CategorySidebar'
import PopularProducts from '@/components/PopularProducts'
import ShopSection from '@/components/ShopSection'
import HomeTabs from '@/components/HomeTabs'
import Footer from '@/components/Footer'

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div className="home-layout">
        <CategorySidebar />
        <div className="home-main">
          <Hero />
          <HomeTabs productsSlot={<PopularProducts />} shopsSlot={<ShopSection />} />
        </div>
      </div>

      <Footer />

      <style>{`
        .home-layout {
          display: flex;
          align-items: flex-start;
        }
        .home-main {
          flex: 1;
          min-width: 0;
        }
        @media (min-width: 1024px) {
          .home-layout {
            max-width: 1400px;
            margin: 0 auto;
            gap: 16px;
            padding: 16px 16px 0;
          }
        }
      `}</style>
    </div>
  )
}
