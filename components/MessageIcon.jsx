'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { getSession, supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'

export default function MessageIcon() {
  const [session, setSession] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

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
      const rows = await supabaseFetch(`messages?select=id&recipient_id=eq.${uid}&read=eq.false`)
      setUnreadCount((rows || []).length)
    } catch (e) { console.error(e) }
  }, [])

  useEffect(() => {
    const uid = session?.user?.id
    if (!uid) { setUnreadCount(0); return }
    refreshUnreadCount(uid)
    const interval = setInterval(() => refreshUnreadCount(uid), 30000)
    return () => clearInterval(interval)
  }, [session?.user?.id, refreshUnreadCount])

  if (!session) return null

  return (
    <Link
      href="/messages"
      aria-label="Messages"
      style={{
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '34px', height: '34px', background: theme.surface, border: `1px solid ${theme.line}`,
        borderRadius: '7px', flexShrink: 0, textDecoration: 'none',
      }}
    >
      <span style={{ fontSize: '15px', lineHeight: 1 }}>✉️</span>
      {unreadCount > 0 && (
        <span style={{
          position: 'absolute', top: '-4px', right: '-4px', minWidth: '16px', height: '16px',
          borderRadius: '999px', background: theme.brass, color: '#FFFFFF', fontSize: '10px', fontWeight: '700',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
        }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
      )}
    </Link>
  )
}
