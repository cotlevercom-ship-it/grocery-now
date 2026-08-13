'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'

export default function MemberDetailPage() {
  const { userId } = useParams()
  const [member, setMember] = useState(null)
  const [ownedListings, setOwnedListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await supabaseFetch(`member_profiles?select=*&user_id=eq.${userId}&is_discoverable=eq.true`)
        setMember(data?.[0] || null)

        // Business listing(s) owned by this user — used both for the "View Business
        // Profile" link on a full profile, and as the fallback view when there's no
        // co-founder profile at all (most owners will only ever have this).
        try {
          const listings = await supabaseFetch(`listings?select=id,business_name,owner_name,industry,location&owner_id=eq.${userId}&status=eq.active`)
          setOwnedListings(listings || [])
        } catch (e) { /* non-fatal */ }
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    if (userId) load()
  }, [userId])

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: theme.inkSoft }}>Loading…</div>

  // No co-founder profile — fall back to a lightweight view built from their listing(s),
  // so clicking an owner's name always lands somewhere instead of a dead end.
  if (!member) {
    if (ownedListings.length === 0) {
      return (
        <div style={{ padding: '60px', textAlign: 'center', color: theme.inkSoft }}>
          Profile not found. <Link href="/" style={{ color: theme.brassDark, fontWeight: '600' }}>Back to listings</Link>
        </div>
      )
    }
    const ownerName = ownedListings[0].owner_name || '?'
    const initial = ownerName.trim().charAt(0).toUpperCase()
    return (
      <div style={{ background: theme.paper, minHeight: '70vh' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'clamp(20px,4vw,48px) clamp(16px,3vw,24px)' }}>
          <Link href="/" style={{ fontSize: '13px', color: theme.inkSoft, textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>← All listings</Link>
          <div style={{ background: theme.surface, borderRadius: '12px', border: `1px solid ${theme.line}`, padding: 'clamp(24px,3.5vw,36px)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '22px' }}>
              <div style={{
                width: '84px', height: '84px', borderRadius: '50%', flexShrink: 0,
                background: theme.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px'
              }}>
                <span style={{ fontFamily: theme.fontDisplay, fontSize: '30px', fontWeight: '600', color: theme.paper }}>{initial}</span>
              </div>
              <h1 style={{ fontFamily: theme.fontDisplay, fontSize: 'clamp(20px,2.6vw,26px)', fontWeight: '600', color: theme.ink }}>
                {ownerName}
              </h1>
              <p style={{ fontSize: '13px', color: theme.inkSoft, marginTop: '6px' }}>Hasn't set up a co-founder profile yet</p>
            </div>
            <div style={{
              fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
              color: theme.brassDark, marginBottom: '10px', fontWeight: '600'
            }}>Business{ownedListings.length > 1 ? 'es' : ''}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {ownedListings.map(l => (
                <Link key={l.id} href={`/listing/${l.id}`} style={{
                  display: 'block', border: `1px solid ${theme.line}`, borderRadius: '8px', padding: '12px 14px', textDecoration: 'none'
                }}>
                  <div style={{ fontFamily: theme.fontDisplay, fontSize: '15px', fontWeight: '600', color: theme.ink }}>{l.business_name}</div>
                  <div style={{ fontSize: '12px', color: theme.inkSoft, marginTop: '2px' }}>
                    {l.industry || 'Industry not specified'}{l.location ? ` · ${l.location}` : ''}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const businessListingId = ownedListings[0]?.id || null
  const initial = (member.display_name || '?').trim().charAt(0).toUpperCase()

  return (
    <div style={{ background: theme.paper, minHeight: '70vh' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'clamp(20px,4vw,48px) clamp(16px,3vw,24px)' }}>
        <Link href="/cofounder" style={{ fontSize: '13px', color: theme.inkSoft, textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>← Browse co-founders</Link>

        <div style={{ background: theme.surface, borderRadius: '12px', border: `1px solid ${theme.line}`, padding: 'clamp(24px,3.5vw,36px)' }}>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              width: '120px', height: '120px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
              background: theme.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px'
            }}>
              {member.photo_url ? (
                <img src={member.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontFamily: theme.fontDisplay, fontSize: '42px', fontWeight: '600', color: theme.paper }}>{initial}</span>
              )}
            </div>
            <h1 style={{ fontFamily: theme.fontDisplay, fontSize: 'clamp(22px,2.8vw,28px)', fontWeight: '600', color: theme.ink }}>
              {member.display_name}
            </h1>
            <div style={{ fontSize: '14px', color: theme.inkSoft, marginTop: '4px' }}>
              {member.role_title || 'Role not specified'}{member.location ? ` · ${member.location}` : ''}
            </div>
            {businessListingId && (
              <Link href={`/listing/${businessListingId}`} style={{
                display: 'inline-block', marginTop: '14px', fontSize: '13px', fontWeight: '600', color: theme.brassDark,
                textDecoration: 'none', border: `1px solid ${theme.line}`, borderRadius: '8px', padding: '8px 16px'
              }}>View Business Profile →</Link>
            )}
          </div>

          {(member.looking_for || member.commitment) && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '22px' }}>
              {member.looking_for && (
                <span style={{
                  fontSize: '11.5px', fontWeight: '600', padding: '5px 11px', borderRadius: '20px',
                  background: theme.signalSoft, color: theme.signal
                }}>Looking for: {member.looking_for}</span>
              )}
              {member.commitment && (
                <span style={{
                  fontSize: '11.5px', fontWeight: '600', padding: '5px 11px', borderRadius: '20px',
                  background: theme.paper, border: `1px solid ${theme.line}`, color: theme.inkSoft
                }}>{member.commitment}</span>
              )}
            </div>
          )}

          {member.bio && (
            <p style={{ fontSize: '15px', color: theme.ink, lineHeight: '1.7', marginBottom: '22px' }}>
              {member.bio}
            </p>
          )}

          {member.experience && (
            <div style={{ marginBottom: '22px' }}>
              <div style={{
                fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
                color: theme.brassDark, marginBottom: '8px', fontWeight: '600'
              }}>Experience</div>
              <p style={{ fontSize: '14px', color: theme.ink, lineHeight: '1.6' }}>{member.experience}</p>
            </div>
          )}

          {(member.skills || []).length > 0 && (
            <div style={{ marginBottom: '22px' }}>
              <div style={{
                fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
                color: theme.brassDark, marginBottom: '10px', fontWeight: '600'
              }}>Skills</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {member.skills.map(s => (
                  <span key={s} style={{
                    fontSize: '11.5px', fontWeight: '600', padding: '4px 10px', borderRadius: '5px',
                    background: theme.paper, border: `1px solid ${theme.line}`, color: theme.inkSoft
                  }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {member.contact_email && (
            <div style={{ borderTop: `1px solid ${theme.line}`, paddingTop: '20px' }}>
              <div style={{
                fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
                color: theme.brassDark, marginBottom: '10px', fontWeight: '600'
              }}>Contact</div>
              <a href={`mailto:${member.contact_email}`} style={{ fontSize: '14.5px', color: theme.ink, fontWeight: '600', textDecoration: 'none' }}>
                {member.contact_email}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
