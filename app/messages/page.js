'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { getSession, supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import { sc } from '@/lib/memberTheme'
import AppSidebar from '@/components/AppSidebar'
import AppBottomNav from '@/components/AppBottomNav'

function timeAgo(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d`
  return new Date(iso).toLocaleDateString()
}

function Avatar({ profile, size = 44 }) {
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

export default function MessagesInboxPage() {
  const [myUserId, setMyUserId] = useState(null)
  const [conversations, setConversations] = useState([])
  const [profilesById, setProfilesById] = useState({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (uid) => {
    setLoading(true)
    try {
      const rows = await supabaseFetch(
        `messages?select=*&or=(sender_id.eq.${uid},recipient_id.eq.${uid})&order=created_at.desc&limit=500`
      )

      const byOther = new Map()
      for (const m of (rows || [])) {
        const otherId = m.sender_id === uid ? m.recipient_id : m.sender_id
        if (!byOther.has(otherId)) {
          byOther.set(otherId, { otherId, lastMessage: m, unreadCount: 0 })
        }
        const entry = byOther.get(otherId)
        if (m.recipient_id === uid && !m.read) entry.unreadCount += 1
      }
      const list = [...byOther.values()].sort((a, b) => new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at))
      setConversations(list)

      const otherIds = list.map(c => c.otherId)
      if (otherIds.length > 0) {
        const inList = otherIds.map(id => `"${id}"`).join(',')
        const profiles = await supabaseFetch(`member_profiles_public?select=user_id,display_name,photo_url&user_id=in.(${inList})`)
        const map = {}
        for (const p of (profiles || [])) map[p.user_id] = p
        setProfilesById(map)
      } else {
        setProfilesById({})
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const session = getSession()
    const uid = session?.user?.id || null
    setMyUserId(uid)
    if (uid) load(uid)
    else setLoading(false)
  }, [load])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: sc.bg }}>
      <AppSidebar active="messages" />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'clamp(20px,3vw,40px) clamp(16px,3vw,24px)' }}>
          <h1 style={{
            fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(22px,2.6vw,28px)',
            color: sc.text, marginBottom: '18px', letterSpacing: '-0.01em'
          }}>Messages</h1>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: sc.textSoft, fontSize: '14px' }}>Loading…</div>
          ) : conversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: sc.textSoft, fontSize: '14px' }}>
              No conversations yet — message someone from their profile.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: sc.cardBg, borderRadius: '14px', boxShadow: sc.shadow, overflow: 'hidden' }}>
              {conversations.map(c => {
                const profile = profilesById[c.otherId]
                const isMine = c.lastMessage.sender_id === myUserId
                return (
                  <Link
                    key={c.otherId}
                    href={`/messages/${c.otherId}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                      textDecoration: 'none', borderBottom: `1px solid ${sc.line}`,
                      background: c.unreadCount > 0 ? 'rgba(179,55,42,0.04)' : 'transparent',
                    }}
                  >
                    <Avatar profile={profile} size={44} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ fontSize: '14.5px', fontWeight: c.unreadCount > 0 ? '700' : '600', color: sc.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {profile?.display_name || 'Cot Lever member'}
                        </span>
                        <span style={{ fontSize: '11.5px', color: sc.textFaint, flexShrink: 0 }}>{timeAgo(c.lastMessage.created_at)}</span>
                      </div>
                      <div style={{
                        fontSize: '13px', color: c.unreadCount > 0 ? sc.text : sc.textSoft,
                        fontWeight: c.unreadCount > 0 ? '600' : '400',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px',
                      }}>
                        {isMine ? 'You: ' : ''}{c.lastMessage.content}
                      </div>
                    </div>
                    {c.unreadCount > 0 && (
                      <span style={{
                        minWidth: '18px', height: '18px', borderRadius: '999px', background: theme.brass, color: '#FFFFFF',
                        fontSize: '10.5px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 4px', flexShrink: 0,
                      }}>{c.unreadCount > 9 ? '9+' : c.unreadCount}</span>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <AppBottomNav active="messages" />

      <style jsx global>{`
        @media (max-width: 860px) {
          body { padding-bottom: 62px; }
        }
      `}</style>
    </div>
  )
}
