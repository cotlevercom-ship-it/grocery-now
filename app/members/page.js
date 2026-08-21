'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { supabaseFetch, getSession } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import VerifiedBadge from '@/components/VerifiedBadge'
import { SKILL_OPTIONS, INDUSTRY_OPTIONS } from '@/lib/memberOptions'

// Clean, minimal SaaS-app palette — scoped to the /members browse page only.
// Rest of the site keeps its dark red/black theme; this page opts into a
// light neutral surface with the brand's brass accent reserved for
// buttons, badges, and selected states.
const sc = {
  bg: '#F7F6F4',
  sidebarBg: '#FFFFFF',
  cardBg: '#FFFFFF',
  text: '#16181D',
  textSoft: '#6B7280',
  textFaint: '#A1A5AC',
  line: '#EBE9E6',
  chipBg: '#F1F2F4',
  chipText: '#42454C',
  industryChipBg: 'rgba(179,55,42,0.08)',
  industryChipText: theme.brass,
  shadow: '0 1px 2px rgba(16,24,40,0.04), 0 1px 6px rgba(16,24,40,0.05)',
  shadowHover: '0 6px 20px rgba(16,24,40,0.10)',
}

const COMMITMENT_OPTIONS = ['Full-time', 'Part-time', 'Still exploring']
const PAGE_SIZE_OPTIONS = [6, 12, 24]

const NAV_ITEMS = [
  { key: 'discover', label: 'Discover', icon: '🧭', href: '/members', active: true },
  { key: 'matches', label: 'Matches', icon: '❤️' },
  { key: 'messages', label: 'Messages', icon: '💬' },
  { key: 'saved', label: 'Saved', icon: '🔖' },
  { key: 'profile', label: 'My Profile', icon: '👤', href: '/account' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
]

function FilterDropdown({ label, count, children, isOpen, onToggle }) {
  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: sc.cardBg, border: `1px solid ${count > 0 ? theme.brass : sc.line}`,
          borderRadius: '999px', padding: '9px 14px', fontSize: '13px', fontWeight: '600',
          color: count > 0 ? theme.brass : sc.text, cursor: 'pointer', fontFamily: theme.fontBody,
          whiteSpace: 'nowrap',
        }}
      >
        {label}{count > 0 ? ` (${count})` : ''}
        <span style={{ fontSize: '10px', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', display: 'inline-block' }}>▾</span>
      </button>
      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 20, minWidth: '260px',
          background: sc.cardBg, borderRadius: '12px', boxShadow: sc.shadowHover,
          border: `1px solid ${sc.line}`, padding: '16px',
        }}>
          {children}
        </div>
      )}
    </div>
  )
}

function ChipToggle({ options, selected, onToggle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
      {options.map(o => {
        const isSel = selected.includes(o)
        return (
          <button
            key={o} type="button" onClick={() => onToggle(o)}
            style={{
              fontSize: '12.5px', fontWeight: '600', padding: '7px 12px', borderRadius: '20px',
              cursor: 'pointer', fontFamily: theme.fontBody, border: 'none',
              background: isSel ? theme.brass : sc.chipBg, color: isSel ? '#FFFFFF' : sc.chipText,
            }}
          >{o}</button>
        )
      })}
    </div>
  )
}

