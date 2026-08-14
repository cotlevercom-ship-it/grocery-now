import { Suspense } from 'react'
import ListingBrowse from '@/components/ListingBrowse'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Browse Businesses — Partners, Investors, Suppliers | Cot Lever',
  description: 'Browse verified business listings looking for partners, investors, employees, or suppliers. List your own business on Cot Lever today.',
}

export default function ListingsPage() {
  return (
    <Suspense fallback={null}>
      <ListingBrowse />
    </Suspense>
  )
}
