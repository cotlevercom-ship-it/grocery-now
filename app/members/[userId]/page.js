'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabaseFetch, getSession } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import VerifiedBadge from '@/components/VerifiedBadge'

function ConnectSection({ member }) {
  const session = getSession()
  const myUserId = session?.user?.id || null
  const isSelf = myUserId && myUserId === member.user_id

  if (isSelf) return null
  if (!member.contact_email && !member.linkedin_url) return null

  return (
    <div style={{ borderTop: `1px solid ${theme.line}`, marginTop: '22px', paddingTop: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {member.contact_email && (
        <a
          href={`mailto:${member.contact_email}`}
          style={{
            flex: 1, minWidth: '140px', textAlign: 'center', background: theme.signal, color: '#fff',
            border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14.5px', fontWeight: '700',
            textDecoration: 'none', display: 'block',
          }}
        >📧 Email</a>
      )}
      {member.linkedin_url && (
        <a
          href={member.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1, minWidth: '140px', textAlign: 'center', background: theme.paper, color: theme.brassDark,
            border: `1.5px solid ${theme.brass}`, borderRadius: '8px', padding: '12px', fontSize: '14.5px', fontWeight: '700',
            textDecoration: 'none', display: 'block',
          }}
        >🔗 LinkedIn</a>
      )}
    </div>
  )
}

const TABS = [
  { id: 'intro', label: 'Intro', icon: '📝' },
  { id: 'personal', label: 'Personal Details', icon: '📋' },
  { id: 'skills', label: 'Skills', icon: '🤝' },
  { id: 'looking', label: 'Looking For', icon: '🎯' },
  { id: 'contact', label: 'Contact Info', icon: '📧' },
]

function SectionHeading({ children, isOwnProfile }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
      <h2 style={{ fontSize: '17px', fontWeight: '700', color: theme.ink, margin: 0 }}>{children}</h2>
      {isOwnProfile && (
        <Link href="/members/new" aria-label={`Edit ${children}`} style={{
          width: '32px', height: '32px', borderRadius: '50%', background: theme.paper,
          border: `1px solid ${theme.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          textDecoration: 'none', fontSize: '14px', flexShrink: 0,
        }}>✏️</Link>
      )}
    </div>
  )
}

function EmptyState({ isOwnProfile, label }) {
  return (
    <div style={{ fontSize: '14px', color: theme.inkSoft }}>
      {label} not added yet{isOwnProfile && (
        <> — <Link href="/members/new" style={{ color: theme.brassDark, fontWeight: '600', textDecoration: 'none' }}>add it</Link></>
      )}
    </div>
  )
}

function PinnedRow({ icon, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14.5px', color: theme.ink, marginBottom: '10px' }}>
      <span style={{ fontSize: '15px', width: '20px', textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <span>{children}</span>
    </div>
  )
}

function DetailRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: `1px dashed ${theme.line}` }}>
      <span style={{ fontSize: '16px', width: '22px', textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: '11px', color: theme.inkSoft, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
        <div style={{ fontSize: '14.5px', color: theme.ink, fontWeight: '600', marginTop: '2px' }}>{value}</div>
      </div>
    </div>
  )
}

function ProfileTabs({ member, isOwnProfile }) {
  const [activeTab, setActiveTab] = useState('intro')

  const hasPersonalDetails = member.industry || member.years_experience || member.founder_type || member.education
  const hasSkills = (member.skills || []).length > 0
  const hasLookingFor = member.looking_for || member.commitment || member.startup_stage || (member.interested_industry || []).length > 0
  const hasContact = member.contact_email || member.linkedin_url

  return (
    <div>
      <div className="profile-tabs-layout">
        <div className="profile-tabs-sidebar">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`profile-tab-btn${activeTab === t.id ? ' active' : ''}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '9px', width: '100%', textAlign: 'left',
                padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '14px', fontWeight: '600', fontFamily: theme.fontBody, whiteSpace: 'nowrap',
                background: activeTab === t.id ? theme.paper : 'transparent',
                color: activeTab === t.id ? theme.brass : theme.inkSoft,
              }}
            >
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        <div className="profile-tabs-content">
          {activeTab === 'intro' && (
            <div>
              <SectionHeading isOwnProfile={isOwnProfile}>Bio</SectionHeading>
              {member.bio ? (
                <p style={{ fontSize: '14.5px', color: theme.ink, lineHeight: '1.7', marginBottom: '22px' }}>{member.bio}</p>
              ) : (
                <div style={{ marginBottom: '22px' }}><EmptyState isOwnProfile={isOwnProfile} label="Bio" /></div>
              )}

              <h3 style={{ fontSize: '13px', fontWeight: '700', color: theme.inkSoft, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>Pinned Details</h3>
              {(member.role_title || member.location || member.education || member.founder_type) ? (
                <div>
                  {member.role_title && <PinnedRow icon="💼">{member.role_title}</PinnedRow>}
                  {member.location && <PinnedRow icon="📍">{member.location}</PinnedRow>}
                  {member.education && <PinnedRow icon="🎓">{member.education}</PinnedRow>}
                  {member.founder_type && <PinnedRow icon="🚀">{member.founder_type === 'serial' ? 'Serial founder' : 'First-time founder'}</PinnedRow>}
                </div>
              ) : (
                <EmptyState isOwnProfile={isOwnProfile} label="Pinned details" />
              )}
            </div>
          )}

          {activeTab === 'personal' && (
            <div>
              <SectionHeading isOwnProfile={isOwnProfile}>Personal Details</SectionHeading>
              {hasPersonalDetails ? (
                <div>
                  {member.industry && <DetailRow icon="🏭" label="Industry" value={member.industry} />}
                  {member.years_experience && <DetailRow icon="📆" label="Years of Experience" value={member.years_experience} />}
                  {member.founder_type && <DetailRow icon="🚀" label="Founder Type" value={member.founder_type === 'serial' ? 'Serial founder' : 'First-time founder'} />}
                  {member.education && <DetailRow icon="🎓" label="Education" value={member.education} />}
                  {member.experience && <DetailRow icon="🧾" label="Experience" value={member.experience} />}
                </div>
              ) : (
                <EmptyState isOwnProfile={isOwnProfile} label="Personal details" />
              )}
            </div>
          )}

          {activeTab === 'skills' && (
            <div>
              <SectionHeading isOwnProfile={isOwnProfile}>Skills</SectionHeading>
              {hasSkills ? (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {member.skills.map(s => (
                    <span key={s} style={{
                      fontSize: '12.5px', fontWeight: '600', padding: '6px 13px', borderRadius: '20px',
                      background: theme.paper, border: `1px solid ${theme.line}`, color: theme.inkSoft
                    }}>{s}</span>
                  ))}
                </div>
              ) : (
                <EmptyState isOwnProfile={isOwnProfile} label="Skills" />
              )}
            </div>
          )}

          {activeTab === 'looking' && (
            <div>
              <SectionHeading isOwnProfile={isOwnProfile}>Looking For</SectionHeading>
              {hasLookingFor ? (
                <div>
                  {member.looking_for && <DetailRow icon="🎯" label="Looking For" value={member.looking_for} />}
                  {member.commitment && <DetailRow icon="⏱️" label="Commitment" value={member.commitment} />}
                  {member.startup_stage && <DetailRow icon="🚀" label="Startup Stage" value={member.startup_stage} />}
                  {(member.interested_industry || []).length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ fontSize: '11px', color: theme.inkSoft, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>Interested Industries</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {member.interested_industry.map(i => (
                          <span key={i} style={{
                            fontSize: '12.5px', fontWeight: '600', padding: '6px 13px', borderRadius: '20px',
                            background: theme.paper, border: `1px solid ${theme.line}`, color: theme.inkSoft
                          }}>{i}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState isOwnProfile={isOwnProfile} label="Looking for" />
              )}
            </div>
          )}

          {activeTab === 'contact' && (
            <div>
              <SectionHeading isOwnProfile={isOwnProfile}>Contact Info</SectionHeading>
              {hasContact ? (
                <div>
                  {member.contact_email && <DetailRow icon="📧" label="Email" value={
                    <a href={`mailto:${member.contact_email}`} style={{ color: theme.ink, textDecoration: 'none' }}>{member.contact_email}</a>
                  } />}
                  {member.linkedin_url && <DetailRow icon="🔗" label="LinkedIn / Portfolio" value={
                    <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: theme.brassDark, textDecoration: 'none' }}>{member.linkedin_url} ↗</a>
                  } />}
                </div>
              ) : (
                <EmptyState isOwnProfile={isOwnProfile} label="Contact info" />
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .profile-tabs-layout {
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }
        .profile-tabs-sidebar {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 220px;
          flex-shrink: 0;
        }
        .profile-tabs-content {
          flex: 1;
          min-width: 0;
        }
        @media (max-width: 700px) {
          .profile-tabs-layout {
            flex-direction: column;
          }
          .profile-tabs-sidebar {
            flex-direction: row;
            width: 100%;
            overflow-x: auto;
            gap: 8px;
            padding-bottom: 6px;
          }
          .profile-tab-btn {
            flex-shrink: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default function MemberDetailPage() {
  const { userId } = useParams()
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const session = getSession()
  const isOwnProfile = session?.user?.id && session.user.id === userId

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await supabaseFetch(`member_profiles?select=*&user_id=eq.${userId}`)
        setMember(data?.[0] || null)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    if (userId) load()
  }, [userId])

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: theme.inkSoft }}>Loading…</div>

  if (!member) {
    if (isOwnProfile) {
      return (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: theme.inkSoft }}>
          <p style={{ marginBottom: '16px' }}>You haven&apos;t created your co-founder profile yet.</p>
          <Link href="/members/new" style={{
            display: 'inline-block', background: theme.brass, color: 'white',
            borderRadius: '8px', padding: '12px 24px', fontSize: '14.5px', fontWeight: '600', textDecoration: 'none'
          }}>Create Your Profile</Link>
        </div>
      )
    }
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: theme.inkSoft }}>
        Profile not found. <Link href="/members" style={{ color: theme.brassDark, fontWeight: '600' }}>Back to co-founders</Link>
      </div>
    )
  }

  const initial = (member.display_name || '?').trim().charAt(0).toUpperCase()

  return (
    <div style={{ background: theme.paper, minHeight: '70vh' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(20px,4vw,48px) clamp(16px,3vw,24px)' }}>
        <Link href="/members" style={{ fontSize: '13px', color: theme.inkSoft, textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>← Browse co-founders</Link>

        <div style={{ background: theme.surface, borderRadius: '12px', border: `1px solid ${theme.line}`, padding: 'clamp(24px,3.5vw,36px)' }}>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              width: '120px', height: '120px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
              background: theme.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px'
            }}>
              {member.photo_url ? (
                <img src={member.photo_url} alt={member.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontFamily: theme.fontDisplay, fontSize: '42px', fontWeight: '600', color: theme.paper }}>{initial}</span>
              )}
            </div>
            <h1 style={{
              fontFamily: theme.fontDisplay, fontSize: 'clamp(22px,2.8vw,28px)', fontWeight: '600', color: theme.ink,
              display: 'flex', alignItems: 'center', gap: '7px',
            }}>
              {member.display_name}
              {member.verified && <VerifiedBadge size={19} />}
            </h1>
            <div style={{ fontSize: '14px', color: theme.inkSoft, marginTop: '4px' }}>
              {member.role_title || 'Role not specified'}{member.location ? ` · ${member.location}` : ''}
            </div>
            {isOwnProfile && (
              <Link href="/members/new" style={{
                display: 'inline-block', marginTop: '14px', fontSize: '13px', fontWeight: '600', color: theme.brass,
                textDecoration: 'none', border: `1.5px solid ${theme.brass}`, borderRadius: '999px', padding: '8px 18px',
              }}>Edit Profile</Link>
            )}
          </div>

          <div style={{ borderTop: `1px solid ${theme.line}`, marginBottom: '22px' }} />

          <ProfileTabs member={member} isOwnProfile={isOwnProfile} />

          <ConnectSection member={member} />
        </div>
      </div>
    </div>
  )
}
