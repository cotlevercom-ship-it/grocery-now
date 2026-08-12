'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import { EXTRA_FIELD_CONFIG } from '@/lib/listingExtraFields'

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

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: theme.inkSoft }}>Loading…</div>

  if (!listing) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: theme.inkSoft }}>
        Listing not found. <Link href="/" style={{ color: theme.brassDark, fontWeight: '600' }}>Back to home</Link>
      </div>
    )
  }

  return (
    <div style={{ background: theme.paper, minHeight: '70vh' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: 'clamp(20px,4vw,48px) clamp(16px,3vw,24px)' }}>
        <Link href="/" style={{ fontSize: '13px', color: theme.inkSoft, textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>← All listings</Link>

        <div style={{ background: theme.surface, borderRadius: '12px', border: `1px solid ${theme.line}`, padding: 'clamp(24px,3.5vw,36px)' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {(listing.listing_types || []).map(t => (
              <span key={t} style={{
                fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '5px',
                background: theme.signalSoft, color: theme.signal
              }}>{TYPE_LABEL[t] || t}</span>
            ))}
          </div>

          <h1 style={{ fontFamily: theme.fontDisplay, fontSize: 'clamp(24px,2.8vw,32px)', fontWeight: '600', color: theme.ink, marginBottom: '6px' }}>
            {listing.business_name}
          </h1>
          <div style={{ fontSize: '14px', color: theme.inkSoft, marginBottom: '24px' }}>
            {listing.industry || 'Industry not specified'}{listing.location ? ` · ${listing.location}` : ''}
          </div>

          {listing.description && (
            <p style={{ fontSize: '15px', color: theme.ink, lineHeight: '1.7', marginBottom: '28px' }}>
              {listing.description}
            </p>
          )}

          {(listing.listing_types || []).map(type => {
            const config = EXTRA_FIELD_CONFIG[type]
            const values = listing.extra_fields?.[type]
            if (!config || !values || Object.keys(values).length === 0) return null
            return (
              <div key={type} style={{
                marginBottom: '20px', padding: '16px 18px', borderRadius: '10px',
                background: theme.paper, border: `1px solid ${theme.line}`
              }}>
                <div style={{
                  fontFamily: theme.fontMono, fontSize: '10.5px', letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: theme.brassDark, marginBottom: '10px', fontWeight: '600'
                }}>{config.label}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {config.fields.map(f => {
                    const v = values[f.key]
                    if (!v) return null
                    return (
                      <div key={f.key} style={{ fontSize: '13.5px', color: theme.ink }}>
                        <span style={{ color: theme.inkSoft }}>{f.label}: </span>
                        <span style={{ fontWeight: '600' }}>{v}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          <div style={{ borderTop: `1px solid ${theme.line}`, paddingTop: '22px' }}>
            <div style={{ fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '600', color: theme.brassDark, marginBottom: '12px' }}>Contact</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {listing.contact_email && (
                <a href={`mailto:${listing.contact_email}`} style={{ fontSize: '14.5px', color: theme.ink, fontWeight: '600', textDecoration: 'none' }}>
                  ✉️ {listing.contact_email}
                </a>
              )}
              {listing.website && (
                <a href={listing.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14.5px', color: theme.ink, fontWeight: '600', textDecoration: 'none' }}>
                  🌐 {listing.website}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
