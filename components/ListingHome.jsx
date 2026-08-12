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
          <div style={{
            fontFamily: theme.fontMono, fontSize: '11.5px', letterSpacing: '0.1em', textTransform: 'uppercase',
            color: theme.brassDark, marginBottom: '16px', fontWeight: '600'
          }}>Business Directory · Bangladesh</div>

          <h1 style={{
            fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(32px,4.2vw,52px)',
            lineHeight: '1.08', color: theme.ink, marginBottom: '20px', letterSpacing: '-0.01em'
          }}>
            Find the right people for your business.
          </h1>

          <p style={{
            fontSize: 'clamp(14.5px,1.3vw,17px)', lineHeight: '1.6', color: theme.inkSoft,
            maxWidth: '480px', marginBottom: '28px'
          }}>
            {activeTypeOptions.length > 0
              ? `${activeTypeOptions.map(t => t.label).join(' or ')} — list your business once and let the right people find you.`
              : 'List your business once and let the right people find you.'} Every listing is reviewed before it goes live.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/listings/new" style={{
              display: 'inline-block', background: theme.brass, color: 'white',
              borderRadius: '8px', padding: '14px 26px', fontSize: '14.5px', fontWeight: '600', textDecoration: 'none'
            }}>List Your Business</Link>
            <Link href="/how-it-works" style={{
              display: 'inline-block', background: 'transparent', color: theme.ink, border: `1px solid ${theme.line}`,
              borderRadius: '8px', padding: '14px 26px', fontSize: '14.5px', fontWeight: '600', textDecoration: 'none'
            }}>How It Works</Link>
          </div>
        </div>
      </div>

      {/* Trust bar */}
      <div style={{ borderTop: `1px solid ${theme.line}`, borderBottom: `1px solid ${theme.line}` }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '18px clamp(16px,3vw,56px)',
          display: 'flex', gap: 'clamp(20px,4vw,48px)', flexWrap: 'wrap', fontSize: '13px', color: theme.inkSoft
        }}>
          <span>✓ Listings reviewed before going live</span>
          <span>✓ Contact details go straight to you</span>
          <span>✓ Simple monthly or yearly listing fee</span>
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
              return (
                <Link key={listing.id} href={`/listing/${listing.id}`} style={{
                  background: theme.surface, borderRadius: '10px', border: `1px solid ${theme.line}`,
                  padding: '20px', display: 'block', textDecoration: 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontFamily: theme.fontMono, fontSize: '11px', color: theme.inkSoft }}>{String(i + 1).padStart(2, '0')}</div>
                    {freshness && (
                      <div style={{ fontSize: '10.5px', color: theme.inkSoft }}>{freshness}</div>
                    )}
                  </div>

                  <div style={{ fontFamily: theme.fontDisplay, fontSize: '17px', fontWeight: '600', color: theme.ink, marginBottom: '4px' }}>
                    {listing.business_name}
                  </div>
                  <div style={{ fontSize: '12.5px', color: theme.inkSoft, marginBottom: '10px' }}>
                    {listing.industry || 'Industry not specified'}{listing.location ? ` · ${listing.location}` : ''}
                  </div>

                  {highlight && (
                    <div style={{
                      fontSize: '12.5px', fontWeight: '600', color: theme.ink, marginBottom: '10px',
                      display: 'flex', alignItems: 'flex-start', gap: '6px', lineHeight: '1.4'
                    }}>
                      <span>{highlight.icon}</span>
                      <span style={{
                        overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                        WebkitLineClamp: 1, WebkitBoxOrient: 'vertical'
                      }}>{highlight.text}</span>
                    </div>
                  )}

                  <p style={{
                    fontSize: '12.5px', color: theme.inkSoft, marginBottom: '14px', lineHeight: '1.5',
                    overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '32px'
                  }}>{listing.description || ''}</p>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {(listing.listing_types || []).map(t => (
                      <span key={t} style={{
                        fontSize: '10.5px', fontWeight: '600', padding: '3px 9px', borderRadius: '5px',
                        background: theme.signalSoft, color: theme.signal, display: 'inline-flex', alignItems: 'center', gap: '4px'
                      }}><span>{TYPE_ICON[t] || ''}</span>{TYPE_LABEL[t] || t}</span>
                    ))}
                  </div>
                </Link>
              )
            })}
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
