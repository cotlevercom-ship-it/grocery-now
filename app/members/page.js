'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import VerifiedBadge from '@/components/VerifiedBadge'
import { SKILL_OPTIONS, INDUSTRY_OPTIONS } from '@/lib/memberOptions'

export default function MembersBrowsePage({ embedded = false }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [skillFilter, setSkillFilter] = useState([])
  const [industryFilter, setIndustryFilter] = useState([])
  const [appliedSkillFilter, setAppliedSkillFilter] = useState([])
  const [appliedIndustryFilter, setAppliedIndustryFilter] = useState([])

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
    fontSize: '12px', fontWeight: '600', padding: '6px 12px', borderRadius: '20px',
    cursor: 'pointer', fontFamily: theme.fontBody, whiteSpace: 'nowrap',
    background: selected ? theme.brass : theme.paper,
    color: selected ? 'white' : theme.inkSoft,
    border: `1px solid ${selected ? theme.brass : theme.line}`,
  })

  return (
    <div style={{ background: theme.paper, minHeight: '70vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,3vw,56px)' }}>
        {!embedded && (
          <>
            <h1 style={{
              fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(24px,3vw,34px)',
              color: theme.ink, marginBottom: '8px', letterSpacing: '-0.01em'
            }}>Find a Co-founder</h1>
            <p style={{ fontSize: '14px', color: theme.inkSoft, marginBottom: '18px' }}>
              Browse founders looking for a co-founder, partner, or share holder.
            </p>
          </>
        )}

        <button
          onClick={() => setFiltersOpen(v => !v)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px', marginBottom: '18px',
            background: theme.surface, border: `1px solid ${theme.line}`, borderRadius: '8px',
            padding: '9px 15px', fontSize: '13px', fontWeight: '600', color: theme.ink,
            cursor: 'pointer', fontFamily: theme.fontBody,
          }}
        >
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''} {filtersOpen ? '▲' : '▼'}
        </button>

        {filtersOpen && (
          <div style={{
            background: theme.surface, border: `1px solid ${theme.line}`, borderRadius: '10px',
            padding: '18px', marginBottom: '22px',
          }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                fontFamily: theme.fontMono, fontSize: '10.5px', letterSpacing: '0.06em', textTransform: 'uppercase',
                color: theme.brassDark, marginBottom: '8px', fontWeight: '600'
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
                color: theme.brassDark, marginBottom: '8px', fontWeight: '600'
              }}>Industry</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                {INDUSTRY_OPTIONS.map(i => (
                  <button key={i} type="button" onClick={() => toggleFilter(setIndustryFilter, i)} style={chipStyle(industryFilter.includes(i))}>{i}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: '18px' }}>
              <button
                type="button"
                onClick={applyFilters}
                style={{
                  background: theme.brass, border: 'none', color: 'white',
                  fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                  padding: '9px 22px', borderRadius: '999px', fontFamily: theme.fontBody,
                }}
              >Apply{pendingFilterCount > 0 ? ` (${pendingFilterCount})` : ''}</button>
              {(pendingFilterCount > 0 || activeFilterCount > 0) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  style={{
                    background: 'none', border: 'none', color: theme.brassDark,
                    fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', padding: 0, fontFamily: theme.fontBody,
                  }}
                >Clear filters</button>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ color: theme.inkSoft, fontSize: '14px', textAlign: 'center', padding: '60px' }}>Loading…</div>
        ) : filteredMembers.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px', color: theme.inkSoft,
            background: theme.surface, borderRadius: '10px', border: `1px solid ${theme.line}`
          }}>
            {members.length === 0 ? (
              <>
                <p style={{ fontFamily: theme.fontDisplay, fontSize: '18px', color: theme.ink, marginBottom: '8px' }}>No profiles yet</p>
                <p style={{ fontSize: '13.5px' }}>Be the first — <Link href="/members/new" style={{ color: theme.brassDark, fontWeight: '600' }}>create your profile</Link>.</p>
              </>
            ) : (
              <p style={{ fontFamily: theme.fontDisplay, fontSize: '18px', color: theme.ink }}>No profiles match these filters</p>
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
                  background: theme.surface, border: `1px solid ${theme.line}`, borderRadius: '10px',
                  display: 'flex', flexDirection: 'column', padding: '20px 20px 16px',
                }}>
                  <Link href={`/members/${m.user_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '13px', marginBottom: '14px' }}>
                      <div style={{
                        width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                        background: theme.brass, display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {m.photo_url ? (
                          <img src={m.photo_url} alt={m.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontFamily: theme.fontDisplay, fontSize: '24px', fontWeight: '600', color: 'white' }}>{initial}</span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: theme.fontDisplay, fontSize: '17px', fontWeight: '600', color: theme.ink, lineHeight: '1.2' }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.display_name}</span>
                          {m.verified && <VerifiedBadge />}
                        </div>
                        <div style={{ fontSize: '12px', color: theme.inkSoft, marginTop: '3px' }}>
                          {m.role_title || 'Role not specified'}{m.location ? ` · ${m.location}` : ''}
                        </div>
                      </div>
                    </div>

                    {m.bio && (
                      <p style={{
                        fontFamily: theme.fontDisplay, fontStyle: 'italic', fontSize: '12.5px', color: theme.inkSoft,
                        marginBottom: '14px', lineHeight: '1.55',
                        overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                      }}>{m.bio}</p>
                    )}

                    <div style={{ paddingTop: '2px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {m.looking_for && (
                        <span style={{
                          fontSize: '10.5px', fontWeight: '600', padding: '3px 9px', borderRadius: '20px',
                          background: theme.signalSoft, color: theme.signal
                        }}>{m.looking_for}</span>
                      )}
                      {m.commitment && (
                        <span style={{
                          fontSize: '10.5px', fontWeight: '600', padding: '3px 9px', borderRadius: '20px',
                          background: theme.paper, border: `1px solid ${theme.line}`, color: theme.inkSoft
                        }}>{m.commitment}</span>
                      )}
                    </div>
                  </Link>

                  <Link href={`/members/${m.user_id}`} style={{
                    marginTop: '16px', textAlign: 'center', textDecoration: 'none',
                    border: `1.5px solid ${theme.brass}`, color: theme.brass,
                    borderRadius: '999px', padding: '9px 16px', fontSize: '13px', fontWeight: '700',
                  }}>Meet</Link>
                </div>
              )
            })}
            <style jsx>{`
              .member-card {
                transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
              }
              .member-card:hover {
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
