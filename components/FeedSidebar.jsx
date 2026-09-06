'use client'
import Link from 'next/link'
import { Flame, Lightbulb, Users, Building2, CalendarCheck, Star, ArrowRight } from 'lucide-react'
import { theme } from '@/lib/theme'
import { sc } from '@/lib/memberTheme'

const QUICK_LINKS = [
  { label: 'Find a Co-founder', href: '/members', icon: Users },
  { label: 'Create a Business', href: '/businesses/new', icon: Building2 },
  { label: 'Meet Requests', href: '/requests', icon: CalendarCheck, badgeKey: 'requests' },
  { label: 'Premium Membership', href: '/premium', icon: Star },
]

function Card({ children }) {
  return (
    <div style={{ background: sc.cardBg, borderRadius: '14px', boxShadow: sc.shadow, padding: '16px' }}>
      {children}
    </div>
  )
}

export default function FeedSidebar({ trendingTopics = [], requestsBadge = 0 }) {
  return (
    <div style={{ width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }} className="feed-right-rail">
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Flame size={17} color={theme.brass} strokeWidth={2.2} />
          <span style={{ fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: '15px', color: sc.text }}>Trending Topics</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {trendingTopics.length === 0 ? (
            <div style={{ fontSize: '12.5px', color: sc.textFaint, padding: '6px 0' }}>Nothing trending yet.</div>
          ) : trendingTopics.map(topic => (
            <Link
              key={topic.label}
              href={`/members?q=${encodeURIComponent(topic.label)}`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 6px', borderRadius: '8px', textDecoration: 'none',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: '600', color: sc.text }}># {topic.label}</span>
              <span style={{ fontSize: '12px', color: sc.textFaint }}>{topic.count}</span>
            </Link>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Lightbulb size={17} color={theme.brass} strokeWidth={2.2} />
          <span style={{ fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: '15px', color: sc.text }}>Quick Links</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {QUICK_LINKS.map(link => {
            const Icon = link.icon
            const badge = link.badgeKey === 'requests' ? requestsBadge : 0
            return (
              <Link key={link.href} href={link.href} style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 6px',
                borderRadius: '8px', textDecoration: 'none', color: sc.text,
              }}>
                <Icon size={16} color={theme.brass} strokeWidth={2} />
                <span style={{ fontSize: '13px', fontWeight: '600', flex: 1 }}>{link.label}</span>
                {badge > 0 && (
                  <span style={{
                    minWidth: '18px', height: '18px', borderRadius: '999px', background: theme.brass, color: '#FFF',
                    fontSize: '10.5px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px',
                  }}>{badge > 9 ? '9+' : badge}</span>
                )}
                <ArrowRight size={13} color={sc.textFaint} />
              </Link>
            )
          })}
        </div>
      </Card>

      <Link href="/premium" style={{ textDecoration: 'none' }}>
        <div style={{
          background: 'linear-gradient(160deg, rgba(179,55,42,0.12), rgba(179,55,42,0.04))',
          borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: '14.5px', color: sc.text, lineHeight: '1.3' }}>
              Great ideas need the right people.
            </div>
            <div style={{ fontSize: '12px', color: sc.textSoft, marginTop: '6px', lineHeight: '1.4' }}>
              Join Cot Lever and turn your idea into reality.
            </div>
          </div>
          <div style={{
            width: '30px', height: '30px', borderRadius: '999px', background: theme.brass, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ArrowRight size={15} color="#FFF" />
          </div>
        </div>
      </Link>

      <style jsx>{`
        @media (max-width: 1180px) {
          .feed-right-rail { display: none; }
        }
      `}</style>
    </div>
  )
}
