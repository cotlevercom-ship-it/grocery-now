'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import { EXTRA_FIELD_CONFIG } from '@/lib/listingExtraFields'
import { fetchListingTypes } from '@/lib/listingTypes'

// Small icon per extra-field key so metric cards feel like a data sheet, not a plain list.
const FIELD_ICON = {
  amount_needed: '💰', investment_type: '📄', stage: '📈', monthly_revenue: '📊',
  skills_needed: '🧩', equity_offered: '📄', equity_percent: '📄', commitment: '⏱️',
  partnership_type: '🔗', expectation: '🎯',
  position: '💼', openings: '🔢', salary_range: '💵', employment_type: '⏱️',
  product: '📦', volume: '📦',
}

function verifiedCheckmark(size = 18) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="currentColor" />
      <path d="M6 10.2l2.4 2.4L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function timeAgo(dateStr) {
  if (!dateStr) return null
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'Listed today'
  if (days === 1) return 'Listed 1 day ago'
  if (days < 30) return `Listed ${days} days ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `Listed ${months} month${months > 1 ? 's' : ''} ago`
  const years = Math.floor(months / 12)
  return `Listed ${years} year${years > 1 ? 's' : ''} ago`
}

export default function ListingDetailPage() {
  const { id } = useParams()
  const [listing, setListing] = useState(null)
  const [ownerName, setOwnerName] = useState(null)
  const [verified, setVerified] = useState(false)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeOptions, setTypeOptions] = useState([]) // all types (active + inactive), for label/icon lookup on saved listings
  const TYPE_LABEL = Object.fromEntries(typeOptions.map(t => [t.key, `Looking for ${t.label}`]))
  const TYPE_ICON = Object.fromEntries(typeOptions.map(t => [t.key, t.icon]))

  useEffect(() => {
    fetchListingTypes().then(setTypeOptions).catch(e => console.error(e))
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await supabaseFetch(`listings?select=*&id=eq.${id}`)
        const item = data?.[0] || null
        setListing(item)

        if (item) {
          // Verified badge: an active (paid + approved) subscription exists for this listing.
          try {
            const subs = await supabaseFetch(`listing_subscriptions?select=status&listing_id=eq.${id}&status=eq.active&limit=1`)
            setVerified((subs?.length || 0) > 0)
          } catch (e) { /* non-fatal */ }

          // Owner name — shown as "Business Name by Owner" and links to their member profile.
          if (item.owner_id) {
            try {
              const owner = await supabaseFetch(`member_profiles?select=display_name&user_id=eq.${item.owner_id}&limit=1`)
              setOwnerName(owner?.[0]?.display_name || null)
            } catch (e) { /* non-fatal */ }
          }

          // Related listings: other active listings sharing at least one purpose type.
          if (item.listing_types?.length) {
            try {
              const orFilter = item.listing_types.map(t => `listing_types.cs.{${t}}`).join(',')
              const rel = await supabaseFetch(`listings?select=id,business_name,industry,location,listing_types&status=eq.active&is_filled=eq.false&id=neq.${id}&or=(${orFilter})&limit=3`)
              setRelated(rel || [])
            } catch (e) { /* non-fatal */ }
          }
        }
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

  const stats = [
    { label: 'Industry', value: listing.industry || '—' },
    { label: 'Location', value: listing.location || '—' },
    { label: 'Status', value: listing.is_filled ? 'Filled' : (listing.status === 'active' ? 'Active' : listing.status) },
    { label: 'Listed', value: timeAgo(listing.created_at) || '—' },
  ]

  return (
    <div style={{ background: theme.paper, minHeight: '70vh' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(20px,4vw,48px) clamp(16px,3vw,24px)' }}>
        <Link href="/" style={{ fontSize: '13px', color: theme.inkSoft, textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>← All listings</Link>

        <div style={{ background: theme.surface, borderRadius: '12px', border: `1px solid ${theme.line}`, padding: 'clamp(24px,3.5vw,36px)' }}>

          {/* Type chips — labeled plainly so it's unambiguous what this business wants */}
          <div style={{ fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.07em', textTransform: 'uppercase', color: theme.inkSoft, marginBottom: '8px' }}>
            Looking for
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
            {(listing.listing_types || []).map(t => (
              <span key={t} style={{
                fontSize: '11.5px', fontWeight: '600', padding: '5px 11px', borderRadius: '20px',
                background: theme.signalSoft, color: theme.signal, display: 'inline-flex', alignItems: 'center', gap: '5px'
              }}>
                <span>{TYPE_ICON[t] || '•'}</span>{(TYPE_LABEL[t] || t).replace(/^Looking for /, '')}
              </span>
            ))}
          </div>

          <h1 style={{
            fontFamily: theme.fontDisplay, fontSize: 'clamp(24px,2.8vw,32px)', fontWeight: '600', color: theme.ink,
            marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '14px'
          }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden',
                background: theme.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{ fontFamily: theme.fontDisplay, fontSize: '18px', fontWeight: '600', color: theme.paper }}>
                  {(listing.business_name || '?').trim().charAt(0).toUpperCase()}
                </span>
              </div>
              {verified && (
                <div style={{
                  position: 'absolute', bottom: '-3px', right: '-3px', color: theme.signal,
                  background: theme.surface, borderRadius: '50%', lineHeight: 0
                }}>{verifiedCheckmark(18)}</div>
              )}
            </div>
            {listing.business_name}
          </h1>
          {(listing.owner_name || ownerName) && (
            <div style={{ fontSize: '13.5px', color: theme.inkSoft, marginTop: '-12px', marginBottom: '22px', paddingLeft: '62px' }}>
              by {ownerName ? (
                <Link href={`/members/${listing.owner_id}`} style={{ color: theme.brassDark, fontWeight: '600', textDecoration: 'none' }}>{listing.owner_name || ownerName}</Link>
              ) : (
                <span style={{ color: theme.ink, fontWeight: '600' }}>{listing.owner_name}</span>
              )}
            </div>
          )}

          {/* Stats bar — Crunchbase-style compact row of key facts */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0',
            border: `1px solid ${theme.line}`, borderRadius: '10px', overflow: 'hidden', marginBottom: '26px'
          }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{
                padding: '12px 16px', background: theme.paper,
                borderLeft: i > 0 ? `1px solid ${theme.line}` : 'none'
              }}>
                <div style={{ fontFamily: theme.fontMono, fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase', color: theme.inkSoft, marginBottom: '4px' }}>{s.label}</div>
                <div style={{ fontSize: '13.5px', fontWeight: '600', color: theme.ink }}>{s.value}</div>
              </div>
            ))}
          </div>

          {listing.description && (
            <p style={{ fontSize: '15px', color: theme.ink, lineHeight: '1.7', marginBottom: '28px' }}>
              {listing.description}
            </p>
          )}

          {/* Metric cards per selected purpose type */}
          {(listing.listing_types || []).map(type => {
            const config = EXTRA_FIELD_CONFIG[type]
            const values = listing.extra_fields?.[type]
            if (!config || !values || Object.keys(values).length === 0) return null
            const filled = config.fields.filter(f => values[f.key])
            if (!filled.length) return null
            return (
              <div key={type} style={{ marginBottom: '22px' }}>
                <div style={{
                  fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: theme.brassDark, marginBottom: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <span>{TYPE_ICON[type]}</span>{config.label}
                </div>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px'
                }}>
                  {filled.map(f => (
                    <div key={f.key} style={{
                      padding: '14px 16px', borderRadius: '10px', background: theme.paper,
                      border: `1px solid ${theme.line}`
                    }}>
                      <div style={{ fontSize: '11.5px', color: theme.inkSoft, marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{FIELD_ICON[f.key] || '•'}</span>{f.label}
                      </div>
                      <div style={{ fontSize: '14.5px', fontWeight: '700', color: theme.ink }}>{values[f.key]}</div>
                    </div>
                  ))}
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

        {/* Related listings */}
        {related.length > 0 && (
          <div style={{ marginTop: '28px' }}>
            <div style={{ fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '700', color: theme.brassDark, marginBottom: '12px' }}>
              Similar Listings
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {related.map(r => (
                <Link key={r.id} href={`/listing/${r.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: theme.surface, border: `1px solid ${theme.line}`, borderRadius: '10px',
                    padding: '16px', height: '100%'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                        background: theme.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <span style={{ fontFamily: theme.fontDisplay, fontSize: '13px', fontWeight: '600', color: theme.paper }}>
                          {(r.business_name || '?').trim().charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '14.5px', fontWeight: '700', color: theme.ink }}>{r.business_name}</div>
                        <div style={{ fontSize: '12px', color: theme.inkSoft }}>
                          {r.industry || 'Industry not specified'}{r.location ? ` · ${r.location}` : ''}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {(r.listing_types || []).slice(0, 2).map(t => (
                        <span key={t} style={{
                          fontSize: '10.5px', fontWeight: '600', padding: '3px 8px', borderRadius: '12px',
                          background: theme.signalSoft, color: theme.signal
                        }}>{TYPE_LABEL[t] || t}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