export default function MembersBrowsePage({ embedded = false }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [myUserId, setMyUserId] = useState(null)
  const [myProfile, setMyProfile] = useState(null)

  const searchParams = useSearchParams()
  const [search, setSearch] = useState('')
  const [openDropdown, setOpenDropdown] = useState(null) // 'role' | 'skills' | 'interests' | 'location' | 'availability' | null

  const [roleFilter, setRoleFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [skillFilter, setSkillFilter] = useState([])
  const [industryFilter, setIndustryFilter] = useState([])
  const [availabilityFilter, setAvailabilityFilter] = useState('')

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)

  // Pick up ?q= and ?skill= from links elsewhere on the site (e.g. the
  // homepage hero search box and quick-role chips) as initial filter state.
  useEffect(() => {
    const q = searchParams.get('q')
    const skill = searchParams.get('skill')
    if (q) setSearch(q)
    if (skill) setSkillFilter(prev => prev.includes(skill) ? prev : [...prev, skill])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      const uid = session?.user?.id || null
      setMyUserId(uid)
      if (uid) {
        try {
          const rows = await supabaseFetch(`member_profiles?select=display_name,photo_url&user_id=eq.${uid}`)
          setMyProfile(rows?.[0] || null)
        } catch (e) { console.error(e) }
      }
    }
    load()
  }, [])

  const toggleFilter = (setFn, value) => setFn(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])

  const activeFilterCount = [
    roleFilter.trim(), locationFilter.trim(), availabilityFilter,
    ...skillFilter, ...industryFilter,
  ].filter(Boolean).length

  const clearAll = () => {
    setRoleFilter(''); setLocationFilter(''); setSkillFilter([]); setIndustryFilter([]); setAvailabilityFilter('')
    setSearch('')
    setPage(1)
  }

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return members.filter(m => {
      const roleMatch = !roleFilter.trim() || (m.role_title || '').toLowerCase().includes(roleFilter.trim().toLowerCase())
      const locationMatch = !locationFilter.trim() || (m.location || '').toLowerCase().includes(locationFilter.trim().toLowerCase())
      const skillMatch = skillFilter.length === 0 || skillFilter.some(s => (m.skills || []).includes(s))
      const industryMatch = industryFilter.length === 0 || industryFilter.some(i => (m.interested_industry || []).includes(i))
      const availabilityMatch = !availabilityFilter || m.commitment === availabilityFilter
      const searchMatch = !q || [
        m.display_name, m.role_title, m.location, m.bio,
        ...(m.skills || []), ...(m.interested_industry || []),
      ].filter(Boolean).some(v => v.toLowerCase().includes(q))
      return roleMatch && locationMatch && skillMatch && industryMatch && availabilityMatch && searchMatch
    })
  }, [members, search, roleFilter, locationFilter, skillFilter, industryFilter, availabilityFilter])

  useEffect(() => { setPage(1) }, [search, roleFilter, locationFilter, skillFilter, industryFilter, availabilityFilter, pageSize])

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize))
  const pageStart = (page - 1) * pageSize
  const pagedMembers = filteredMembers.slice(pageStart, pageStart + pageSize)

  const toggleDropdown = (key) => setOpenDropdown(prev => prev === key ? null : key)
  const myInitial = (myProfile?.display_name || '?').trim().charAt(0).toUpperCase()

  // ---------- Card ----------
  const cardGrid = (
    loading ? (
      <div style={{ color: sc.textSoft, fontSize: '14px', textAlign: 'center', padding: '60px' }}>Loading…</div>
    ) : filteredMembers.length === 0 ? (
      <div style={{
        textAlign: 'center', padding: '60px 20px', color: sc.textSoft,
        background: sc.cardBg, borderRadius: '12px', boxShadow: sc.shadow,
      }}>
        {members.length === 0 ? (
          <>
            <p style={{ fontFamily: theme.fontDisplay, fontSize: '18px', color: sc.text, marginBottom: '8px' }}>No profiles yet</p>
            <p style={{ fontSize: '13.5px' }}>Be the first — <Link href="/account" style={{ color: theme.brass, fontWeight: '600' }}>create your profile</Link>.</p>
          </>
        ) : (
          <p style={{ fontFamily: theme.fontDisplay, fontSize: '18px', color: sc.text }}>No profiles match these filters</p>
        )}
      </div>
    ) : (
      <>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(240px,28vw,320px),1fr))',
          gap: 'clamp(14px, 1.6vw, 22px)'
        }}>
          {pagedMembers.map(m => {
            const initial = (m.display_name || '?').trim().charAt(0).toUpperCase()
            return (
              <div key={m.user_id} className="member-card" style={{
                background: sc.cardBg, borderRadius: '14px', boxShadow: sc.shadow,
                display: 'flex', flexDirection: 'column', padding: '20px 20px 18px', position: 'relative',
              }}>
                <span style={{
                  position: 'absolute', top: '14px', right: '16px', fontSize: '18px', color: sc.textFaint,
                  lineHeight: 1, letterSpacing: '1px', userSelect: 'none',
                }}>⋮</span>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '13px', marginBottom: '4px' }}>
                  <div style={{
                    width: '96px', height: '96px', borderRadius: '16px', flexShrink: 0, overflow: 'hidden',
                    background: theme.brass, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {m.photo_url ? (
                      <img src={m.photo_url} alt={m.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontFamily: theme.fontDisplay, fontSize: '34px', fontWeight: '600', color: '#FFFFFF' }}>{initial}</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, paddingTop: '2px', paddingRight: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: theme.fontDisplay, fontSize: '16px', fontWeight: '600', color: sc.text, lineHeight: '1.25' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.display_name}</span>
                      {m.verified && <VerifiedBadge />}
                    </div>
                    <div style={{ fontSize: '12px', color: sc.textSoft, marginTop: '2px' }}>
                      {m.role_title || 'Role not specified'}{m.location ? ` · ${m.location}` : ''}
                    </div>
                    {m.skills && m.skills.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '9px' }}>
                        {m.skills.slice(0, 3).map(s => (
                          <span key={s} style={{
                            fontSize: '11px', fontWeight: '600', color: sc.chipText, background: sc.chipBg,
                            borderRadius: '999px', padding: '5px 10px', whiteSpace: 'nowrap',
                          }}>{s}</span>
                        ))}
                        {m.skills.length > 3 && (
                          <span style={{
                            fontSize: '11px', fontWeight: '600', color: sc.textSoft, background: sc.chipBg,
                            borderRadius: '999px', padding: '5px 10px',
                          }}>+{m.skills.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '10px' }}>
                  {m.skills && m.skills.length > 0 && (
                    <div style={{ fontSize: '11.5px', color: sc.text, marginBottom: '4px', lineHeight: '1.4' }}>
                      <span style={{ fontWeight: '600', color: sc.textSoft }}>Skills: </span>
                      {m.skills.join(', ')}
                    </div>
                  )}
                  {m.interested_industry && m.interested_industry.length > 0 && (
                    <div style={{ fontSize: '11.5px', color: sc.text, lineHeight: '1.4', marginBottom: '10px' }}>
                      <span style={{ fontWeight: '600', color: sc.industryChipText }}>Interest: </span>
                      {m.interested_industry.join(', ')}
                    </div>
                  )}
                  {m.startup_stage && (
                    <div style={{ fontSize: '11.5px', color: sc.text, lineHeight: '1.4', marginBottom: '10px' }}>
                      <span style={{ fontWeight: '600', color: sc.textSoft }}>Stage: </span>
                      {m.startup_stage}
                    </div>
                  )}
                  {m.looking_for && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      background: sc.industryChipBg, color: theme.brass, fontSize: '11.5px', fontWeight: '700',
                      padding: '5px 11px', borderRadius: '999px', marginBottom: '4px',
                    }}>
                      🎯 Looking for: {m.looking_for}
                    </div>
                  )}
                </div>

                {myUserId === m.user_id ? null : (m.contact_email || m.linkedin_url) ? (
                  <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                    {m.contact_email && (
                      <a
                        href={`mailto:${m.contact_email}`}
                        style={{
                          flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          background: theme.brass, color: '#FFFFFF', fontFamily: theme.fontBody,
                          borderRadius: '999px', padding: '10px 12px', fontSize: '12.5px', fontWeight: '700',
                          whiteSpace: 'nowrap', textDecoration: 'none',
                        }}
                      >📧 Email</a>
                    )}
                    {m.linkedin_url && (
                      <a
                        href={m.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          background: 'transparent', color: sc.text, fontFamily: theme.fontBody,
                          border: `1px solid ${sc.line}`, borderRadius: '999px', padding: '10px 12px', fontSize: '12.5px', fontWeight: '700',
                          whiteSpace: 'nowrap', textDecoration: 'none',
                        }}
                      >🔗 LinkedIn</a>
                    )}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
          gap: '14px', marginTop: '28px'
        }}>
          <div style={{ fontSize: '13px', color: sc.textSoft }}>
            Showing {pageStart + 1}–{Math.min(pageStart + pageSize, filteredMembers.length)} of {filteredMembers.length} results
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${sc.line}`,
                background: sc.cardBg, color: page === 1 ? sc.textFaint : sc.text, cursor: page === 1 ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            ><span style={{ fontSize: '15px' }}>‹</span></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 6).map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                  background: n === page ? theme.brass : 'transparent',
                  color: n === page ? '#FFFFFF' : sc.text, fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                }}
              >{n}</button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${sc.line}`,
                background: sc.cardBg, color: page === totalPages ? sc.textFaint : sc.text, cursor: page === totalPages ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            ><span style={{ fontSize: '15px' }}>›</span></button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: sc.textSoft }}>
            Show
            <select
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
              style={{
                border: `1px solid ${sc.line}`, borderRadius: '8px', padding: '6px 8px',
                fontSize: '13px', fontFamily: theme.fontBody, color: sc.text, background: sc.cardBg,
              }}
            >
              {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n} per page</option>)}
            </select>
          </div>
        </div>
      </>
    )
  )

  // ---------- Filter bar (shared) ----------
  const filterBar = (
    <div className="members-filterbar" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600',
        color: sc.textSoft, padding: '9px 4px',
      }}>
        🎚️ Filters
        {activeFilterCount > 0 && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: theme.brass, display: 'inline-block' }} />}
      </div>

      <FilterDropdown label="Role" count={roleFilter.trim() ? 1 : 0} isOpen={openDropdown === 'role'} onToggle={() => toggleDropdown('role')}>
        <input
          type="text" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          placeholder="e.g. Software Engineer"
          style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${sc.line}`, borderRadius: '8px', padding: '9px 12px', fontSize: '13.5px', fontFamily: theme.fontBody }}
        />
      </FilterDropdown>

      <FilterDropdown label="Skills" count={skillFilter.length} isOpen={openDropdown === 'skills'} onToggle={() => toggleDropdown('skills')}>
        <ChipToggle options={SKILL_OPTIONS} selected={skillFilter} onToggle={v => toggleFilter(setSkillFilter, v)} />
      </FilterDropdown>

      <FilterDropdown label="Interests" count={industryFilter.length} isOpen={openDropdown === 'interests'} onToggle={() => toggleDropdown('interests')}>
        <ChipToggle options={INDUSTRY_OPTIONS} selected={industryFilter} onToggle={v => toggleFilter(setIndustryFilter, v)} />
      </FilterDropdown>

      <FilterDropdown label="Location" count={locationFilter.trim() ? 1 : 0} isOpen={openDropdown === 'location'} onToggle={() => toggleDropdown('location')}>
        <input
          type="text" value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
          placeholder="e.g. Dhaka"
          style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${sc.line}`, borderRadius: '8px', padding: '9px 12px', fontSize: '13.5px', fontFamily: theme.fontBody }}
        />
      </FilterDropdown>

      <FilterDropdown label="Availability" count={availabilityFilter ? 1 : 0} isOpen={openDropdown === 'availability'} onToggle={() => toggleDropdown('availability')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {COMMITMENT_OPTIONS.map(o => (
            <button
              key={o} type="button" onClick={() => setAvailabilityFilter(prev => prev === o ? '' : o)}
              style={{
                textAlign: 'left', padding: '9px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '13.5px', fontWeight: '600', fontFamily: theme.fontBody,
                background: availabilityFilter === o ? theme.brass : sc.chipBg,
                color: availabilityFilter === o ? '#FFFFFF' : sc.chipText,
              }}
            >{o}</button>
          ))}
        </div>
      </FilterDropdown>

      {activeFilterCount > 0 && (
        <button
          type="button" onClick={clearAll}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none',
            color: sc.textSoft, fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: '9px 4px', fontFamily: theme.fontBody,
          }}
        ><span>✕</span> Clear all</button>
      )}

      <div className="members-sort" style={{ marginLeft: 'auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600',
          color: sc.text, border: `1px solid ${sc.line}`, borderRadius: '999px', padding: '9px 14px',
        }}>Most Relevant <span style={{ fontSize: '10px' }}>▾</span></div>
      </div>
    </div>
  )

  if (embedded) {
    return (
      <div style={{ background: sc.bg, minHeight: '70vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,3vw,56px)' }}>
          <div className="members-mobile-search" style={{ display: 'none', position: 'relative', marginBottom: '14px' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: sc.textFaint }}>🔍</span>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, skills or keyword…"
              style={{
                width: '100%', boxSizing: 'border-box', border: `1px solid ${sc.line}`, borderRadius: '14px',
                padding: '13px 44px 13px 42px', fontSize: '14px', fontFamily: theme.fontBody, background: sc.cardBg, color: sc.text,
                boxShadow: sc.shadow,
              }}
            />
            <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: sc.textFaint }}>🎚️</span>
          </div>
          {filterBar}
          {cardGrid}
        </div>
        <style jsx>{`
          @media (max-width: 860px) {
            .members-mobile-search { display: block !important; }
            .members-filterbar {
              flex-wrap: nowrap !important;
              overflow-x: auto;
              -webkit-overflow-scrolling: touch;
              padding-bottom: 2px;
            }
            .members-filterbar::-webkit-scrollbar { display: none; }
            .members-filterbar > * { flex-shrink: 0; }
            .members-sort { margin-left: 0 !important; }
          }
        `}</style>
        <style jsx global>{`
          .member-card {
            transition: transform 0.15s ease, box-shadow 0.15s ease;
          }
          .member-card:hover {
            transform: translateY(-3px);
            box-shadow: ${sc.shadowHover};
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: sc.bg }}>
      {/* Sidebar */}
      <div style={{
        width: '236px', flexShrink: 0, background: sc.sidebarBg, borderRight: `1px solid ${sc.line}`,
        padding: '22px 16px', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh',
      }} className="members-sidebar">
        <div style={{ padding: '0 8px', marginBottom: '28px' }}>
          <span style={{ fontFamily: theme.fontDisplay, fontSize: '20px', fontWeight: '700', color: sc.text }}>Cot<span style={{ color: theme.brass }}>Lever</span></span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV_ITEMS.map(item => {
            const inner = (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '9px',
                fontSize: '14px', fontWeight: '600',
                background: item.active ? sc.industryChipBg : 'transparent',
                color: item.active ? theme.brass : item.href ? sc.text : sc.textFaint,
                cursor: item.href ? 'pointer' : 'default',
              }}>
                <span style={{ fontSize: '16px', lineHeight: 1 }}>{item.icon}</span>
                {item.label}
                {!item.href && (
                  <span style={{
                    marginLeft: 'auto', fontSize: '9.5px', fontWeight: '700', color: sc.textFaint,
                    border: `1px solid ${sc.line}`, borderRadius: '999px', padding: '2px 7px', letterSpacing: '0.02em',
                  }}>Soon</span>
                )}
              </div>
            )
            return item.href ? <Link key={item.key} href={item.href} style={{ textDecoration: 'none' }}>{inner}</Link> : <div key={item.key}>{inner}</div>
          })}
        </nav>
      </div>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Topbar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px', padding: '14px clamp(16px,3vw,40px)',
          borderBottom: `1px solid ${sc.line}`, background: sc.sidebarBg,
        }}>
          <div className="members-search" style={{ position: 'relative', flex: 1, maxWidth: '440px' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: sc.textFaint }}>🔍</span>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by skills, roles, or keywords…"
              style={{
                width: '100%', boxSizing: 'border-box', border: `1px solid ${sc.line}`, borderRadius: '999px',
                padding: '10px 14px 10px 38px', fontSize: '13.5px', fontFamily: theme.fontBody, background: sc.bg, color: sc.text,
              }}
            />
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ position: 'relative', fontSize: '18px', color: sc.textSoft }}>
              🔔
              <span style={{
                position: 'absolute', top: '-5px', right: '-7px', minWidth: '15px', height: '15px', borderRadius: '999px',
                background: theme.brass, color: '#FFFFFF', fontSize: '9px', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
              }}>2</span>
            </span>
            <Link href="/account" style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
              <span style={{
                width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                background: theme.brass, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {myProfile?.photo_url ? (
                  <img src={myProfile.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#FFFFFF', fontSize: '13.5px', fontWeight: '700', fontFamily: theme.fontDisplay }}>{myUserId ? myInitial : '?'}</span>
                )}
              </span>
              <span className="members-username" style={{ fontSize: '13px', fontWeight: '600', color: sc.text, display: 'none', alignItems: 'center', gap: '3px' }}>
                rfin786 <span style={{ fontSize: '9px' }}>▾</span>
              </span>
            </Link>
          </div>
        </div>

        <div style={{ padding: 'clamp(20px,3vw,40px)', paddingBottom: 'clamp(20px,3vw,40px)' }}>
          <h1 className="members-heading" style={{
            fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(22px,2.6vw,30px)',
            color: sc.text, marginBottom: '6px', letterSpacing: '-0.01em'
          }}>Find a Co-founder</h1>
          <p className="members-heading" style={{ fontSize: '14px', color: sc.textSoft, marginBottom: '22px' }}>
            Browse founders looking for a co-founder, partner, or share holder.
          </p>

          <div className="members-mobile-search" style={{ display: 'none', position: 'relative', marginBottom: '14px' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: sc.textFaint }}>🔍</span>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, skills or keyword…"
              style={{
                width: '100%', boxSizing: 'border-box', border: `1px solid ${sc.line}`, borderRadius: '14px',
                padding: '13px 44px 13px 42px', fontSize: '14px', fontFamily: theme.fontBody, background: sc.cardBg, color: sc.text,
                boxShadow: sc.shadow,
              }}
            />
            <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: sc.textFaint }}>🎚️</span>
          </div>

          {filterBar}
          {cardGrid}
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <div className="members-bottom-nav" style={{
        display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
        background: sc.sidebarBg, borderTop: `1px solid ${sc.line}`,
        padding: '10px 8px calc(10px + env(safe-area-inset-bottom))',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: theme.brass }}>
            <span style={{ fontSize: '18px', lineHeight: 1 }}>👤</span>
            <span style={{ fontSize: '10.5px', fontWeight: '700' }}>Discover</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: sc.textFaint }}>
            <span style={{ fontSize: '18px', lineHeight: 1 }}>💬</span>
            <span style={{ fontSize: '10.5px', fontWeight: '600' }}>Messages</span>
          </div>
          <Link href="/account" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: sc.textFaint }}>
            <span style={{ fontSize: '18px', lineHeight: 1 }}>👤</span>
            <span style={{ fontSize: '10.5px', fontWeight: '600' }}>My Profile</span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 860px) {
          .members-sidebar { display: none !important; }
          .members-bottom-nav { display: block !important; }
          .members-heading { display: none; }
          .members-filterbar {
            flex-wrap: nowrap !important;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 2px;
          }
          .members-filterbar::-webkit-scrollbar { display: none; }
          .members-filterbar > * { flex-shrink: 0; }
          .members-search { display: none !important; }
          .members-mobile-search { display: block !important; }
          .members-sort { margin-left: 0 !important; }
        }
      `}</style>
      <style jsx global>{`
        .member-card {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .member-card:hover {
          transform: translateY(-3px);
          box-shadow: ${sc.shadowHover};
        }
        @media (max-width: 860px) {
          body { padding-bottom: 62px; }
        }
      `}</style>
    </div>
  )
}
