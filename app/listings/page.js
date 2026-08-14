import { Suspense } from 'react'
import ListingBrowse from '@/components/ListingBrowse'

export const dynamic = 'force-dynamic'

export default function ListingsPage() {
  return (
    <Suspense fallback={null}>
      <ListingBrowse />
    </Suspense>
  )
}
