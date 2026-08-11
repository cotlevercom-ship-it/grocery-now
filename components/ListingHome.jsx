'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'

const TYPES = [
  { value: 'all', label: 'All' },
  { value: 'co_founder', label: 'Co-founder' },
  { value: 'partner', label: 'Partner' },
  { value: 'investor', label: 'Investor' },
  { value: 'employee', label: 'Employee' },
  { value: 'supplier', label: 'Supplier' },
  { value: 'buyer', label: 'Buyer' },
]

const TYPE_LABEL = Object.fromEntries(TYPES.map(t => [t.value, t.label]))

function ConnectionDiagram() {
  const nodes = [
    { label: 'Co-founder', x: 40, y: 30 },
    { label: 'Investor', x: 260, y: 20 },
    { label: 'Partner', x: 20, y: 150 },
    { label: 'Supplier', x: 280, y: 150 },
    { label: 'Employee', x: 60, y: 260 },
    { label: 'Buyer', x: 250, y: 265 },
  ]
  const cx = 150, cy = 145
  return (
    <svg viewBox="0 0 320 320" width="100%" height="100%" style={{ maxWidth: '360px' }}>
      {nodes.map((n, i) => (
        <line key={i} x1={cx} y1={cy} x2={n.x} y2={n.y} stroke={theme.line} strokeWidth="1.5" />
      ))}
      <circle cx={cx} cy={cy} r="34" fill={theme.ink} />
      <text x={cx} y={cy - 3} textAnchor="middle" fill="#F6F4EF" fontSize="10" fontFamily={theme.fontMono} fontWeight="600">YOUR</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#F6F4EF" fontSize="10" fontFamily={theme.fontMono} fontWeight="600">BUSINESS</text>
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r="26" fill={theme.surface} stroke={theme.brass} strokeWidth="1.5" />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fill={theme.ink} fontSize="9" fontFamily={theme.fontBody} fontWeight="600">{n.label}</text>
        </g>
      ))}
    </svg>
  )
}

export default function ListingHome() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await supabaseFetch('listings?select=*&status=eq.active&order=created_at.desc')
        setListings(data || [])
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
        display: 'flex', gap: 'clamp(24px,4vw,60px)', alignItems: 'center', flexWrap: 'wrap',
      }}>
        <div style={{ flex: '1 1 400px', minWidth: '280px' }}>
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
            Co-founder, partner, investor, employee, supplier, or buyer — list your business
            once and let the right people find you. Every listing is reviewed before it goes live.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/listings/new" style={{
              display: 'inline-block', background: theme.brass, color: 'white',
              borderRadius: '8px', padding: '14px 26px', fontSize: '14.5px', fontWeight: '600', textDecoration: 'none'
            }}>List Your Business</Link>
            <Link href="/about" style={{
              display: 'inline-block', background: 'transparent', color: theme.ink, border: `1px solid ${theme.line}`,
              borderRadius: '8px', padding: '14px 26px', fontSize: '14.5px', fontWeight: '600', textDecoration: 'none'
            }}>How It Works</Link>
          </div>
        </div>

        <div style={{ flex: '0 1 320px', display: 'flex', justifyContent: 'center' }}>
          <ConnectionDiagram />
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
        {/* Type filter */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {TYPES.map(t => (
            <button key={t.value} onClick={() => setFilterType(t.value)} style={{
              padding: '8px 16px', borderRadius: '20px', border: `1px solid ${filterType === t.value ? theme.ink : theme.line}`,
              fontSize: '13px', fontWeight: '600', fontFamily: theme.fontBody,
              background: filterType === t.value ? theme.ink : theme.surface,
              color: filterType === t.value ? theme.paper : theme.inkSoft,
            }}>{t.label}</button>
          ))}
        </div>

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
            {filtered.map((listing, i) => (
              <Link key={listing.id} href={`/listing/${listing.id}`} style={{
                background: theme.surface, borderRadius: '10px', border: `1px solid ${theme.line}`,
                padding: '20px', display: 'block', textDecoration: 'none'
              }}>
                <div style={{
                  fontFamily: theme.fontMono, fontSize: '11px', color: theme.inkSoft, marginBottom: '10px'
                }}>{String(i + 1).padStart(2, '0')}</div>

                <div style={{ fontFamily: theme.fontDisplay, fontSize: '17px', fontWeight: '600', color: theme.ink, marginBottom: '4px' }}>
                  {listing.business_name}
                </div>
                <div style={{ fontSize: '12.5px', color: theme.inkSoft, marginBottom: '12px' }}>
                  {listing.industry || 'Industry not specified'}{listing.location ? ` · ${listing.location}` : ''}
                </div>
                <p style={{
                  fontSize: '12.5px', color: theme.inkSoft, marginBottom: '14px', lineHeight: '1.5',
                  overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '32px'
                }}>{listing.description || ''}</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {(listing.listing_types || []).map(t => (
                    <span key={t} style={{
                      fontSize: '10.5px', fontWeight: '600', padding: '3px 9px', borderRadius: '5px',
                      background: theme.signalSoft, color: theme.signal
                    }}>{TYPE_LABEL[t] || t}</span>
                  ))}
                </div>
              </Link>
            ))}
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
