'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { theme } from '@/lib/theme'
import { sc } from '@/lib/memberTheme'
import { NAV_ITEMS, useNavBadges } from '@/components/AppSidebar'
import { supabaseFetch, getSession } from '@/lib/supabase'

// Bottom nav has its own order/labels, independent of the desktop sidebar.
const BOTTOM_NAV_ORDER = ['feed', 'discover', 'profile']
const BOTTOM_NAV_LABELS = { discover: 'People' }

export default function AppBottomNav({ active }) {
  const [myPhoto, setMyPhoto] = useState(null)
  const { badges } = useNavBadges()

  useEffect(() => {
    const session = getSession()
    const uid = session?.user?.id
    if (!uid) return
    supabaseFetch(`member_profiles?select=photo_url&user_id=eq.${uid}`)
      .then(rows => setMyPhoto(rows?.[0]?.photo_url || null))
      .catch(e => console.error(e))
  }, [])

  const itemsByKey = Object.fromEntries(NAV_ITEMS.map(item => [item.key, item]))
  const items = BOTTOM_NAV_ORDER.map(key => itemsByKey[key]).filter(Boolean)

  return (
    <div className="members-bottom-nav" style={{
      display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
      background: sc.sidebarBg, borderTop: `1px solid ${sc.line}`,
      padding: '10px 8px calc(10px + env(safe-area-inset-bottom))',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        {items.map(item => {
          const isActive = item.key === active

          if (item.key === 'profile') {
            return (
              <Link key={item.key} href={item.href} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                  border: isActive ? `2px solid ${theme.brass}` : `1px solid ${sc.line}`,
                  background: theme.brass, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {myPhoto ? (
                    <img src={myPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '13px' }}>👤</span>
                  )}
                </div>
              </Link>
            )
          }

          const Icon = item.icon
          const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0
          return (
            <Link key={item.key} href={item.href} style={{
              textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              color: isActive ? theme.brass : sc.textFaint, position: 'relative',
            }}>
              <span style={{ position: 'relative' }}>
                <Icon size={18} strokeWidth={2} />
                {badgeCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-5px', right: '-7px', minWidth: '14px', height: '14px',
                    borderRadius: '999px', background: theme.brass, color: '#FFFFFF', fontSize: '9px', fontWeight: '700',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2px',
                  }}>{badgeCount > 9 ? '9+' : badgeCount}</span>
                )}
              </span>
              <span style={{ fontSize: '10.5px', fontWeight: isActive ? '700' : '600' }}>{BOTTOM_NAV_LABELS[item.key] || item.label}</span>
            </Link>
          )
        })}
      </div>

      <style jsx>{`
        @media (max-width: 860px) {
          .members-bottom-nav { display: block !important; }
        }
      `}</style>
    </div>
  )
}
