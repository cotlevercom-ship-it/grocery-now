'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import VerifiedBadge from '@/components/VerifiedBadge'
import { SKILL_OPTIONS, INDUSTRY_OPTIONS } from '@/lib/memberOptions'

// Black & white palette — scoped to the /members browse page only.
const bw = {
  bg: '#FFFFFF',
  cardBg: '#FFFFFF',
  border: '#111111',
  borderSoft: '#DDDDDD',
  text: '#111111',
  textSoft: '#555555',
  chipBg: '#FFFFFF',
  chipText: '#111111',
  chipFilledBg: '#111111',
  chipFilledText: '#FFFFFF',
  bannerFrom: '#1A1A1A',
  bannerTo: '#000000',
}

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
    background: selected ? bw.chipFilledBg : bw.chipBg,
    color: selected ? bw.chipFilledText : bw.chipText,
    border: `1px solid ${bw.border}`,
  })

  return (
    <div style={{ background: bw.bg, minHeight: '70vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,3vw,56px)' }}>
        {!embedded && (
          <>
            <h1 style={{
              fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(24px,3vw,34px)',
              color: bw.text, marginBottom: '8px', letterSpacing: '-0.01em'
            }}>Find a Co-founder</h1>
            <p style={{ fontSize: '14px', color: bw.textSoft, marginBottom: '18px' }}>
              Browse founders looking for a co-founder, partner, or share holder.
            </p>
          </>
        )}

        <button
          onClick={() => setFiltersOpen(v => !v)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px', marginBottom: '18px',
            background: bw.cardBg, border: `1px solid ${bw.border}`, borderRadius: '8px',
            padding: '9px 15px', fontSize: '13px', fontWeight: '600', color: bw.text,
            cursor: 'pointer', fontFamily: theme.fontBody,
          }}
        >
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''} {filtersOpen ? '▲' : '▼'}
        </button>

        {filtersOpen && (
          <div style={{
            background: bw.cardBg, border: `1px solid ${bw.border}`, borderRadius: '10px',
            padding: '18px', marginBottom: '22px',
          }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                fontFamily: theme.fontMono, fontSize: '10.5px', letterSpacing: '0.06em', textTransform: 'uppercase',
                color: bw.text, marginBottom: '8px', fontWeight: '600'
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
                color: bw.text, marginBottom: '8px', fontWeight: '600'
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
                  background: bw.chipFilledBg, border: `1px solid ${bw.border}`, color: bw.chipFilledText,
                  fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                  padding: '9px 22px', borderRadius: '999px', fontFamily: theme.fontBody,
                }}
              >Apply{pendingFilterCount > 0 ? ` (${pendingFilterCount})` : ''}</button>
              {(pendingFilterCount > 0 || activeFilterCount > 0) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  style={{
                    background: 'none', border: 'none', color: bw.text,
                    fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', padding: 0, fontFamily: theme.fontBody,
                    textDecoration: 'underline',
                  }}
                >Clear filters</button>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ color: bw.textSoft, fontSize: '14px', textAlign: 'center', padding: '60px' }}>Loading…</div>
        ) : filteredMembers.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px', color: bw.textSoft,
            background: bw.cardBg, borderRadius: '10px', border: `1px solid ${bw.border}`
          }}>
            {members.length === 0 ? (
              <>
                <p style={{ fontFamily: theme.fontDisplay, fontSize: '18px', color: bw.text, marginBottom: '8px' }}>No profiles yet</p>
                <p style={{ fontSize: '13.5px' }}>Be the first — <Link href="/members/new" style={{ color: bw.text, fontWeight: '600', textDecoration: 'underline' }}>create your profile</Link>.</p>
              </>
            ) : (
              <p style={{ fontFamily: theme.fontDisplay, fontSize: '18px', color: bw.text }}>No profiles match these filters</p>
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
                  background: bw.cardBg, border: `1px solid ${bw.border}`, borderRadius: '10px',
                  display: 'flex', flexDirection: 'column', overflow: 'hidden',
                }}>
                  <Link href={`/members/${m.user_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {/* Avatar */}
                    <div style={{ padding: '18px 18px 0' }}>
                      <div style={{
                        width: '68px', height: '68px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                        background: bw.chipFilledBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `3px solid ${bw.cardBg}`,
                      }}>
                        {m.photo_url ? (
                          <img src={m.photo_url} alt={m.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontFamily: theme.fontDisplay, fontSize: '24px', fontWeight: '600', color: bw.chipFilledText }}>{initial}</span>
                        )}
                      </div>
                    </div>

                    <div style={{ padding: '10px 18px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: theme.fontDisplay, fontSize: '17px', fontWeight: '600', color: bw.text, lineHeight: '1.2' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.display_name}</span>
                        {m.verified && <VerifiedBadge />}
                      </div>
                      <div style={{ fontSize: '12px', color: bw.textSoft, marginTop: '3px', marginBottom: '14px' }}>
                        {m.role_title || 'Role not specified'}{m.location ? ` · ${m.location}` : ''}
                      </div>

                      {((m.skills && m.skills.length > 0) || (m.interested_industry && m.interested_industry.length > 0)) && (
                        <div style={{ paddingTop: '2px', paddingBottom: '16px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {(m.skills || []).map((s, idx) => (
                            <span key={`sk-${idx}`} style={{
                              fontSize: '10.5px', fontWeight: '600', padding: '3px 9px', borderRadius: '20px',
                              background: bw.chipBg, border: `1px solid ${bw.border}`, color: bw.chipText
                            }}>{s}</span>
                          ))}
                          {(m.interested_industry || []).map((ind, idx) => (
                            <span key={`in-${idx}`} style={{
                              fontSize: '10.5px', fontWeight: '600', padding: '3px 9px', borderRadius: '20px',
                              background: bw.chipFilledBg, color: bw.chipFilledText
                            }}>{ind}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>

                  <div style={{ padding: '0 18px 18px' }}>
                    <Link href={`/members/${m.user_id}`} style={{
                      display: 'block', textAlign: 'center', textDecoration: 'none',
                      border: `1.5px solid ${bw.border}`, color: bw.text,
                      borderRadius: '999px', padding: '9px 16px', fontSize: '13px', fontWeight: '700',
                    }}>Meet</Link>
                  </div>
                </div>
              )
            })}
            <style jsx>{`
              .member-card {
                transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
              }
              .member-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 24px -10px rgba(0, 0, 0, 0.35);
                border-color: ${bw.border};
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  )
}
