import Hero from '@/components/Hero'
import RecentFounders from '@/components/RecentFounders'
import Footer from '@/components/Footer'

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#eef0ee' }}>
      <Hero />
      <RecentFounders />
      <Footer />
    </div>
  )
}



