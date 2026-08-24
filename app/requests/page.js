'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import { sc } from '@/lib/memberTheme'
import AppSidebar from '@/components/AppSidebar'
import AppBottomNav from '@/components/AppBottomNav'
import VerifiedBadge from '@/components/VerifiedBadge'

function Avatar({ profile, size = 46 }) {
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

export default function RequestsPage() {
  const router = useRouter()
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('received') // 'received' | 'sent'
  const [received, setReceived] = useState([])
  const [sent, setSent] = useState([])
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async (uid) => {
    setLoading(true)
    try {
      const rows = await supabaseFetch(
        `connections?select=id,status,requester_id,addressee_id,created_at&status=eq.pending&or=(requester_id.eq.${uid},addressee_id.eq.${uid})&order=created_at.desc`
      )
      const recv = (rows || []).filter(r => r.addressee_id === uid)
      const snt = (rows || []).filter(r => r.requester_id === uid)

      const otherIds = [...new Set([...recv.map(r => r.requester_id), ...snt.map(r => r.addressee_id)])]
      let profilesById = {}
      if (otherIds.length > 0) {
        const inList = otherIds.map(id => `"${id}"`).join(',')
        const profiles = await supabaseFetch(`member_profiles_public?select=user_id,display_name,photo_url,role_title,location,verified&user_id=in.(${inList})`)
        profilesById = Object.fromEntries((profiles || []).map(p => [p.user_id, p]))
      }

      setReceived(recv.map(r => ({ ...r, profile: profilesById[r.requester_id] })))
      setSent(snt.map(r => ({ ...r, profile: profilesById[r.addressee_id] })))
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [])

  useEffect(() => {
    const session = getSession()
    const uid = session?.user?.id
    if (!uid) { router.replace('/login?next=/requests'); return }
    setUserId(uid)
    load(uid)
  }, [router, load])

  const accept = async (id) => {
    setBusyId(id)
    try {
      await supabaseFetch(`connections?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'accepted', responded_at: new Date().toISOString() }),
      })
      await load(userId)
    } catch (e) { console.error(e) }
    setBusyId(null)
  }

  const remove = async (id) => {
    setBusyId(id)
    try {
      await supabaseFetch(`connections?id=eq.${id}`, { method: 'DELETE' })
      await load(userId)
    } catch (e) { console.error(e) }
    setBusyId(null)
  }

  const list = tab === 'received' ? received : sent

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: sc.bg }}>
      <AppSidebar active="requests" />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'clamp(20px,3vw,32px) clamp(16px,3vw,24px) 70px' }}>
          <h1 style={{ fontFamily: theme.fontDisplay, fontWeight: '700', fontSize: '24px', color: sc.text, marginBottom: '4px' }}>Meet Requests</h1>
          <p style={{ fontSize: '13.5px', color: sc.textSoft, marginBottom: '20px' }}>Connection requests you&apos;ve sent and received.</p>

          <div style={{ display: 'inline-flex', background: sc.cardBg, border: `1px solid ${sc.line}`, borderRadius: '999px', padding: '4px', marginBottom: '20px' }}>
            <button type="button" onClick={() => setTab('received')} style={{
              border: 'none', borderRadius: '999px', padding: '8px 18px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
              background: tab === 'received' ? theme.brass : 'transparent', color: tab === 'received' ? '#FFFFFF' : sc.textSoft,
            }}>Received {received.length > 0 && `(${received.length})`}</button>
            <button type="button" onClick={() => setTab('sent')} style={{
              border: 'none', borderRadius: '999px', padding: '8px 18px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
              background: tab === 'sent' ? theme.brass : 'transparent', color: tab === 'sent' ? '#FFFFFF' : sc.textSoft,
            }}>Sent {sent.length > 0 && `(${sent.length})`}</button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: sc.textSoft, fontSize: '13.5px' }}>Loading…</div>
          ) : list.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: sc.textSoft, fontSize: '13.5px' }}>
              {tab === 'received' ? 'No pending requests.' : 'You haven\u2019t sent any requests yet.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {list.map(r => (
                <div key={r.id} style={{
                  background: sc.cardBg, borderRadius: '12px', boxShadow: sc.shadow, padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                  <Link href={`/members/${r.profile?.user_id || ''}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0, textDecoration: 'none' }}>
                    <Avatar profile={r.profile} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14.5px', fontWeight: '700', color: sc.text }}>
                        {r.profile?.display_name || 'Cot Lever member'}
                        {r.profile?.verified && <VerifiedBadge size={13} />}
                      </div>
                      <div style={{ fontSize: '12px', color: sc.textSoft }}>{[r.profile?.role_title, r.profile?.location].filter(Boolean).join(' · ')}</div>
                    </div>
                  </Link>
                  {tab === 'received' ? (
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button type="button" onClick={() => accept(r.id)} disabled={busyId === r.id} style={{
                        background: theme.brass, color: '#FFFFFF', border: 'none', borderRadius: '8px',
                        padding: '8px 14px', fontSize: '12.5px', fontWeight: '700', cursor: busyId === r.id ? 'default' : 'pointer',
                      }}>Accept</button>
                      <button type="button" onClick={() => remove(r.id)} disabled={busyId === r.id} style={{
                        background: 'transparent', color: sc.textSoft, border: `1px solid ${sc.line}`, borderRadius: '8px',
                        padding: '8px 14px', fontSize: '12.5px', fontWeight: '700', cursor: busyId === r.id ? 'default' : 'pointer',
                      }}>Decline</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => remove(r.id)} disabled={busyId === r.id} style={{
                      background: 'transparent', color: sc.textSoft, border: `1px solid ${sc.line}`, borderRadius: '8px',
                      padding: '8px 14px', fontSize: '12.5px', fontWeight: '700', cursor: busyId === r.id ? 'default' : 'pointer', flexShrink: 0,
                    }}>Cancel</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AppBottomNav active="requests" />

      <style jsx global>{`
        @media (max-width: 860px) {
          body { padding-bottom: 62px; }
        }
      `}</style>
    </div>
  )
}
