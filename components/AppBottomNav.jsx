'use client'
import Link from 'next/link'
import { theme } from '@/lib/theme'
import { sc } from '@/lib/memberTheme'
import { NAV_ITEMS } from '@/components/AppSidebar'

export default function AppBottomNav({ active }) {
  return (
    <div className="members-bottom-nav" style={{
      display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
      background: sc.sidebarBg, borderTop: `1px solid ${sc.line}`,
      padding: '10px 8px calc(10px + env(safe-area-inset-bottom))',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        {NAV_ITEMS.map(item => {
          const isActive = item.key === active
          return (
            <Link key={item.key} href={item.href} style={{
              textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              color: isActive ? theme.brass : sc.textFaint,
            }}>
              <span style={{ fontSize: '18px', lineHeight: 1 }}>{item.icon}</span>
              <span style={{ fontSize: '10.5px', fontWeight: isActive ? '700' : '600' }}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
