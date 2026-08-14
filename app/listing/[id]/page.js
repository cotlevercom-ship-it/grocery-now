import { supabaseFetch } from '@/lib/supabase'
import ListingClient from './ListingClient'

export async function generateMetadata({ params }) {
  const { id } = await params
  try {
    const data = await supabaseFetch(`listings?select=business_name,description,industry,location&id=eq.${id}`)
    const listing = data?.[0]
    if (!listing) {
      return { title: 'Listing Not Found | Cot Lever' }
    }
    const locationBit = listing.industry || listing.location
      ? ` — ${[listing.industry, listing.location].filter(Boolean).join(', ')}`
      : ''
    return {
      title: `${listing.business_name} | Cot Lever`,
      description: listing.description
        ? listing.description.slice(0, 155)
        : `${listing.business_name}${locationBit} on Cot Lever.`,
    }
  } catch (e) {
    return { title: 'Cot Lever' }
  }
}

export default function ListingDetailPage() {
  return <ListingClient />
}
