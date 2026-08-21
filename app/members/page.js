'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabaseFetch, getSession } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import VerifiedBadge from '@/components/VerifiedBadge'
import { SKILL_OPTIONS, INDUSTRY_OPTIONS } from '@/lib/memberOptions'

// Clean, minimal SaaS-app palette — scoped to the /members browse page only.
// Rest of the site keeps its dark red/black theme; this page opts into a
// light neutral surface with the brand's brass accent reserved for
// buttons, badges, and selected states.
const sc = {
  bg: '#F6F6F7',
  cardBg: '#FFFFFF',
  text: '#16181D',
  textSoft: '#6B7280',
  chipBg: '#F1F2F4',
  chipText: '#42454C',
  industryChipBg: 'rgba(179,55,42,0.08)',
  industryChipText: theme.brass,
  shadow: '0 1px 2px rgba(16,24,40,0.04), 0 1px 6px rgba(16,24,40,0.05)',
  shadowHover: '0 6px 20px rgba(16,24,40,0.10)',
}

export default function MembersBrowsePage({ embedded = false }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [skillFilter, setSkillFilter] = useState([])
  const [industryFilter, setIndustryFilter] = useState([])
  const [appliedSkillFilter, setAppliedSkillFilter] = useState([])
  const [appliedIndustryFilter, setAppliedIndustryFilter] = useState([])
  const [myUserId, setMyUserId] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await supabaseFetch('member_profiles?select=*&is_discoverable=eq.true&order=updated_at.desc')
        setMembers(data || [])
      } catch (e) {
        console.error(e)
      }
      setLoading(false)

      const session = getSession()
      setMyUserId(session?.user?.id || null)
    }
    load()
  }, [])

  const toggleFilter = (setFn, value) => setFn(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])

  const activeFilterCount = appliedSkillFilter.length + appliedIndustryFilter.length
  const pendingFilterCount = skillFilter.length + industryFilter.length

  const filteredMembers = members.filter(m => {
    const skillMatch = appliedSkillFilter.length === 0 || appliedSkillFilter.some(s => (m.skills || []).includes(s))
    const industryMatch = appliedIndustryFilter.length === 0 || appliedIndustryFilter.some(i => (m.interested_industry || []).includes(i))
    return skillMatch && industryMatch
  })

  const applyFilters = () => {
    setAppliedSkillFilter(skillFilter)
    setAppliedIndustryFilter(industryFilter)
    setFiltersOpen(false)
  }

  const clearFilters = () => {
    setSkillFilter([])
    setIndustryFilter([])
    setAppliedSkillFilter([])
    setAppliedIndustryFilter([])
  }

  const chipStyle = (selected) => ({
    fontSize: '12.5px', fontWeight: '600', padding: '7px 13px', borderRadius: '20px',
    cursor: 'pointer', fontFamily: theme.fontBody, whiteSpace: 'nowrap', border: 'none',
    background: selected ? theme.brass : sc.chipBg,
    color: selected ? '#FFFFFF' : sc.chipText,
    transition: 'background 0.12s ease',
  })

  return (
    <div style={{ background: sc.bg, minHeight: '70vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,3vw,56px)' }}>
        {!embedded && (
          <>
            <h1 style={{
              fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(24px,3vw,34px)',
              color: sc.text, marginBottom: '8px', letterSpacing: '-0.01em'
            }}>Find a Co-founder</h1>
            <p style={{ fontSize: '14px', color: sc.textSoft, marginBottom: '18px' }}>
              Browse founders looking for a co-founder, partner, or share holder.
            </p>
          </>
        )}

        <button
          onClick={() => setFiltersOpen(v => !v)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px', marginBottom: '18px',
            background: sc.cardBg, border: 'none', borderRadius: '9px', boxShadow: sc.shadow,
            padding: '9px 16px', fontSize: '13px', fontWeight: '600', color: sc.text,
            cursor: 'pointer', fontFamily: theme.fontBody,
          }}
        >
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''} {filtersOpen ? '▲' : '▼'}
        </button>

        {filtersOpen && (
          <div style={{
            background: sc.cardBg, borderRadius: '12px', boxShadow: sc.shadow,
            padding: '20px', marginBottom: '24px',
          }}>
            <div style={{ marginBottom: '18px' }}>
              <div style={{
                fontFamily: theme.fontMono, fontSize: '10.5px', letterSpacing: '0.06em', textTransform: 'uppercase',
                color: sc.textSoft, marginBottom: '9px', fontWeight: '600'
              }}>Skill</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                {SKILL_OPTIONS.map(s => (
                  <button key={s} type="button" onClick={() => toggleFilter(setSkillFilter, s)} style={chipStyle(skillFilter.includes(s))}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{
                fontFamily: theme.fontMono, fontSize: '10.5px', letterSpacing: '0.06em', textTransform: 'uppercase',
                color: sc.textSoft, marginBottom: '9px', fontWeight: '600'
              }}>Industry</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                {INDUSTRY_OPTIONS.map(i => (
                  <button key={i} type="button" onClick={() => toggleFilter(setIndustryFilter, i)} style={chipStyle(industryFilter.includes(i))}>{i}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={applyFilters}
                style={{
                  background: theme.brass, border: 'none', color: '#FFFFFF',
                  fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                  padding: '10px 24px', borderRadius: '999px', fontFamily: theme.fontBody,
                }}
              >Apply{pendingFilterCount > 0 ? ` (${pendingFilterCount})` : ''}</button>
              {(pendingFilterCount > 0 || activeFilterCount > 0) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  style={{
                    background: 'none', border: 'none', color: sc.textSoft,
                    fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', padding: 0, fontFamily: theme.fontBody,
                  }}
                >Clear filters</button>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ color: sc.textSoft, fontSize: '14px', textAlign: 'center', padding: '60px' }}>Loading…</div>
        ) : filteredMembers.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px', color: sc.textSoft,
            background: sc.cardBg, borderRadius: '12px', boxShadow: sc.shadow,
          }}>
            {members.length === 0 ? (
              <>
                <p style={{ fontFamily: theme.fontDisplay, fontSize: '18px', color: sc.text, marginBottom: '8px' }}>No profiles yet</p>
                <p style={{ fontSize: '13.5px' }}>Be the first — <Link href="/account/profile" style={{ color: theme.brass, fontWeight: '600' }}>create your profile</Link>.</p>
              </>
            ) : (
              <p style={{ fontFamily: theme.fontDisplay, fontSize: '18px', color: sc.text }}>No profiles match these filters</p>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(240px,25vw,300px),1fr))',
            gap: 'clamp(14px, 1.6vw, 22px)'
          }}>
            {filteredMembers.map(m => {
              const initial = (m.display_name || '?').trim().charAt(0).toUpperCase()
              return (
                <div key={m.user_id} className="member-card" style={{
                  background: sc.cardBg, borderRadius: '14px', boxShadow: sc.shadow,
                  display: 'flex', flexDirection: 'column', padding: '22px 20px 18px',
                }}>
                  <Link href={`/members/${m.user_id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '13px', marginBottom: '4px' }}>
                      <div style={{
                        width: '96px', height: '96px', borderRadius: '14px', flexShrink: 0, overflow: 'hidden',
                        background: theme.brass, display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {m.photo_url ? (
                          <img src={m.photo_url} alt={m.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontFamily: theme.fontDisplay, fontSize: '34px', fontWeight: '600', color: '#FFFFFF' }}>{initial}</span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0, paddingTop: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: theme.fontDisplay, fontSize: '16.5px', fontWeight: '600', color: sc.text, lineHeight: '1.25' }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.display_name}</span>
                          {m.verified && <VerifiedBadge />}
                        </div>
                        <div style={{ fontSize: '12px', color: sc.textSoft, marginTop: '2px', marginBottom: '8px' }}>
                          {m.role_title || 'Role not specified'}{m.location ? ` · ${m.location}` : ''}
                        </div>
                        {m.skills && m.skills.length > 0 && (
                          <div style={{ fontSize: '11.5px', color: sc.text, marginBottom: '4px', lineHeight: '1.4' }}>
                            <span style={{ fontWeight: '600', color: sc.textSoft }}>Skill: </span>
                            {m.skills.join(', ')}
                          </div>
                        )}
                        {m.interested_industry && m.interested_industry.length > 0 && (
                          <div style={{ fontSize: '11.5px', color: sc.text, lineHeight: '1.4', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '600', color: sc.industryChipText }}>Interest: </span>
                            {m.interested_industry.join(', ')}
                          </div>
                        )}
                        {m.startup_stage && (
                          <div style={{ fontSize: '11.5px', color: sc.text, lineHeight: '1.4', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '600', color: sc.textSoft }}>Stage: </span>
                            {m.startup_stage}
                          </div>
                        )}
                        {m.looking_for && (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            background: theme.brass, color: '#FFFFFF', fontSize: '11.5px', fontWeight: '700',
                            padding: '4px 10px', borderRadius: '999px',
                          }}>
                            🎯 Looking for: {m.looking_for}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>

                  {myUserId === m.user_id ? null : (m.contact_email || m.linkedin_url) ? (
                    <div style={{ marginTop: '18px', display: 'flex', gap: '8px' }}>
                      {m.contact_email && (
                        <a
                          href={`mailto:${m.contact_email}`}
                          onClick={e => e.stopPropagation()}
                          style={{
                            flex: 1, textAlign: 'center', border: 'none', cursor: 'pointer',
                            background: theme.brass, color: '#FFFFFF', fontFamily: theme.fontBody,
                            borderRadius: '999px', padding: '10px 12px', fontSize: '12.5px', fontWeight: '700',
                            whiteSpace: 'nowrap', textDecoration: 'none', display: 'block',
                          }}
                        >📧 Email</a>
                      )}
                      {m.linkedin_url && (
                        <a
                          href={m.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{
                            flex: 1, textAlign: 'center', cursor: 'pointer',
                            background: sc.chipBg, color: sc.text, fontFamily: theme.fontBody,
                            border: 'none', borderRadius: '999px', padding: '10px 12px', fontSize: '12.5px', fontWeight: '700',
                            whiteSpace: 'nowrap', textDecoration: 'none', display: 'block',
                          }}
                        >🔗 LinkedIn</a>
                      )}
                    </div>
                  ) : null}
                </div>
              )
            })}
            <style jsx>{`
              .member-card {
                transition: transform 0.15s ease, box-shadow 0.15s ease;
              }
              .member-card:hover {
                transform: translateY(-3px);
                box-shadow: ${sc.shadowHover};
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  )
}
