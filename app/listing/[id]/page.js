import { supabaseFetch } from '@/lib/supabase'
import ListingClient from './ListingClient'

async function getListing(id) {
  try {
    const data = await supabaseFetch(`listings?select=business_name,description,industry,location,website&id=eq.${id}`)
    return data?.[0] || null
  } catch (e) {
    return null
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params
  const listing = await getListing(id)
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
    alternates: {
      canonical: `/listing/${id}`,
    },
  }
}

export default async function ListingDetailPage({ params }) {
  const { id } = await params
  const listing = await getListing(id)

  const jsonLd = listing
    ? {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: listing.business_name,
        description: listing.description || undefined,
        url: `https://cotlever.com/listing/${id}`,
        ...(listing.website ? { sameAs: [listing.website] } : {}),
      }
    : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ListingClient />
    </>
  )
}
