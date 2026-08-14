import Link from 'next/link'
import { theme } from '@/lib/theme'

// Homepage hero — intentionally lightweight (no data fetching, no client
// hooks). Business cards live on /listings ("Listed Business"); co-founder
// posts live on /cofounder ("Find a Co-founder"). This page is just the
// two entry points into those.
export default function ListingHome() {
  return (
    <div style={{ background: theme.paper }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: 'clamp(28px,5vw,64px) clamp(16px,3vw,56px)',
      }}>
        <div style={{ maxWidth: '640px' }}>
          <h1 style={{
            fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(32px,4.2vw,52px)',
            lineHeight: '1.08', color: theme.ink, marginBottom: '28px', letterSpacing: '-0.01em'
          }}>
            Find the right people for your business.
          </h1>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/listings" style={{
              display: 'inline-block', background: theme.brass, color: 'white',
              borderRadius: '8px', padding: '14px 26px', fontSize: '14.5px', fontWeight: '600', textDecoration: 'none'
            }}>Listed Business</Link>
            <Link href="/cofounder" style={{
              display: 'inline-block', background: 'transparent', color: theme.ink, border: `1px solid ${theme.line}`,
              borderRadius: '8px', padding: '14px 26px', fontSize: '14.5px', fontWeight: '600', textDecoration: 'none'
            }}>Find a Co-founder</Link>
          </div>
        </div>
      </div>

      {/* Resources teaser */}
      <div style={{ borderTop: `1px solid ${theme.line}` }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: 'clamp(18px,3vw,32px) clamp(16px,3vw,56px)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px'
        }}>
          <div>
            <div style={{ fontFamily: theme.fontDisplay, fontSize: '18px', fontWeight: '600', color: theme.ink, marginBottom: '3px' }}>
              Resources for founders
            </div>
            <p style={{ fontSize: '13px', color: theme.inkSoft }}>Short, practical reads on finding co-founders, investors, and partners.</p>
          </div>
          <Link href="/resources" style={{
            display: 'inline-block', background: 'transparent', color: theme.ink, border: `1px solid ${theme.line}`,
            borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', whiteSpace: 'nowrap'
          }}>Browse Articles →</Link>
        </div>
      </div>
    </div>
  )
}
