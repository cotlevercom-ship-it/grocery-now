'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'

export default function MembersBrowsePage() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await supabaseFetch('member_profiles?select=*&is_discoverable=eq.true&order=created_at.desc')
        setMembers(data || [])
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div style={{ background: theme.paper, minHeight: '70vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,3vw,56px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '28px' }}>
          <div>
            <div style={{
              fontFamily: theme.fontMono, fontSize: '11.5px', letterSpacing: '0.1em', textTransform: 'uppercase',
              color: theme.brassDark, marginBottom: '10px', fontWeight: '600'
            }}>Find a Co-founder</div>
            <h1 style={{ fontFamily: theme.fontDisplay, fontSize: 'clamp(24px,3vw,36px)', fontWeight: '600', color: theme.ink }}>
              People looking for a co-founder
            </h1>
          </div>
          <Link href="/members/new" style={{
            display: 'inline-block', background: theme.brass, color: 'white',
            borderRadius: '8px', padding: '12px 22px', fontSize: '14px', fontWeight: '600', textDecoration: 'none', whiteSpace: 'nowrap'
          }}>Create Your Profile</Link>
        </div>

        {loading ? (
          <div style={{ color: theme.inkSoft, fontSize: '14px', textAlign: 'center', padding: '60px' }}>Loading…</div>
        ) : members.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px', color: theme.inkSoft,
            background: theme.surface, borderRadius: '10px', border: `1px solid ${theme.line}`
          }}>
            <p style={{ fontFamily: theme.fontDisplay, fontSize: '18px', color: theme.ink, marginBottom: '8px' }}>No profiles yet</p>
            <p style={{ fontSize: '13.5px' }}>Be the first — <Link href="/members/new" style={{ color: theme.brassDark, fontWeight: '600' }}>create your profile</Link>.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(240px,25vw,300px),1fr))',
            gap: 'clamp(14px, 1.6vw, 22px)'
          }}>
            {members.map(m => {
              const initial = (m.display_name || '?').trim().charAt(0).toUpperCase()
              return (
                <div key={m.user_id} style={{
                  background: theme.surface, borderRadius: '10px', border: `1px solid ${theme.line}`,
                  padding: '20px', display: 'flex', flexDirection: 'column', minHeight: '320px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '14px' }}>
                    <div style={{
                      width: '92px', height: '92px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                      background: theme.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px'
                    }}>
                      {m.photo_url ? (
                        <img src={m.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontFamily: theme.fontDisplay, fontSize: '32px', fontWeight: '600', color: theme.paper }}>{initial}</span>
                      )}
                    </div>
                    <div style={{ fontFamily: theme.fontDisplay, fontSize: '17px', fontWeight: '600', color: theme.ink, lineHeight: '1.25' }}>
                      {m.display_name}
                    </div>
                    <div style={{ fontSize: '12.5px', color: theme.inkSoft, marginTop: '3px' }}>
                      {m.role_title || 'Role not specified'}{m.location ? ` · ${m.location}` : ''}
                    </div>
                  </div>

                  <div style={{
                    fontSize: '12.5px', fontWeight: '600', color: theme.ink, marginBottom: '10px', minHeight: '18px'
                  }}>
                    {m.looking_for && <span>Looking for: {m.looking_for}</span>}
                  </div>

                  <p style={{
                    fontSize: '12.5px', color: theme.inkSoft, marginBottom: '14px', lineHeight: '1.5',
                    overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', flex: 1
                  }}>{m.bio || ''}</p>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: m.contact_email ? '14px' : '0' }}>
                    {(m.skills || []).slice(0, 4).map(s => (
                      <span key={s} style={{
                        fontSize: '10.5px', fontWeight: '600', padding: '3px 9px', borderRadius: '5px',
                        background: theme.signalSoft, color: theme.signal
                      }}>{s}</span>
                    ))}
                  </div>

                  {m.contact_email && (
                    <a href={`mailto:${m.contact_email}`} style={{
                      fontSize: '13px', fontWeight: '600', color: theme.brassDark, textDecoration: 'none'
                    }}>Contact</a>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
