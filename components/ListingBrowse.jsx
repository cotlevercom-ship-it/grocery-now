'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import { fetchListingTypes } from '@/lib/listingTypes'

// The single most useful field to surface on the card for each listing type,
// so a browsing visitor sees the key number/detail without opening the listing.
const HIGHLIGHT_FIELD = {
  co_founder: { key: 'skills_needed', icon: '🧩' },
  partner: { key: 'partnership_type', icon: '🔗' },
}

function highlightFor(listing) {
  for (const type of listing.listing_types || []) {
    const cfg = HIGHLIGHT_FIELD[type]
    const val = listing.extra_fields?.[type]?.[cfg?.key]
    if (val) {
      return { icon: cfg.icon, text: val }
    }
  }
  return null
}

function verifiedCheckmark(size = 15) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="currentColor" />
      <path d="M6 10.2l2.4 2.4L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ListingBrowse({ embedded = false }) {
  const searchParams = useSearchParams()
  const [listings, setListings] = useState([])
  const [verifiedIds, setVerifiedIds] = useState(new Set())
  const [ownerNames, setOwnerNames] = useState({})
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState(searchParams.get('type') || 'all')
  const [typeOptions, setTypeOptions] = useState([]) // all types (active + inactive) — for label/icon lookups

  // Keep filter in sync with ?type= — e.g. a type-filtered link (partner,
  // investor, etc.) navigating back to "/listings" while this component is mounted.
  useEffect(() => {
    setFilterType(searchParams.get('type') || 'all')
  }, [searchParams])
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

        // Verified = has a currently active (paid + approved, not expired) subscription —
        // same rule as the listing detail page's verified badge.
        const ids = (data || []).map(l => l.id)
        if (ids.length) {
          try {
            const subs = await supabaseFetch(`listing_subscriptions?select=listing_id,ends_at&status=eq.active&listing_id=in.(${ids.join(',')})`)
            const now = new Date()
            const verified = new Set((subs || []).filter(s => !s.ends_at || new Date(s.ends_at) > now).map(s => s.listing_id))
            setVerifiedIds(verified)
          } catch (e) { /* non-fatal */ }
        }

        // Owner display names — shown as "Business Name by Owner" on each card.
        const ownerIds = [...new Set((data || []).map(l => l.owner_id).filter(Boolean))]
        if (ownerIds.length) {
          try {
            const owners = await supabaseFetch(`member_profiles?select=user_id,display_name&user_id=in.(${ownerIds.join(',')})`)
            const map = {}
            ;(owners || []).forEach(o => { map[o.user_id] = o.display_name })
            setOwnerNames(map)
          } catch (e) { /* non-fatal */ }
        }
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
    <div style={{ background: theme.paper, minHeight: '70vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,3vw,56px)' }}>
        {!embedded && (
          <>
            <Link href="/" style={{ fontSize: '13px', color: theme.inkSoft, textDecoration: 'none', display: 'inline-block', marginBottom: '10px' }}>← Home</Link>
            <h1 style={{
              fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(24px,3vw,34px)',
              color: theme.ink, marginBottom: '22px', letterSpacing: '-0.01em'
            }}>
              Listed Businesses
            </h1>
          </>
        )}

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
              const initial = (listing.business_name || '?').trim().charAt(0).toUpperCase()
              const types = listing.listing_types || []
              const isVerified = verifiedIds.has(listing.id)
              return (
                <div key={listing.id} className="listing-card" style={{
                  background: theme.surface, border: `1px solid ${theme.line}`, borderRadius: '10px',
                  display: 'flex', flexDirection: 'column',
                  padding: '20px 20px 16px', position: 'relative'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '13px', marginBottom: '14px' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '8px',
                        background: theme.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <span style={{ fontFamily: theme.fontDisplay, fontSize: '16px', fontWeight: '600', color: theme.brass }}>{initial}</span>
                      </div>
                      {isVerified && (
                        <div style={{
                          position: 'absolute', bottom: '-3px', right: '-3px', color: theme.signal,
                          background: theme.surface, borderRadius: '50%', lineHeight: 0
                        }}>{verifiedCheckmark(15)}</div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: theme.fontDisplay, fontSize: '18px', fontWeight: '600', color: theme.ink, lineHeight: '1.2' }}>
                        {listing.business_name}
                      </div>
                      <div style={{ fontSize: '12px', color: theme.inkSoft, marginTop: '3px' }}>
                        {listing.industry || 'Industry not specified'}{listing.location ? ` · ${listing.location}` : ''}
                      </div>
                      {(listing.owner_name || ownerNames[listing.owner_id]) && (
                        <Link
                          href={`/members/${listing.owner_id}`}
                          style={{ display: 'inline-block', fontSize: '11.5px', color: theme.brassDark, fontWeight: '600', marginTop: '3px', textDecoration: 'none' }}
                        >by {listing.owner_name || ownerNames[listing.owner_id]}</Link>
                      )}
                    </div>
                  </div>

                  {highlight && (
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{
                        fontFamily: theme.fontDisplay, fontSize: '15px', fontWeight: '600', color: theme.brassDark,
                        lineHeight: '1.3',
                        overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                        WebkitLineClamp: 1, WebkitBoxOrient: 'vertical'
                      }}>{highlight.icon} {highlight.text}</div>
                    </div>
                  )}

                  {listing.description && (
                    <p style={{
                      fontFamily: theme.fontDisplay, fontStyle: 'italic', fontSize: '12.5px', color: theme.inkSoft,
                      marginBottom: '16px', lineHeight: '1.55',
                      overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                    }}>"{listing.description}"</p>
                  )}

                  {/* Purpose row — labeled plainly so it's unambiguous what this business wants */}
                  <div style={{ marginTop: 'auto', paddingTop: '14px' }}>
                    <div style={{
                      fontSize: '9.5px', fontWeight: '700', letterSpacing: '0.07em', textTransform: 'uppercase',
                      color: theme.inkSoft, marginBottom: '6px'
                    }}>Looking for</div>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                      {types.map(t => (
                        <span key={t} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          fontSize: '10.5px', fontWeight: '600', color: theme.signal, whiteSpace: 'nowrap',
                          padding: '3px 9px', background: theme.signalSoft, borderRadius: '20px'
                        }}>
                          {TYPE_ICON[t] || ''} {TYPE_LABEL[t] || t}
                        </span>
                      ))}
                    </div>
                    <Link href={`/listing/${listing.id}`} style={{
                      display: 'block', textAlign: 'center', fontSize: '12.5px', fontWeight: '600', color: theme.ink,
                      textDecoration: 'none', border: `1px solid ${theme.line}`, borderRadius: '7px', padding: '9px'
                    }}>View Business →</Link>
                  </div>
                </div>
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
    </div>
  )
}
