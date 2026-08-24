'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { getSession, supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'

function timeAgo(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

function messageFor(n, actorName) {
  const name = actorName || 'Someone'
  if (n.type === 'like') return `${name} liked your post`
  if (n.type === 'comment') return `${name} commented on your post`
  if (n.type === 'reply') return `${name} replied to your comment`
  if (n.type === 'message') return `${name} sent you a message`
  if (n.type === 'connect_request') return `${name} sent you a connect request`
  return `${name} interacted with your post`
}

function linkFor(n) {
  if (n.type === 'message') return `/messages/${n.actor_id}`
  if (n.type === 'connect_request') return '/requests'
  return '/feed'
}

export default function NotificationBell() {
  const [session, setSession] = useState(null)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [profilesById, setProfilesById] = useState({})
  const [unreadCount, setUnreadCount] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    setSession(getSession())
    const onAuthChanged = () => setSession(getSession())
    window.addEventListener('auth-changed', onAuthChanged)
    window.addEventListener('storage', onAuthChanged)
    return () => {
      window.removeEventListener('auth-changed', onAuthChanged)
      window.removeEventListener('storage', onAuthChanged)
    }
  }, [])

  const refreshUnreadCount = useCallback(async (uid) => {
    if (!uid) { setUnreadCount(0); return }
    try {
      const rows = await supabaseFetch(`notifications?select=id&recipient_id=eq.${uid}&read=eq.false`)
      setUnreadCount((rows || []).length)
    } catch (e) { console.error(e) }
  }, [])

  useEffect(() => {
    const uid = session?.user?.id
    if (!uid) { setUnreadCount(0); return }
    refreshUnreadCount(uid)
    const interval = setInterval(() => refreshUnreadCount(uid), 60000)
    return () => clearInterval(interval)
  }, [session?.user?.id, refreshUnreadCount])

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const loadNotifications = useCallback(async (uid) => {
    try {
      const rows = await supabaseFetch(`notifications?select=*&recipient_id=eq.${uid}&order=created_at.desc&limit=25`)
      setNotifications(rows || [])

      const actorIds = [...new Set((rows || []).map(n => n.actor_id))]
      if (actorIds.length > 0) {
        const inList = actorIds.map(id => `"${id}"`).join(',')
        const profiles = await supabaseFetch(`member_profiles_public?select=user_id,display_name&user_id=in.(${inList})`)
        const map = {}
        for (const p of (profiles || [])) map[p.user_id] = p
        setProfilesById(map)
      } else {
        setProfilesById({})
      }

      const unreadIds = (rows || []).filter(n => !n.read).map(n => n.id)
      if (unreadIds.length > 0) {
        const inList = unreadIds.map(id => `"${id}"`).join(',')
        await supabaseFetch(`notifications?id=in.(${inList})`, {
          method: 'PATCH',
          body: JSON.stringify({ read: true }),
        })
        setUnreadCount(0)
      }
    } catch (e) {
      console.error(e)
    }
    setLoaded(true)
  }, [])

  const handleToggle = () => {
    const next = !open
    setOpen(next)
    const uid = session?.user?.id
    if (next && uid) loadNotifications(uid)
  }

  if (!session) return null

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={handleToggle}
        aria-label="Notifications"
        style={{
          position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '34px', height: '34px', background: theme.surface, border: `1px solid ${theme.line}`,
          borderRadius: '7px', cursor: 'pointer', flexShrink: 0,
        }}
      >
        <span style={{ fontSize: '15px', lineHeight: 1 }}>🔔</span>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px', minWidth: '16px', height: '16px',
            borderRadius: '999px', background: theme.brass, color: '#FFFFFF', fontSize: '10px', fontWeight: '700',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
          }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '300px', maxHeight: '380px',
          overflowY: 'auto', background: theme.surface, borderRadius: '10px',
          boxShadow: '0 4px 16px rgba(20,33,61,0.12)', zIndex: 50, border: `1px solid ${theme.line}`,
        }}>
          {!loaded ? (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: theme.inkSoft }}>Loading…</div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: theme.inkSoft }}>No notifications yet</div>
          ) : (
            notifications.map(n => (
              <Link
                key={n.id}
                href={linkFor(n)}
                onClick={() => setOpen(false)}
                style={{
                  display: 'block', padding: '11px 14px', borderBottom: `1px solid ${theme.line}`,
                  textDecoration: 'none', color: theme.ink,
                }}
              >
                <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
                  {messageFor(n, profilesById[n.actor_id]?.display_name)}
                </div>
                <div style={{ fontSize: '11px', color: theme.inkSoft, marginTop: '2px' }}>{timeAgo(n.created_at)} ago</div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
