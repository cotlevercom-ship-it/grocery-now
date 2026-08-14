import ListingHome from '@/components/ListingHome'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Cot Lever',
  url: 'https://cotlever.com',
  description: 'Find a co-founder, partner, investor, employee, supplier, or buyer — list your business today.',
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ListingHome />
    </>
  )
}
