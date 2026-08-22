'use client'
import Link from 'next/link'
import { theme } from '@/lib/theme'
import { sc } from '@/lib/memberTheme'

const NAV_ITEMS = [
  { key: 'discover', label: 'Discover', icon: '🧭', href: '/members' },
  { key: 'feed', label: 'Feed', icon: '📰', href: '/feed' },
  { key: 'profile', label: 'My Profile', icon: '👤', href: '/account' },
  { key: 'premium', label: 'Premium Membership', icon: '⭐', href: '/account#premium' },
]

export default function AppSidebar({ active }) {
  return (
    <div style={{
      width: '236px', flexShrink: 0, background: sc.sidebarBg, borderRight: `1px solid ${sc.line}`,
      padding: '22px 16px', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh',
    }} className="members-sidebar">
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '6px' }}>
        {NAV_ITEMS.map(item => {
          const isActive = item.key === active
          return (
            <Link key={item.key} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '9px',
                fontSize: '14px', fontWeight: '600',
                background: isActive ? sc.industryChipBg : 'transparent',
                color: isActive ? theme.brass : sc.text,
                cursor: 'pointer',
              }}>
                <span style={{ fontSize: '16px', lineHeight: 1 }}>{item.icon}</span>
                {item.label}
              </div>
            </Link>
          )
        })}
      </nav>

      <style jsx>{`
        @media (max-width: 860px) {
          .members-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  )
}

export { NAV_ITEMS }
