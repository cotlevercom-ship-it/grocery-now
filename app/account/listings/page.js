'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'

const TYPE_LABEL = {
  co_founder: 'Co-founder', partner: 'Partner', investor: 'Investor',
  employee: 'Employee', supplier: 'Supplier', buyer: 'Buyer',
}

const SUB_STATUS_STYLE = {
  active: { bg: theme.signalSoft, color: theme.signal, label: 'Active' },
  pending: { bg: '#FBF3E7', color: theme.brassDark, label: 'Pending Review' },
  rejected: { bg: theme.dangerSoft, color: theme.danger, label: 'Rejected' },
  expired: { bg: theme.dangerSoft, color: theme.danger, label: 'Expired' },
  cancelled: { bg: theme.lineSoft, color: theme.inkSoft, label: 'Cancelled' },
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function MyListingsPage() {
  const router = useRouter()
  const [session, setSession] = useState(undefined)
  const [listings, setListings] = useState([])
  const [subsByListing, setSubsByListing] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const s = getSession()
      if (!s?.user?.id) {
        router.replace('/login?next=/account/listings')
        return
      }
      setSession(s)
      setLoading(true)
      try {
        const listingData = await supabaseFetch(`listings?select=*&owner_id=eq.${s.user.id}&order=created_at.desc`)
        setListings(listingData || [])

        const ids = (listingData || []).map(l => l.id)
        if (ids.length) {
          const subData = await supabaseFetch(`listing_subscriptions?select=*&listing_id=in.(${ids.join(',')})&order=created_at.desc`)
          const map = {}
          ;(subData || []).forEach(sub => {
            if (!map[sub.listing_id]) map[sub.listing_id] = sub // latest first, keep only most recent
          })
          setSubsByListing(map)
        }
      } catch (e) {
        console.error(e)
        setError('Could not load your listings')
      }
      setLoading(false)
    }
    load()
  }, [router])

  if (session === undefined || loading) {
    return (
      <div style={{ background: theme.paper, minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: theme.inkSoft, fontSize: '14px' }}>Loading…</div>
      </div>
    )
  }

  return (
    <div style={{ background: theme.paper, minHeight: '70vh' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: 'clamp(20px,4vw,48px) clamp(16px,3vw,24px)' }}>
        <Link href="/account" style={{ fontSize: '13px', color: theme.inkSoft, textDecoration: 'none', display: 'inline-block', marginBottom: '18px' }}>← Account</Link>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div>
            <div style={{
              fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
              color: theme.brassDark, marginBottom: '8px', fontWeight: '600'
            }}>My Listings</div>
            <h1 style={{ fontFamily: theme.fontDisplay, fontSize: 'clamp(22px,2.8vw,30px)', fontWeight: '600', color: theme.ink }}>
              Your Business Listings
            </h1>
          </div>
          <Link href="/listings/new" style={{
            display: 'inline-block', background: theme.brass, color: 'white', borderRadius: '8px',
            padding: '11px 18px', fontSize: '13.5px', fontWeight: '600', textDecoration: 'none', whiteSpace: 'nowrap'
          }}>+ New Listing</Link>
        </div>

        {error && (
          <div style={{ marginBottom: '16px', padding: '11px 14px', background: theme.dangerSoft, color: theme.danger, borderRadius: '8px', fontSize: '13.5px' }}>
            {error}
          </div>
        )}

        {listings.length === 0 ? (
          <div style={{
            background: theme.surface, borderRadius: '12px', border: `1px solid ${theme.line}`,
            padding: '48px 24px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '34px', marginBottom: '12px' }}>📋</div>
            <p style={{ fontSize: '14.5px', color: theme.inkSoft, marginBottom: '18px' }}>You haven't listed a business yet.</p>
            <Link href="/listings/new" style={{
              display: 'inline-block', background: theme.brass, color: 'white', borderRadius: '8px',
              padding: '11px 22px', fontSize: '14px', fontWeight: '600', textDecoration: 'none'
            }}>List Your Business</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {listings.map(listing => {
              const sub = subsByListing[listing.id]
              const subStyle = sub ? (SUB_STATUS_STYLE[sub.status] || SUB_STATUS_STYLE.cancelled) : null
              const needsPayment = !sub || sub.status === 'rejected' || sub.status === 'expired'
              const isExpired = sub?.status === 'expired' || (sub?.status === 'active' && sub.ends_at && new Date(sub.ends_at) < new Date())

              return (
                <div key={listing.id} style={{
                  background: theme.surface, borderRadius: '12px', border: `1px solid ${theme.line}`,
                  padding: 'clamp(18px,2.5vw,24px)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <div style={{ minWidth: 0 }}>
                      <Link href={`/listing/${listing.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{ fontFamily: theme.fontDisplay, fontSize: '18px', fontWeight: '600', color: theme.ink }}>
                          {listing.business_name}
                        </div>
                      </Link>
                      <div style={{ fontSize: '12.5px', color: theme.inkSoft, marginTop: '3px' }}>
                        {listing.industry || 'Industry not set'}{listing.location ? ` · ${listing.location}` : ''}
                      </div>
                    </div>
                    {subStyle && (
                      <div style={{
                        fontSize: '11px', fontWeight: '700', color: subStyle.color, background: subStyle.bg,
                        padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap'
                      }}>{isExpired ? 'Expired' : subStyle.label}</div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {(listing.listing_types || []).map(t => (
                      <span key={t} style={{
                        fontSize: '10.5px', fontWeight: '600', padding: '3px 9px', borderRadius: '5px',
                        background: theme.lineSoft, color: theme.inkSoft
                      }}>{TYPE_LABEL[t] || t}</span>
                    ))}
                  </div>

                  {sub && sub.status === 'active' && sub.ends_at && (
                    <div style={{ fontSize: '12.5px', color: theme.inkSoft, marginBottom: '14px' }}>
                      {isExpired ? 'Subscription ended' : 'Renews / expires'} {formatDate(sub.ends_at)} · {sub.plan === 'monthly' ? 'Monthly' : 'Yearly'} plan
                    </div>
                  )}
                  {sub && sub.status === 'pending' && (
                    <div style={{ fontSize: '12.5px', color: theme.inkSoft, marginBottom: '14px' }}>
                      Payment submitted, awaiting verification — usually within a few hours.
                    </div>
                  )}
                  {sub && sub.status === 'rejected' && (
                    <div style={{ fontSize: '12.5px', color: theme.danger, marginBottom: '14px' }}>
                      Your last payment was rejected. Please submit payment again.
                    </div>
                  )}
                  {sub && sub.status === 'expired' && (
                    <div style={{ fontSize: '12.5px', color: theme.danger, marginBottom: '14px' }}>
                      {sub.ends_at ? `Subscription ended ${formatDate(sub.ends_at)}. ` : ''}Renew to make this listing active again.
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Link href={`/listing/${listing.id}`} style={{
                      fontSize: '13px', fontWeight: '600', color: theme.ink, textDecoration: 'none',
                      border: `1px solid ${theme.line}`, borderRadius: '7px', padding: '8px 14px'
                    }}>View Listing</Link>
                    {(needsPayment || isExpired) && (
                      <Link href={`/payment/${listing.id}`} style={{
                        fontSize: '13px', fontWeight: '600', color: 'white', textDecoration: 'none',
                        background: theme.brass, borderRadius: '7px', padding: '8px 14px'
                      }}>{isExpired ? 'Renew' : 'Pay Now'}</Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
