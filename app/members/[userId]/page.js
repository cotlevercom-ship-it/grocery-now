'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabaseFetch, getSession } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import { sc } from '@/lib/memberTheme'
import VerifiedBadge from '@/components/VerifiedBadge'
import AppSidebar from '@/components/AppSidebar'
import AppBottomNav from '@/components/AppBottomNav'
import { IconUser, IconMail, IconPin, IconGlobe } from '@/components/ResumeIcons'

const accent = '#2563EB'

function SectionHeading({ icon, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', color: '#111827', fontSize: '13px', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        <span style={{ color: accent, display: 'flex' }}>{icon}</span>
        {children}
      </div>
      <div style={{ height: '1px', background: '#E5E7EB', marginTop: '8px' }} />
    </div>
  )
}

export default function MemberProfileViewPage() {
  const { userId } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [myUserId, setMyUserId] = useState(null)

  useEffect(() => {
    const session = getSession()
    setMyUserId(session?.user?.id || null)

    async function load() {
      setLoading(true)
      try {
        const rows = await supabaseFetch(`member_profiles?select=*&user_id=eq.${userId}`)
        setProfile(rows?.[0] || null)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    if (userId) load()
  }, [userId])

  const initial = (profile?.display_name || '?').trim().charAt(0).toUpperCase()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: sc.bg }}>
      <AppSidebar active="discover" />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: 'clamp(16px,3vw,32px)' }}>
          <Link href="/feed" style={{ fontSize: '13px', color: sc.textSoft, textDecoration: 'none', display: 'inline-block', marginBottom: '16px' }}>
            ← Back to Feed
          </Link>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: sc.textSoft, fontSize: '14px' }}>Loading…</div>
          ) : !profile ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: sc.textSoft, fontSize: '14px' }}>
              Profile not found or not currently visible.
            </div>
          ) : (
            <div className="resume-sheet" style={{
              display: 'flex', background: '#FFFFFF', borderRadius: '14px',
              boxShadow: '0 1px 3px rgba(16,24,40,0.06), 0 8px 28px rgba(16,24,40,0.06)', overflow: 'hidden',
            }}>
              {/* Left column */}
              <div className="resume-side" style={{ width: '260px', flexShrink: 0, background: '#F6F7F9', padding: '32px 24px', borderRight: '1px solid #ECEDF0' }}>
                <div style={{
                  width: '104px', height: '104px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto',
                  background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {profile.photo_url ? (
                    <img src={profile.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontFamily: theme.fontDisplay, fontSize: '38px', fontWeight: '600', color: '#FFFFFF' }}>{initial}</span>
                  )}
                </div>
                <div style={{ textAlign: 'center', marginTop: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '19px', fontWeight: '700', color: '#111827' }}>
                    {profile.display_name}
                    {profile.verified && <VerifiedBadge />}
                  </div>
                </div>

                <div style={{ marginTop: '26px', display: 'flex', flexDirection: 'column', gap: '11px' }}>
                  {profile.contact_email && (
                    <a href={`mailto:${profile.contact_email}`} style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '12.5px', color: '#374151', textDecoration: 'none', wordBreak: 'break-all' }}>
                      <IconMail color="#6B7280" /> {profile.contact_email}
                    </a>
                  )}
                  {profile.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '12.5px', color: '#374151' }}>
                      <IconPin color="#6B7280" /> {profile.location}
                    </div>
                  )}
                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '12.5px', color: accent, textDecoration: 'none', wordBreak: 'break-all' }}>
                      <IconGlobe color={accent} /> LinkedIn
                    </a>
                  )}
                </div>
              </div>

              {/* Right column */}
              <div style={{ flex: 1, minWidth: 0, padding: '32px 30px' }}>
                {profile.bio && (
                  <div style={{ marginBottom: '26px' }}>
                    <SectionHeading icon={<IconUser />}>About Me</SectionHeading>
                    <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.7, margin: 0 }}>{profile.bio}</p>
                  </div>
                )}

                {myUserId !== profile.user_id && (profile.contact_email || profile.linkedin_url) && (
                  <div style={{ marginTop: '28px', display: 'flex', gap: '10px' }}>
                    {profile.contact_email && (
                      <a
                        href={`mailto:${profile.contact_email}`}
                        style={{
                          flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          background: accent, color: '#FFFFFF', fontFamily: theme.fontBody,
                          borderRadius: '10px', padding: '11px 12px', fontSize: '13px', fontWeight: '700',
                          textDecoration: 'none',
                        }}
                      >📧 Email</a>
                    )}
                    {profile.linkedin_url && (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          background: 'transparent', color: '#111827', fontFamily: theme.fontBody,
                          border: '1px solid #E5E7EB', borderRadius: '10px', padding: '11px 12px', fontSize: '13px', fontWeight: '700',
                          textDecoration: 'none',
                        }}
                      >🔗 LinkedIn</a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AppBottomNav active="discover" />

      <style jsx>{`
        @media (max-width: 700px) {
          .resume-sheet { flex-direction: column; border-radius: 0; }
          .resume-side { width: 100% !important; border-right: none !important; border-bottom: 1px solid #ECEDF0; }
        }
      `}</style>
      <style jsx global>{`
        @media (max-width: 860px) {
          body { padding-bottom: 62px; }
        }
      `}</style>
    </div>
  )
}
