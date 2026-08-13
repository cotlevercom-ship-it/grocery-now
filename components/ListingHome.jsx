'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import { fetchListingTypes } from '@/lib/listingTypes'

// The single most useful field to surface on the card for each listing type,
// so a browsing visitor sees the key number/detail without opening the listing.
const HIGHLIGHT_FIELD = {
  investor: { key: 'amount_needed', icon: '💰' },
  employee: { key: 'position', icon: '💼' },
  co_founder: { key: 'skills_needed', icon: '🧩' },
  partner: { key: 'partnership_type', icon: '🔗' },
  supplier: { key: 'product', icon: '📦' },
  buyer: { key: 'product', icon: '🛒' },
}

function highlightFor(listing) {
  for (const type of listing.listing_types || []) {
    const cfg = HIGHLIGHT_FIELD[type]
    const val = listing.extra_fields?.[type]?.[cfg?.key]
    if (val) return { icon: cfg.icon, text: val }
  }
  return null
}

function timeAgo(dateStr) {
  if (!dateStr) return null
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  return `${months} mo ago`
}

export default function ListingHome() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [typeOptions, setTypeOptions] = useState([]) // all types (active + inactive) — for label/icon lookups
  const TYPE_LABEL = Object.fromEntries(typeOptions.map(t => [t.key, t.label]))
  const TYPE_ICON = Object.fromEntries(typeOptions.map(t => [t.key, t.icon]))
  const activeTypeOptions = typeOptions.filter(t => t.is_active)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [data, types] = await Promise.all([
          supabaseFetch('listings?select=*&status=eq.active&order=created_at.desc'),
          fetchListingTypes(),
        ])
        setListings(data || [])
        setTypeOptions(types)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filterType === 'all'
    ? listings
    : listings.filter(l => (l.listing_types || []).includes(filterType))

  return (
    <div style={{ background: theme.paper }}>
      {/* Hero */}
      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: 'clamp(28px,5vw,64px) clamp(16px,3vw,56px)',
      }}>
        <div style={{ maxWidth: '640px' }}>
          <h1 style={{
            fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(32px,4.2vw,52px)',
            lineHeight: '1.08', color: theme.ink, marginBottom: '28px', letterSpacing: '-0.01em'
          }}>
            Find the right people for your business.
          </h1>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/listings/new" style={{
              display: 'inline-block', background: theme.brass, color: 'white',
              borderRadius: '8px', padding: '14px 26px', fontSize: '14.5px', fontWeight: '600', textDecoration: 'none'
            }}>List Your Business</Link>
            <Link href="/members" style={{
              display: 'inline-block', background: 'transparent', color: theme.ink, border: `1px solid ${theme.line}`,
              borderRadius: '8px', padding: '14px 26px', fontSize: '14.5px', fontWeight: '600', textDecoration: 'none'
            }}>Find a Co-founder</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,3vw,56px)' }}>
        {/* Type filter — hidden entirely when there's only one (or zero) active type,
            since filtering wouldn't change what's shown */}
        {activeTypeOptions.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
            <button onClick={() => setFilterType('all')} style={{
              padding: '8px 16px', borderRadius: '20px', border: `1px solid ${filterType === 'all' ? theme.ink : theme.line}`,
              fontSize: '13px', fontWeight: '600', fontFamily: theme.fontBody,
              background: filterType === 'all' ? theme.ink : theme.surface,
              color: filterType === 'all' ? theme.paper : theme.inkSoft,
            }}>All</button>
            {activeTypeOptions.map(t => (
              <button key={t.key} onClick={() => setFilterType(t.key)} style={{
                padding: '8px 16px', borderRadius: '20px', border: `1px solid ${filterType === t.key ? theme.ink : theme.line}`,
                fontSize: '13px', fontWeight: '600', fontFamily: theme.fontBody,
                background: filterType === t.key ? theme.ink : theme.surface,
                color: filterType === t.key ? theme.paper : theme.inkSoft,
              }}>{t.label}</button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ color: theme.inkSoft, fontSize: '14px', textAlign: 'center', padding: '60px' }}>Loading listings…</div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px', color: theme.inkSoft,
            background: theme.surface, borderRadius: '10px', border: `1px solid ${theme.line}`
          }}>
            <p style={{ fontFamily: theme.fontDisplay, fontSize: '18px', color: theme.ink, marginBottom: '8px' }}>No listings yet in this category</p>
            <p style={{ fontSize: '13.5px' }}>Be the first — <Link href="/listings/new" style={{ color: theme.brassDark, fontWeight: '600' }}>list your business</Link>.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(240px,25vw,300px),1fr))',
            gap: 'clamp(14px, 1.6vw, 22px)'
          }}>
            {filtered.map((listing, i) => {
              const highlight = highlightFor(listing)
              const freshness = timeAgo(listing.created_at)
              const initial = (listing.business_name || '?').trim().charAt(0).toUpperCase()
              const primaryType = (listing.listing_types || [])[0]
              const regNo = String(listing.id).replace(/-/g, '').slice(0, 6).toUpperCase()
              return (
                <Link key={listing.id} href={`/listing/${listing.id}`} className="listing-card" style={{
                  background: theme.surface, borderRadius: '3px', border: `1px solid ${theme.line}`,
                  textDecoration: 'none', display: 'flex', flexDirection: 'column', minHeight: '278px',
                  position: 'relative', overflow: 'hidden'
                }}>
                  {/* Registry stripe — a filed-document tab in the primary type's identity */}
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: theme.brass }} />

                  <div style={{ padding: '18px 20px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Eyebrow row — registry-card header: file number + date stamped, mono type */}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                      fontFamily: theme.fontMono, fontSize: '10px', letterSpacing: '0.06em',
                      color: theme.inkSoft, marginBottom: '16px', borderBottom: `1px solid ${theme.lineSoft}`, paddingBottom: '10px'
                    }}>
                      <span>NO. {regNo}</span>
                      {freshness && <span>{freshness === 'Today' ? 'FILED TODAY' : freshness.toUpperCase()}</span>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '13px', marginBottom: '14px' }}>
                      <div style={{
                        width: '42px', height: '42px', flexShrink: 0, overflow: 'hidden',
                        background: theme.ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `1px solid ${theme.brass}`
                      }}>
                        <span style={{ fontFamily: theme.fontDisplay, fontSize: '17px', fontWeight: '600', color: theme.paper }}>{initial}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: theme.fontDisplay, fontSize: '17px', fontWeight: '600', color: theme.ink, lineHeight: '1.25' }}>
                          {listing.business_name}
                        </div>
                        <div style={{ fontSize: '12px', color: theme.inkSoft, marginTop: '3px' }}>
                          {listing.industry || 'Industry not specified'}{listing.location ? ` · ${listing.location}` : ''}
                        </div>
                      </div>
                    </div>

                    {/* Fixed-height slot reserved whether or not a highlight exists, so
                        cards line up regardless of which listings have extra_fields data. */}
                    <div style={{
                      fontSize: '12.5px', fontWeight: '600', color: theme.brassDark, marginBottom: '10px',
                      display: 'flex', alignItems: 'flex-start', gap: '6px', lineHeight: '1.4', minHeight: '18px'
                    }}>
                      {highlight && (
                        <>
                          <span>{highlight.icon}</span>
                          <span style={{
                            overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                            WebkitLineClamp: 1, WebkitBoxOrient: 'vertical'
                          }}>{highlight.text}</span>
                        </>
                      )}
                    </div>

                    <p style={{
                      fontSize: '12.5px', color: theme.inkSoft, marginBottom: '16px', lineHeight: '1.55',
                      overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', flex: 1
                    }}>{listing.description || ''}</p>

                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', borderTop: `1px solid ${theme.lineSoft}`, paddingTop: '12px' }}>
                      {(listing.listing_types || []).map(t => (
                        <span key={t} style={{
                          fontSize: '11px', fontWeight: '600', color: theme.signal,
                          display: 'inline-flex', alignItems: 'center', gap: '5px', letterSpacing: '0.01em'
                        }}><span>{TYPE_ICON[t] || ''}</span>{TYPE_LABEL[t] || t}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              )
            })}
            <style jsx>{`
              .listing-card {
                transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
              }
              .listing-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px -8px rgba(20, 33, 61, 0.18);
                border-color: ${theme.brass};
              }
            `}</style>
          </div>
        )}
      </div>

      {/* Resources teaser */}
      <div style={{ borderTop: `1px solid ${theme.line}` }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: 'clamp(28px,4vw,48px) clamp(16px,3vw,56px)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
        }}>
          <div>
            <div style={{ fontFamily: theme.fontDisplay, fontSize: '20px', fontWeight: '600', color: theme.ink, marginBottom: '4px' }}>
              Resources for founders
            </div>
            <p style={{ fontSize: '13.5px', color: theme.inkSoft }}>Short, practical reads on finding co-founders, investors, and partners.</p>
          </div>
          <Link href="/resources" style={{
            display: 'inline-block', background: 'transparent', color: theme.ink, border: `1px solid ${theme.line}`,
            borderRadius: '8px', padding: '11px 20px', fontSize: '13.5px', fontWeight: '600', textDecoration: 'none', whiteSpace: 'nowrap'
          }}>Browse Articles →</Link>
        </div>
      </div>
    </div>
  )
}
