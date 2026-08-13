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
          supabaseFetch('listings?select=*&status=eq.active&is_filled=eq.false&order=created_at.desc'),
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
              const types = listing.listing_types || []
              return (
                <Link key={listing.id} href={`/listing/${listing.id}`} className="listing-card" style={{
                  background: theme.surface, border: `1px solid ${theme.line}`,
                  textDecoration: 'none', display: 'flex', flexDirection: 'column',
                  padding: '20px 20px 16px', position: 'relative'
                }}>
                  {freshness && (
                    <div style={{
                      position: 'absolute', top: '14px', right: '18px',
                      fontFamily: theme.fontMono, fontSize: '9.5px', letterSpacing: '0.05em',
                      color: theme.line, textTransform: 'uppercase'
                    }}>{freshness}</div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '13px', marginBottom: '14px', paddingRight: '48px' }}>
                    {/* Notched seal — the card's connection point to the network, echoing the hero diagram's node marks */}
                    <div style={{
                      width: '40px', height: '40px', flexShrink: 0,
                      background: theme.ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 30% 100%, 0 70%)'
                    }}>
                      <span style={{ fontFamily: theme.fontDisplay, fontSize: '16px', fontWeight: '600', color: theme.brass, marginBottom: '4px' }}>{initial}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: theme.fontDisplay, fontSize: '18px', fontWeight: '600', color: theme.ink, lineHeight: '1.2' }}>
                        {listing.business_name}
                      </div>
                      <div style={{ fontSize: '12px', color: theme.inkSoft, marginTop: '3px' }}>
                        {listing.industry || 'Industry not specified'}{listing.location ? ` · ${listing.location}` : ''}
                      </div>
                    </div>
                  </div>

                  {highlight && (
                    <div style={{
                      fontFamily: theme.fontDisplay, fontSize: '15px', fontWeight: '600', color: theme.brassDark,
                      marginBottom: '8px', lineHeight: '1.3',
                      overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                      WebkitLineClamp: 1, WebkitBoxOrient: 'vertical'
                    }}>{highlight.icon} {highlight.text}</div>
                  )}

                  {listing.description && (
                    <p style={{
                      fontFamily: theme.fontDisplay, fontStyle: 'italic', fontSize: '12.5px', color: theme.inkSoft,
                      marginBottom: '16px', lineHeight: '1.55',
                      overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                    }}>"{listing.description}"</p>
                  )}

                  {/* Wire row — small nodes strung on a brass thread, the same connective
                      language as the hero's business↔role diagram, shrunk to card scale */}
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto', paddingTop: '14px' }}>
                    {types.map((t, idx) => (
                      <span key={t} style={{ display: 'flex', alignItems: 'center' }}>
                        {idx > 0 && <span style={{ width: '10px', height: '1px', background: theme.line, flexShrink: 0 }} />}
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          fontSize: '10.5px', fontWeight: '600', color: theme.signal, whiteSpace: 'nowrap',
                          padding: '3px 8px 3px 6px', border: `1px solid ${theme.signalSoft}`, borderRadius: '20px'
                        }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: theme.signal, flexShrink: 0 }} />
                          {TYPE_ICON[t] || ''} {TYPE_LABEL[t] || t}
                        </span>
                      </span>
                    ))}
                  </div>
                </Link>
              )
            })}
            <style jsx>{`
              .listing-card {
                transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
              }
              .listing-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 24px -10px rgba(20, 33, 61, 0.22);
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
