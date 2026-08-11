'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'

const TYPE_LABEL = {
  co_founder: 'Looking for Co-founder', partner: 'Looking for Partner', investor: 'Looking for Investor',
  employee: 'Looking for Employee', supplier: 'Looking for Supplier', buyer: 'Looking for Buyer',
}

export default function ListingDetailPage() {
  const { id } = useParams()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await supabaseFetch(`listings?select=*&id=eq.${id}`)
        setListing(data?.[0] || null)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    if (id) load()
  }, [id])

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading...</div>

  if (!listing) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
        Listing not found. <Link href="/" style={{ color: '#2d6a4f', fontWeight: '600' }}>Back to home</Link>
      </div>
    )
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 40px)', maxWidth: '700px', margin: '0 auto' }}>
      <Link href="/" style={{ fontSize: '13px', color: '#666', display: 'inline-block', marginBottom: '16px' }}>← All listings</Link>

      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e5e5e5', padding: 'clamp(20px,3vw,32px)' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
          {(listing.listing_types || []).map(t => (
            <span key={t} style={{
              fontSize: '11.5px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px',
              background: '#e8f3ee', color: '#2d6a4f'
            }}>{TYPE_LABEL[t] || t}</span>
          ))}
        </div>

        <h1 style={{ fontSize: 'clamp(22px,2.5vw,28px)', fontWeight: '800', color: '#163a2c', marginBottom: '6px' }}>
          {listing.business_name}
        </h1>
        <div style={{ fontSize: '14px', color: '#888', marginBottom: '20px' }}>
          {listing.industry || 'Industry not specified'}{listing.location ? ` · ${listing.location}` : ''}
        </div>

        {listing.description && (
          <p style={{ fontSize: '15px', color: '#333', lineHeight: '1.7', marginBottom: '24px' }}>
            {listing.description}
          </p>
        )}

        <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#163a2c', marginBottom: '10px' }}>Contact</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {listing.contact_phone && (
              <a href={`tel:${listing.contact_phone}`} style={{ fontSize: '14px', color: '#2d6a4f', fontWeight: '600' }}>
                📞 {listing.contact_phone}
              </a>
            )}
            {listing.contact_email && (
              <a href={`mailto:${listing.contact_email}`} style={{ fontSize: '14px', color: '#2d6a4f', fontWeight: '600' }}>
                ✉️ {listing.contact_email}
              </a>
            )}
            {listing.website && (
              <a href={listing.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: '#2d6a4f', fontWeight: '600' }}>
                🌐 {listing.website}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
