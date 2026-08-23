'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseFetch, getSession } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import { sc } from '@/lib/memberTheme'
import VerifiedBadge from '@/components/VerifiedBadge'
import AppSidebar from '@/components/AppSidebar'
import AppBottomNav from '@/components/AppBottomNav'

function FilterIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
  )
}


const PAGE_SIZE_OPTIONS = [6, 12, 24]
const SORT_OPTIONS = [
  { key: 'relevant', label: 'Most Relevant' },
  { key: 'newest', label: 'Newest' },
  { key: 'az', label: 'Name A-Z' },
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
  const router = useRouter()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [myUserId, setMyUserId] = useState(null)
  const [myProfile, setMyProfile] = useState(null)
  const [connectionsMap, setConnectionsMap] = useState({}) // otherUserId -> {id, status, requester_id}
  const [connBusyId, setConnBusyId] = useState(null)
  const [bookmarksMap, setBookmarksMap] = useState({}) // otherUserId -> bookmarkId
  const [bookmarkBusyId, setBookmarkBusyId] = useState(null)

  const searchParams = useSearchParams()
  const [search, setSearch] = useState('')
  const [openDropdown, setOpenDropdown] = useState(null) // 'filters' | 'sort' | null

  const [locationFilter, setLocationFilter] = useState('')
  const [sortBy, setSortBy] = useState('relevant')

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)

  // Pick up ?q= and ?skill= from links elsewhere on the site (e.g. the
  // homepage hero search box and quick-role chips) as initial filter state.
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) setSearch(q)
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
        try {
          const conns = await supabaseFetch(`connections?select=id,status,requester_id,addressee_id&or=(requester_id.eq.${uid},addressee_id.eq.${uid})`)
          const map = {}
          ;(conns || []).forEach(c => {
            const otherId = c.requester_id === uid ? c.addressee_id : c.requester_id
            map[otherId] = c
          })
          setConnectionsMap(map)
        } catch (e) { console.error(e) }
        try {
          const marks = await supabaseFetch(`bookmarks?select=id,bookmarked_user_id&user_id=eq.${uid}`)
          const map = {}
          ;(marks || []).forEach(b => { map[b.bookmarked_user_id] = b.id })
          setBookmarksMap(map)
        } catch (e) { console.error(e) }
      }
    }
    load()
  }, [])

  const activeFilterCount = [locationFilter.trim()].filter(Boolean).length

  const sendConnect = async (targetId) => {
    if (!myUserId) return
    setConnBusyId(targetId)
    try {
      const rows = await supabaseFetch('connections', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ requester_id: myUserId, addressee_id: targetId }),
      })
      const conn = rows?.[0] || { status: 'pending', requester_id: myUserId }
      setConnectionsMap(prev => ({ ...prev, [targetId]: conn }))
    } catch (e) { console.error(e) }
    setConnBusyId(null)
  }

  const cancelConnect = async (conn, targetId) => {
    if (!conn?.id) return
    setConnBusyId(targetId)
    try {
      await supabaseFetch(`connections?id=eq.${conn.id}`, { method: 'DELETE' })
      setConnectionsMap(prev => {
        const next = { ...prev }
        delete next[targetId]
        return next
      })
    } catch (e) { console.error(e) }
    setConnBusyId(null)
  }

  const respondConnect = async (conn, accept, targetId) => {
    if (!conn?.id) return
    setConnBusyId(targetId)
    try {
      if (accept) {
        await supabaseFetch(`connections?id=eq.${conn.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'accepted', responded_at: new Date().toISOString() }),
        })
        setConnectionsMap(prev => ({ ...prev, [targetId]: { ...conn, status: 'accepted' } }))
      } else {
        await supabaseFetch(`connections?id=eq.${conn.id}`, { method: 'DELETE' })
        setConnectionsMap(prev => {
          const next = { ...prev }
          delete next[targetId]
          return next
        })
      }
    } catch (e) { console.error(e) }
    setConnBusyId(null)
  }

  const toggleBookmark = async (targetId) => {
    if (!myUserId) return
    setBookmarkBusyId(targetId)
    try {
      const existingId = bookmarksMap[targetId]
      if (existingId) {
        await supabaseFetch(`bookmarks?id=eq.${existingId}`, { method: 'DELETE' })
        setBookmarksMap(prev => {
          const next = { ...prev }
          delete next[targetId]
          return next
        })
      } else {
        const rows = await supabaseFetch('bookmarks', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({ user_id: myUserId, bookmarked_user_id: targetId }),
        })
        setBookmarksMap(prev => ({ ...prev, [targetId]: rows?.[0]?.id }))
      }
    } catch (e) { console.error(e) }
    setBookmarkBusyId(null)
  }

  const clearAll = () => {
    setLocationFilter('')
    setSearch('')
    setPage(1)
  }

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return members.filter(m => {
      const locationMatch = !locationFilter.trim() || (m.location || '').toLowerCase().includes(locationFilter.trim().toLowerCase())
      const searchMatch = !q || [
        m.display_name, m.location, m.bio, m.role_title,
        ...(Array.isArray(m.skills) ? m.skills : []),
      ].filter(Boolean).some(v => v.toLowerCase().includes(q))
      return locationMatch && searchMatch
    })
  }, [members, search, locationFilter])

  // "Most Relevant" gives a small bonus for a location text match. With no
  // filters active it's identical to "Newest" (members already come from
  // Supabase ordered by updated_at desc, so relative order is preserved).
  const relevanceScore = (m) => {
    let score = 0
    if (locationFilter.trim() && (m.location || '').toLowerCase().includes(locationFilter.trim().toLowerCase())) score += 1
    return score
  }

  const sortedMembers = useMemo(() => {
    const list = [...filteredMembers]
    if (sortBy === 'az') {
      list.sort((a, b) => (a.display_name || '').localeCompare(b.display_name || ''))
    } else if (sortBy === 'newest') {
      // already in updated_at desc order from the fetch — no-op
    } else {
      // relevant: stable-sort by score desc, ties keep the existing (newest) order
      list.sort((a, b) => relevanceScore(b) - relevanceScore(a))
    }
    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredMembers, sortBy, locationFilter])

  useEffect(() => { setPage(1) }, [search, locationFilter, pageSize, sortBy])

  const totalPages = Math.max(1, Math.ceil(sortedMembers.length / pageSize))
  const pageStart = (page - 1) * pageSize
  const pagedMembers = sortedMembers.slice(pageStart, pageStart + pageSize)

  const toggleDropdown = (key) => setOpenDropdown(prev => prev === key ? null : key)
  const filterDropdownRef = useRef(null)
  const sortDropdownRef = useRef(null)

  useEffect(() => {
    if (!openDropdown) return
    const handleClickOutside = (e) => {
      const ref = openDropdown === 'filters' ? filterDropdownRef : openDropdown === 'sort' ? sortDropdownRef : null
      if (ref && ref.current && !ref.current.contains(e.target)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdown])
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
            const skillsList = Array.isArray(m.skills) ? m.skills.filter(Boolean) : []
            const conn = connectionsMap[m.user_id]
            const isBookmarked = !!bookmarksMap[m.user_id]
            const incomingRequest = conn?.status === 'pending' && conn.requester_id !== myUserId
            return (
              <div
                key={m.user_id}
                onClick={() => router.push(`/members/${m.user_id}`)}
                className="member-card"
                style={{
                  background: sc.cardBg, borderRadius: '16px', border: `1px solid ${sc.line}`,
                  display: 'flex', flexDirection: 'column', padding: '20px', position: 'relative', cursor: 'pointer',
                }}
              >
                {myUserId && myUserId !== m.user_id && (
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); toggleBookmark(m.user_id) }}
                    disabled={bookmarkBusyId === m.user_id}
                    aria-label="Bookmark"
                    style={{
                      position: 'absolute', top: '16px', right: '16px', width: '30px', height: '30px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px',
                      background: 'transparent', border: 'none', color: isBookmarked ? theme.brass : sc.textFaint,
                      fontSize: '16px', cursor: bookmarkBusyId === m.user_id ? 'default' : 'pointer',
                    }}
                  >{isBookmarked ? '🔖' : '📑'}</button>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '13px', marginBottom: '4px', paddingRight: '30px' }}>
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                    background: theme.brass, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {m.photo_url ? (
                      <img src={m.photo_url} alt={m.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontFamily: theme.fontDisplay, fontSize: '22px', fontWeight: '600', color: '#FFFFFF' }}>{initial}</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: theme.fontDisplay, fontSize: '16px', fontWeight: '700', color: sc.text, lineHeight: '1.25' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.display_name}</span>
                      {m.verified && <VerifiedBadge />}
                    </div>
                    {m.role_title && (
                      <div style={{ fontSize: '12.5px', color: theme.brass, fontWeight: '600', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.role_title}
                      </div>
                    )}
                    <div style={{ fontSize: '12px', color: sc.textSoft, marginTop: '2px' }}>
                      📍 {m.location || 'Location not specified'}
                    </div>
                  </div>
                </div>

                {skillsList.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '12px' }}>
                    {skillsList.slice(0, 3).map(s => (
                      <span key={s} style={{
                        fontSize: '11px', fontWeight: '600', color: sc.chipText, background: sc.chipBg,
                        borderRadius: '999px', padding: '3px 9px',
                      }}>{s}</span>
                    ))}
                    {skillsList.length > 3 && (
                      <span style={{ fontSize: '11px', color: sc.textFaint, padding: '3px 2px' }}>+{skillsList.length - 3}</span>
                    )}
                  </div>
                )}

                {m.bio && (
                  <div style={{
                    fontSize: '12.5px', color: sc.text, marginTop: '10px', lineHeight: '1.5',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>{m.bio}</div>
                )}

                {myUserId !== m.user_id && (
                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                    {incomingRequest ? (
                      <>
                        <button
                          type="button" onClick={() => respondConnect(conn, true, m.user_id)} disabled={connBusyId === m.user_id}
                          style={{
                            flex: 1.3, textAlign: 'center', background: theme.brass, color: '#FFFFFF', fontFamily: theme.fontBody,
                            border: 'none', borderRadius: '999px', padding: '10px 12px', fontSize: '13px', fontWeight: '700',
                            cursor: connBusyId === m.user_id ? 'default' : 'pointer',
                          }}
                        >Accept</button>
                        <button
                          type="button" onClick={() => respondConnect(conn, false, m.user_id)} disabled={connBusyId === m.user_id}
                          style={{
                            flex: 1, textAlign: 'center', background: 'transparent', color: sc.textSoft, fontFamily: theme.fontBody,
                            border: `1px solid ${sc.line}`, borderRadius: '999px', padding: '10px 12px', fontSize: '13px', fontWeight: '700',
                            cursor: connBusyId === m.user_id ? 'default' : 'pointer',
                          }}
                        >Decline</button>
                      </>
                    ) : (
                      <>
                        {!conn && (
                          <button
                            type="button" onClick={() => sendConnect(m.user_id)} disabled={connBusyId === m.user_id}
                            style={{
                              flex: 1.3, textAlign: 'center', background: theme.brass, color: '#FFFFFF', fontFamily: theme.fontBody,
                              border: 'none', borderRadius: '999px', padding: '10px 12px', fontSize: '13px', fontWeight: '700',
                              cursor: connBusyId === m.user_id ? 'default' : 'pointer',
                            }}
                          >Connect</button>
                        )}
                        {conn?.status === 'pending' && conn.requester_id === myUserId && (
                          <button
                            type="button" onClick={() => cancelConnect(conn, m.user_id)} disabled={connBusyId === m.user_id}
                            style={{
                              flex: 1.3, textAlign: 'center', background: 'transparent', color: sc.textSoft, fontFamily: theme.fontBody,
                              border: `1px solid ${sc.line}`, borderRadius: '999px', padding: '10px 12px', fontSize: '13px', fontWeight: '700',
                              cursor: connBusyId === m.user_id ? 'default' : 'pointer',
                            }}
                          >Request Sent</button>
                        )}
                        {conn?.status === 'accepted' && (
                          <button
                            type="button" disabled
                            style={{
                              flex: 1.3, textAlign: 'center', background: '#E9F5EE', color: '#2F7A50', fontFamily: theme.fontBody,
                              border: 'none', borderRadius: '999px', padding: '10px 12px', fontSize: '13px', fontWeight: '700',
                            }}
                          >✓ Connected</button>
                        )}
                        <Link
                          href={`/members/${m.user_id}`}
                          style={{
                            flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'transparent', color: sc.text, fontFamily: theme.fontBody,
                            border: `1px solid ${sc.line}`, borderRadius: '999px', padding: '10px 12px', fontSize: '13px', fontWeight: '700',
                            textDecoration: 'none',
                          }}
                        >View Profile</Link>
                      </>
                    )}
                  </div>
                )}
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
      <div style={{ position: 'relative' }} ref={filterDropdownRef}>
        <button
          type="button"
          onClick={() => toggleDropdown('filters')}
          style={{
            position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '38px', height: '38px', background: sc.cardBg,
            border: `1px solid ${activeFilterCount > 0 ? theme.brass : sc.line}`, borderRadius: '999px',
            fontSize: '16px', cursor: 'pointer',
          }}
          aria-label="Filters"
        >
          <FilterIcon size={16} color={sc.text} />
          {activeFilterCount > 0 && (
            <span style={{
              position: 'absolute', top: '-3px', right: '-3px', minWidth: '15px', height: '15px', borderRadius: '999px',
              background: theme.brass, color: '#FFFFFF', fontSize: '9px', fontWeight: '700',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
            }}>{activeFilterCount}</span>
          )}
        </button>

        {openDropdown === 'filters' && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 20, width: '280px',
            background: sc.cardBg, borderRadius: '14px', boxShadow: sc.shadowHover,
            border: `1px solid ${sc.line}`, padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13.5px', fontWeight: '700', color: sc.text }}>Filters</span>
              <button
                type="button" onClick={() => setOpenDropdown(null)} aria-label="Close filters"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px',
                  border: 'none', borderRadius: '999px', background: sc.chipBg, color: sc.textSoft, cursor: 'pointer', fontSize: '13px',
                }}
              >✕</button>
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: sc.textSoft, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>📍 Location</div>
              <input
                type="text" value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
                placeholder="e.g. Dhaka"
                style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${sc.line}`, borderRadius: '8px', padding: '9px 12px', fontSize: '13.5px', fontFamily: theme.fontBody }}
              />
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button" onClick={clearAll}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none',
                  color: sc.textSoft, fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: '4px', fontFamily: theme.fontBody,
                  alignSelf: 'flex-start',
                }}
              ><span>✕</span> Clear all</button>
            )}
          </div>
        )}
      </div>

      <div className="members-sort" style={{ marginLeft: 'auto', position: 'relative' }} ref={sortDropdownRef}>
        <button
          type="button"
          onClick={() => toggleDropdown('sort')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600',
            color: sc.text, border: `1px solid ${sc.line}`, borderRadius: '999px', padding: '9px 14px',
            background: sc.cardBg, cursor: 'pointer', fontFamily: theme.fontBody, whiteSpace: 'nowrap',
          }}
        >
          {SORT_OPTIONS.find(o => o.key === sortBy)?.label}
          <span style={{ fontSize: '10px', transform: openDropdown === 'sort' ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', display: 'inline-block' }}>▾</span>
        </button>
        {openDropdown === 'sort' && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 20, minWidth: '170px',
            background: sc.cardBg, borderRadius: '12px', boxShadow: sc.shadowHover,
            border: `1px solid ${sc.line}`, padding: '6px',
          }}>
            {SORT_OPTIONS.map(o => (
              <button
                key={o.key} type="button"
                onClick={() => { setSortBy(o.key); setOpenDropdown(null) }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '9px 10px', borderRadius: '8px',
                  border: 'none', cursor: 'pointer', fontSize: '13.5px', fontFamily: theme.fontBody,
                  fontWeight: sortBy === o.key ? '700' : '500',
                  background: sortBy === o.key ? sc.industryChipBg : 'transparent',
                  color: sortBy === o.key ? theme.brass : sc.text,
                }}
              >{o.label}</button>
            ))}
          </div>
        )}
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
              placeholder="Search by name, location or keyword…"
              style={{
                width: '100%', boxSizing: 'border-box', border: `1px solid ${sc.line}`, borderRadius: '14px',
                padding: '13px 44px 13px 42px', fontSize: '14px', fontFamily: theme.fontBody, background: sc.cardBg, color: sc.text,
                boxShadow: sc.shadow,
              }}
            />
            <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: sc.textFaint, display: 'flex' }}><FilterIcon size={15} color={sc.textFaint} /></span>
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
      <AppSidebar active="discover" />

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ padding: 'clamp(20px,3vw,40px)', paddingBottom: 'clamp(20px,3vw,40px)' }}>
          <h1 className="members-heading" style={{
            fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(22px,2.6vw,30px)',
            color: sc.text, marginBottom: '6px', letterSpacing: '-0.01em'
          }}>Find a Partner</h1>
          <p className="members-heading" style={{ fontSize: '14px', color: sc.textSoft, marginBottom: '22px' }}>
            Browse founders looking for a co-founder, partner, or share holder.
          </p>

          <div style={{ position: 'relative', marginBottom: '14px', maxWidth: '440px' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: sc.textFaint }}>🔍</span>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, location or keyword…"
              style={{
                width: '100%', boxSizing: 'border-box', border: `1px solid ${sc.line}`, borderRadius: '14px',
                padding: '13px 44px 13px 42px', fontSize: '14px', fontFamily: theme.fontBody, background: sc.cardBg, color: sc.text,
                boxShadow: sc.shadow,
              }}
            />
            <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: sc.textFaint, display: 'flex' }}><FilterIcon size={15} color={sc.textFaint} /></span>
          </div>

          {filterBar}
          {cardGrid}
        </div>
      </div>

      <AppBottomNav active="discover" />

      <style jsx>{`
        @media (max-width: 860px) {
          .members-heading { display: none; }
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
        @media (max-width: 860px) {
          body { padding-bottom: 62px; }
        }
      `}</style>
    </div>
  )
}
