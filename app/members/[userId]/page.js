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
        <div style={{ maxWidth: '560px', margin: '0 auto', padding: 'clamp(20px,3vw,40px) clamp(16px,3vw,24px)' }}>
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
            <div style={{ background: sc.cardBg, borderRadius: '16px', boxShadow: sc.shadow, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '76px', height: '76px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                  background: theme.brass, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {profile.photo_url ? (
                    <img src={profile.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontFamily: theme.fontDisplay, fontSize: '28px', fontWeight: '600', color: '#FFFFFF' }}>{initial}</span>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: theme.fontDisplay, fontSize: '20px', fontWeight: '600', color: sc.text }}>
                    {profile.display_name}
                    {profile.verified && <VerifiedBadge />}
                  </div>
                  <div style={{ fontSize: '13.5px', color: sc.textSoft, marginTop: '2px' }}>
                    {profile.role_title || 'Role not specified'}{profile.location ? ` · ${profile.location}` : ''}
                  </div>
                </div>
              </div>

              {profile.bio && (
                <p style={{ fontSize: '14px', color: sc.text, lineHeight: '1.6', marginTop: '18px' }}>{profile.bio}</p>
              )}

              {profile.experience && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: '700', color: sc.textSoft, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '4px' }}>Experience</div>
                  <div style={{ fontSize: '14px', color: sc.text }}>{profile.experience}</div>
                </div>
              )}

              {profile.experience_entries && profile.experience_entries.length > 0 && (
                <div style={{ marginTop: '18px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: '700', color: sc.textSoft, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '8px' }}>Work Experience</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {profile.experience_entries.map((job, i) => (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'baseline' }}>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: sc.text }}>{job.title}</div>
                          {job.dates && <div style={{ fontSize: '12px', color: sc.textSoft, flexShrink: 0 }}>{job.dates}</div>}
                        </div>
                        {job.company && <div style={{ fontSize: '13px', color: theme.brass, marginTop: '1px' }}>{job.company}</div>}
                        {Array.isArray(job.bullets) && job.bullets.length > 0 && (
                          <ul style={{ margin: '6px 0 0', paddingLeft: '18px', fontSize: '13.5px', color: sc.text, lineHeight: 1.6 }}>
                            {job.bullets.map((b, bi) => <li key={bi}>{b}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile.education_entries && profile.education_entries.length > 0 && (
                <div style={{ marginTop: '18px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: '700', color: sc.textSoft, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '8px' }}>Education</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {profile.education_entries.map((ed, i) => (
                      <div key={i}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: sc.text }}>{ed.degree}</div>
                        <div style={{ fontSize: '13px', color: sc.textSoft, marginTop: '1px' }}>
                          {[ed.institution, ed.years].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile.projects && profile.projects.length > 0 && (
                <div style={{ marginTop: '18px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: '700', color: sc.textSoft, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '8px' }}>Projects</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {profile.projects.map((p, i) => (
                      <div key={i}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: sc.text }}>{p.title}</div>
                        {p.description && <div style={{ fontSize: '13.5px', color: sc.text, marginTop: '2px', lineHeight: 1.5 }}>{p.description}</div>}
                        {p.tech && <div style={{ fontSize: '12.5px', color: theme.brass, marginTop: '3px' }}>{p.tech}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile.achievements && profile.achievements.length > 0 && (
                <div style={{ marginTop: '18px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: '700', color: sc.textSoft, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '6px' }}>Achievements</div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13.5px', color: sc.text, lineHeight: 1.6 }}>
                    {profile.achievements.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              )}

              {profile.skills && profile.skills.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: '700', color: sc.textSoft, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '6px' }}>Skills</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {profile.skills.map(s => (
                      <span key={s} style={{
                        fontSize: '11.5px', fontWeight: '600', color: sc.chipText, background: sc.chipBg,
                        borderRadius: '999px', padding: '5px 10px',
                      }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {profile.interests && profile.interests.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: '700', color: sc.textSoft, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '6px' }}>Interests</div>
                  <div style={{ fontSize: '14px', color: sc.text }}>{profile.interests.join(', ')}</div>
                </div>
              )}

              {profile.languages && profile.languages.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: '700', color: sc.textSoft, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '6px' }}>Languages</div>
                  <div style={{ fontSize: '14px', color: sc.text }}>{profile.languages.join(', ')}</div>
                </div>
              )}

              {myUserId !== profile.user_id && (profile.contact_email || profile.linkedin_url || profile.github_url) && (
                <div style={{ marginTop: '22px', display: 'flex', gap: '10px' }}>
                  {profile.contact_email && (
                    <a
                      href={`mailto:${profile.contact_email}`}
                      style={{
                        flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        background: theme.brass, color: '#FFFFFF', fontFamily: theme.fontBody,
                        borderRadius: '999px', padding: '11px 12px', fontSize: '13px', fontWeight: '700',
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
                        background: 'transparent', color: sc.text, fontFamily: theme.fontBody,
                        border: `1px solid ${sc.line}`, borderRadius: '999px', padding: '11px 12px', fontSize: '13px', fontWeight: '700',
                        textDecoration: 'none',
                      }}
                    >🔗 LinkedIn</a>
                  )}
                  {profile.github_url && (
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        background: 'transparent', color: sc.text, fontFamily: theme.fontBody,
                        border: `1px solid ${sc.line}`, borderRadius: '999px', padding: '11px 12px', fontSize: '13px', fontWeight: '700',
                        textDecoration: 'none',
                      }}
                    >💻 GitHub</a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AppBottomNav active="discover" />

      <style jsx global>{`
        @media (max-width: 860px) {
          body { padding-bottom: 62px; }
        }
      `}</style>
    </div>
  )
}
