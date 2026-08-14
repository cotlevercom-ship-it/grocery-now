import { Suspense } from 'react'
import ListingBrowse from '@/components/ListingBrowse'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Browse Businesses — Partners & Co-founders | Cot Lever',
  description: 'Browse verified business listings looking for partners, co-founders, or share holders. List your own business on Cot Lever today.',
  alternates: {
    canonical: '/listings',
  },
}

export default function ListingsPage() {
  return (
    <Suspense fallback={null}>
      <ListingBrowse />
    </Suspense>
  )
}
