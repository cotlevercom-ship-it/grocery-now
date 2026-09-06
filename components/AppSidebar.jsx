'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Compass, Newspaper, Building2, MessageCircle, CalendarCheck,
  Users, Bookmark, User, Star, Crown,
} from 'lucide-react'
import { theme } from '@/lib/theme'
import { sc } from '@/lib/memberTheme'
import { getSession, supabaseFetch } from '@/lib/supabase'

const NAV_ITEMS = [
  { key: 'discover', label: 'Discover', icon: Compass, href: '/members' },
  { key: 'feed', label: 'Feed', icon: Newspaper, href: '/feed' },
  { key: 'businesses', label: 'Businesses', icon: Building2, href: '/businesses' },
  { key: 'messages', label: 'Messages', icon: MessageCircle, href: '/messages', badgeKey: 'messages' },
  { key: 'requests', label: 'Meet Requests', icon: CalendarCheck, href: '/requests', badgeKey: 'requests' },
  { key: 'connections', label: 'Connections', icon: Users, href: '/connections' },
  { key: 'bookmarks', label: 'Bookmarks', icon: Bookmark, href: '/bookmarks' },
  { key: 'profile', label: 'My Account', icon: User, href: '/account' },
  { key: 'premium', label: 'Premium Membership', icon: Star, href: '/premium' },
]

// Shared badge-count hook — unread messages + pending received meet requests.
// Exported so the bottom nav (mobile) can show the same counts.
function useNavBadges() {
  const [badges, setBadges] = useState({ messages: 0, requests: 0 })
  const [isPremium, setIsPremium] = useState(false)

  const refresh = useCallback(async (uid) => {
    if (!uid) { setBadges({ messages: 0, requests: 0 }); setIsPremium(false); return }
    try {
      const [msgRows, reqRows, profileRows] = await Promise.all([
        supabaseFetch(`messages?select=id&recipient_id=eq.${uid}&read=eq.false`),
        supabaseFetch(`connections?select=id&status=eq.pending&addressee_id=eq.${uid}`),
        supabaseFetch(`member_profiles?select=is_premium&user_id=eq.${uid}`),
      ])
      setBadges({ messages: (msgRows || []).length, requests: (reqRows || []).length })
      setIsPremium(!!profileRows?.[0]?.is_premium)
    } catch (e) { console.error(e) }
  }, [])

  useEffect(() => {
    const uid = getSession()?.user?.id
    refresh(uid)
    const interval = setInterval(() => refresh(getSession()?.user?.id), 30000)
    const onAuthChanged = () => refresh(getSession()?.user?.id)
    window.addEventListener('auth-changed', onAuthChanged)
    return () => { clearInterval(interval); window.removeEventListener('auth-changed', onAuthChanged) }
  }, [refresh])

  return { badges, isPremium }
}

function NavBadge({ count }) {
  if (!count) return null
  return (
    <span style={{
      marginLeft: 'auto', minWidth: '20px', height: '20px', borderRadius: '999px',
      background: theme.brass, color: '#FFFFFF', fontSize: '11px', fontWeight: '700',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px',
    }}>{count > 9 ? '9+' : count}</span>
  )
}

export default function AppSidebar({ active }) {
  const { badges, isPremium } = useNavBadges()

  return (
    <div style={{
      width: '236px', flexShrink: 0, background: sc.sidebarBg, borderRight: `1px solid ${sc.line}`,
      padding: '22px 16px', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh',
    }} className="members-sidebar">
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '6px' }}>
        {NAV_ITEMS.map(item => {
          const isActive = item.key === active
          const Icon = item.icon
          const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0
          return (
            <Link key={item.key} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '9px',
                fontSize: '14px', fontWeight: '600',
                background: isActive ? sc.industryChipBg : 'transparent',
                color: isActive ? theme.brass : sc.text,
                cursor: 'pointer',
                borderLeft: isActive ? `3px solid ${theme.brass}` : '3px solid transparent',
              }}>
                <Icon size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
                <span>{item.label}</span>
                <NavBadge count={badgeCount} />
              </div>
            </Link>
          )
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {!isPremium && (
        <div style={{
          background: 'linear-gradient(160deg, rgba(179,55,42,0.10), rgba(179,55,42,0.03))',
          border: `1px solid ${sc.line}`, borderRadius: '14px', padding: '16px', marginTop: '16px',
        }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '9px', background: theme.brass,
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px',
          }}>
            <Crown size={16} color="#FFFFFF" strokeWidth={2.2} />
          </div>
          <div style={{ fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: '15px', color: sc.text, marginBottom: '4px' }}>
            Go Premium
          </div>
          <div style={{ fontSize: '12.5px', color: sc.textSoft, lineHeight: '1.4', marginBottom: '12px' }}>
            Unlock full profiles, unlimited messaging and more.
          </div>
          <Link href="/premium" style={{
            display: 'block', textAlign: 'center', background: theme.brass, color: '#FFFFFF',
            borderRadius: '9px', padding: '10px 12px', fontSize: '13px', fontWeight: '700', textDecoration: 'none',
          }}>Upgrade Now</Link>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 860px) {
          .members-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  )
}

export { NAV_ITEMS, useNavBadges }
