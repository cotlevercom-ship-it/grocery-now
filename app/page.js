import { Suspense } from 'react'
import ListingHome from '@/components/ListingHome'

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <Suspense fallback={null}>
      <ListingHome />
    </Suspense>
  )
}
