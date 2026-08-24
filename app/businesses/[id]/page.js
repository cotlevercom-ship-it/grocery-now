'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabaseFetch, getSession } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import { sc } from '@/lib/memberTheme'
import AppSidebar from '@/components/AppSidebar'
import AppBottomNav from '@/components/AppBottomNav'
import VerifiedBadge from '@/components/VerifiedBadge'
import BusinessForm from '@/components/BusinessForm'

const STAGE_LABELS = {
  idea: 'Idea stage',
  mvp: 'MVP / Pre-launch',
  early_revenue: 'Early revenue',
  growth: 'Growth stage',
}

function Avatar({ profile, size = 40 }) {
  const initial = (profile?.display_name || '?').trim().charAt(0).toUpperCase()
  return (
    <div style={{
      width: `${size}px`, height: `${size}px`, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      background: theme.brass, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {profile?.photo_url ? (
        <img src={profile.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ fontFamily: theme.fontDisplay, fontSize: `${Math.round(size * 0.4)}px`, fontWeight: '600', color: '#FFFFFF' }}>{initial}</span>
      )}
    </div>
  )
}

export default function BusinessDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [biz, setBiz] = useState(null)
  const [owner, setOwner] = useState(null)
  const [editing, setEditing] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)

  // viewer (non-owner) state
  const [myInterest, setMyInterest] = useState(null) // { id, status } | null
  const [interestBusy, setInterestBusy] = useState(false)
  const [message, setMessage] = useState('')

  // owner state
  const [interests, setInterests] = useState([]) // [{id, status, investor_id, message, profile}]
  const [respondBusyId, setRespondBusyId] = useState(null)

  const isOwner = biz && userId && biz.owner_id === userId

  const load = useCallback(async (uid) => {
    setLoading(true)
    try {
      const rows = await supabaseFetch(`businesses?select=*&id=eq.${id}`)
      const b = rows?.[0]
      setBiz(b || null)
      if (!b) { setLoading(false); return }

      const ownerRows = await supabaseFetch(`member_profiles_public?select=user_id,display_name,photo_url,role_title,location,verified&user_id=eq.${b.owner_id}`)
      setOwner(ownerRows?.[0] || null)

      if (uid && b.owner_id === uid) {
        const ints = await supabaseFetch(`business_interests?select=id,status,investor_id,message,created_at&business_id=eq.${id}&order=created_at.desc`)
        const investorIds = [...new Set((ints || []).map(i => i.investor_id))]
        let profilesById = {}
        if (investorIds.length > 0) {
          const inList = investorIds.map(x => `"${x}"`).join(',')
          const profiles = await supabaseFetch(`member_profiles_public?select=user_id,display_name,photo_url,role_title,location,verified&user_id=in.(${inList})`)
          profilesById = Object.fromEntries((profiles || []).map(p => [p.user_id, p]))
        }
        setInterests((ints || []).map(i => ({ ...i, profile: profilesById[i.investor_id] })))
      } else if (uid) {
        const mine = await supabaseFetch(`business_interests?select=id,status&business_id=eq.${id}&investor_id=eq.${uid}`)
        setMyInterest(mine?.[0] || null)
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [id])

  useEffect(() => {
    const session = getSession()
    const uid = session?.user?.id
    if (!uid) { router.replace(`/login?next=/businesses/${id}`); return }
    setUserId(uid)
    load(uid)
  }, [id, router, load])

  const expressInterest = async () => {
    setInterestBusy(true)
    try {
      const rows = await supabaseFetch('business_interests', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ business_id: id, investor_id: userId, message: message.trim() || null }),
      })
      setMyInterest(rows?.[0] || { status: 'pending' })
    } catch (e) { console.error(e) }
    setInterestBusy(false)
  }

  const withdrawInterest = async () => {
    if (!myInterest?.id) return
    setInterestBusy(true)
    try {
      await supabaseFetch(`business_interests?id=eq.${myInterest.id}`, { method: 'DELETE' })
      setMyInterest(null)
    } catch (e) { console.error(e) }
    setInterestBusy(false)
  }

  const respond = async (interestId, status) => {
    setRespondBusyId(interestId)
    try {
      await supabaseFetch(`business_interests?id=eq.${interestId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, responded_at: new Date().toISOString() }),
      })
      setInterests(prev => prev.map(i => i.id === interestId ? { ...i, status } : i))
    } catch (e) { console.error(e) }
    setRespondBusyId(null)
  }

  const saveEdit = async (payload) => {
    setSavingEdit(true)
    try {
      await supabaseFetch(`businesses?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      setBiz(prev => ({ ...prev, ...payload }))
      setEditing(false)
    } finally {
      setSavingEdit(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: sc.bg }}>
        <AppSidebar active="businesses" />
        <div style={{ flex: 1, textAlign: 'center', padding: '60px 0', color: sc.textSoft, fontSize: '13.5px' }}>Loading…</div>
      </div>
    )
  }

  if (!biz) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: sc.bg }}>
        <AppSidebar active="businesses" />
        <div style={{ flex: 1, textAlign: 'center', padding: '60px 0', color: sc.textSoft, fontSize: '13.5px' }}>Business not found.</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: sc.bg }}>
      <AppSidebar active="businesses" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'clamp(20px,3vw,32px) clamp(16px,3vw,24px) 90px' }}>
          <Link href="/businesses" style={{ fontSize: '13px', color: sc.textSoft, textDecoration: 'none' }}>← Businesses</Link>

          {editing ? (
            <div style={{ marginTop: '18px', background: sc.cardBg, borderRadius: '14px', boxShadow: sc.shadow, padding: '20px' }}>
              <h2 style={{ fontFamily: theme.fontDisplay, fontWeight: '700', fontSize: '18px', color: sc.text, marginBottom: '16px' }}>Edit business</h2>
              <BusinessForm initial={biz} onSubmit={saveEdit} submitting={savingEdit} submitLabel="Save Changes" />
              <button type="button" onClick={() => setEditing(false)} style={{
                marginTop: '10px', background: 'none', border: 'none', color: sc.textSoft, fontSize: '13px', cursor: 'pointer',
              }}>Cancel</button>
            </div>
          ) : (
            <>
              <div style={{ marginTop: '18px', background: sc.cardBg, borderRadius: '14px', boxShadow: sc.shadow, padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0,
                    background: theme.brass, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {biz.photo_url ? (
                      <img src={biz.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontFamily: theme.fontDisplay, fontSize: '22px', fontWeight: '600', color: '#FFFFFF' }}>
                        {(biz.name || '?').trim().charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h1 style={{ fontFamily: theme.fontDisplay, fontWeight: '700', fontSize: '20px', color: sc.text }}>{biz.name}</h1>
                    {biz.industry && <div style={{ fontSize: '13px', color: sc.textSoft }}>{biz.industry}</div>}
                  </div>
                  {isOwner && (
                    <button type="button" onClick={() => setEditing(true)} style={{
                      marginLeft: 'auto', padding: '8px 14px', borderRadius: '8px', border: `1px solid ${sc.line}`,
                      background: 'transparent', color: sc.text, fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap',
                    }}>Edit</button>
                  )}
                </div>

                {biz.description && (
                  <p style={{ fontSize: '14px', color: sc.text, lineHeight: 1.6, marginBottom: '16px' }}>{biz.description}</p>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
                  {biz.stage && (
                    <span style={{ fontSize: '12px', fontWeight: '600', padding: '5px 11px', borderRadius: '999px', background: sc.chipBg, color: sc.chipText }}>
                      {STAGE_LABELS[biz.stage] || biz.stage}
                    </span>
                  )}
                  {biz.equity_percent && (
                    <span style={{ fontSize: '12px', fontWeight: '600', padding: '5px 11px', borderRadius: '999px', background: sc.industryChipBg, color: sc.industryChipText }}>
                      {biz.equity_percent}% equity offered
                    </span>
                  )}
                  {biz.valuation && (
                    <span style={{ fontSize: '12px', fontWeight: '600', padding: '5px 11px', borderRadius: '999px', background: sc.chipBg, color: sc.chipText }}>
                      Valuation {biz.valuation}
                    </span>
                  )}
                  {biz.funding_needed && (
                    <span style={{ fontSize: '12px', fontWeight: '600', padding: '5px 11px', borderRadius: '999px', background: sc.chipBg, color: sc.chipText }}>
                      Needs {biz.funding_needed}
                    </span>
                  )}
                  {isOwner && !biz.is_active && (
                    <span style={{ fontSize: '12px', fontWeight: '600', padding: '5px 11px', borderRadius: '999px', background: '#FDEDEA', color: '#C0392B' }}>
                      Hidden (inactive)
                    </span>
                  )}
                </div>

                {owner && (
                  <Link href={`/members/${owner.user_id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '10px', background: sc.bg }}>
                      <Avatar profile={owner} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13.5px', fontWeight: '700', color: sc.text }}>
                          {owner.display_name || 'Cot Lever member'}
                          {owner.verified && <VerifiedBadge size={13} />}
                        </div>
                        <div style={{ fontSize: '12px', color: sc.textSoft }}>{owner.role_title || 'Owner'}{owner.location ? ` · ${owner.location}` : ''}</div>
                      </div>
                    </div>
                  </Link>
                )}
              </div>

              {!isOwner && (
                <div style={{ marginTop: '14px', background: sc.cardBg, borderRadius: '14px', boxShadow: sc.shadow, padding: '20px' }}>
                  <h3 style={{ fontFamily: theme.fontDisplay, fontWeight: '700', fontSize: '15px', color: sc.text, marginBottom: '10px' }}>Interested?</h3>
                  {!myInterest ? (
                    <>
                      <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Add a short note (optional)…"
                        style={{
                          width: '100%', minHeight: '70px', padding: '11px 13px', borderRadius: '9px', border: `1px solid ${sc.line}`,
                          background: sc.bg, fontSize: '13.5px', color: sc.text, outline: 'none', boxSizing: 'border-box', resize: 'vertical', marginBottom: '10px',
                        }}
                      />
                      <button type="button" onClick={expressInterest} disabled={interestBusy} style={{
                        padding: '11px 16px', borderRadius: '9px', border: 'none', background: theme.brass, color: '#FFFFFF',
                        fontSize: '13.5px', fontWeight: '700', cursor: interestBusy ? 'default' : 'pointer', opacity: interestBusy ? 0.7 : 1,
                      }}>{interestBusy ? 'Sending…' : '💼 Express Interest'}</button>
                    </>
                  ) : myInterest.status === 'pending' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', color: sc.textSoft }}>✓ Interest sent — awaiting response.</span>
                      <button type="button" onClick={withdrawInterest} disabled={interestBusy} style={{
                        padding: '7px 12px', borderRadius: '8px', border: `1px solid ${sc.line}`, background: 'transparent',
                        color: sc.textSoft, fontSize: '12.5px', fontWeight: '600', cursor: 'pointer',
                      }}>Withdraw</button>
                    </div>
                  ) : myInterest.status === 'accepted' ? (
                    <div style={{ fontSize: '13px', color: theme.signal || '#2F7A50' }}>
                      🤝 Accepted! You can now message {owner?.display_name || 'the owner'} directly.
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: sc.textSoft }}>This owner declined your interest request.</div>
                  )}
                </div>
              )}

              {isOwner && (
                <div style={{ marginTop: '14px', background: sc.cardBg, borderRadius: '14px', boxShadow: sc.shadow, padding: '20px' }}>
                  <h3 style={{ fontFamily: theme.fontDisplay, fontWeight: '700', fontSize: '15px', color: sc.text, marginBottom: '14px' }}>
                    Interested investors {interests.length > 0 ? `(${interests.length})` : ''}
                  </h3>
                  {interests.length === 0 ? (
                    <div style={{ fontSize: '13px', color: sc.textSoft }}>No interest yet. Share your listing to get discovered.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {interests.map(i => (
                        <div key={i.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', borderRadius: '10px', background: sc.bg }}>
                          <Avatar profile={i.profile} size={36} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Link href={`/members/${i.investor_id}`} style={{ textDecoration: 'none' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13.5px', fontWeight: '700', color: sc.text }}>
                                {i.profile?.display_name || 'Cot Lever member'}
                                {i.profile?.verified && <VerifiedBadge size={12} />}
                              </div>
                            </Link>
                            {i.message && <div style={{ fontSize: '12.5px', color: sc.textSoft, marginTop: '2px' }}>{i.message}</div>}
                          </div>
                          {i.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                              <button type="button" onClick={() => respond(i.id, 'accepted')} disabled={respondBusyId === i.id} style={{
                                padding: '6px 11px', borderRadius: '7px', border: 'none', background: theme.brass, color: '#FFFFFF',
                                fontSize: '11.5px', fontWeight: '700', cursor: 'pointer',
                              }}>Accept</button>
                              <button type="button" onClick={() => respond(i.id, 'declined')} disabled={respondBusyId === i.id} style={{
                                padding: '6px 11px', borderRadius: '7px', border: `1px solid ${sc.line}`, background: 'transparent',
                                color: sc.textSoft, fontSize: '11.5px', fontWeight: '600', cursor: 'pointer',
                              }}>Decline</button>
                            </div>
                          ) : (
                            <span style={{
                              fontSize: '11px', fontWeight: '700', padding: '4px 9px', borderRadius: '999px', flexShrink: 0,
                              background: i.status === 'accepted' ? sc.industryChipBg : sc.chipBg,
                              color: i.status === 'accepted' ? theme.brass : sc.chipText,
                            }}>{i.status === 'accepted' ? 'Accepted' : 'Declined'}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <AppBottomNav active="businesses" />
    </div>
  )
}
