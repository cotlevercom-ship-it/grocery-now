'use client'
import Link from 'next/link'
import { theme } from '@/lib/theme'

const FREE_FEATURES = [
  'Create your profile — skills, experience, and what you\u2019re looking for',
  'Browse the member directory and see basic info on everyone',
  'Post to the community Feed',
  'Read messages other members send you',
]

const PREMIUM_FEATURES = [
  'Everything in Free',
  'Send and reply to messages — start and keep conversations going',
  'Comment on Feed posts',
  'View full member profiles — experience, education, projects, contact details',
]

function Check({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: '3px' }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function PricingPage() {
  return (
    <div style={{ background: theme.paper, minHeight: '70vh' }}>
      <div style={{ maxWidth: '840px', margin: '0 auto', padding: 'clamp(28px,4vw,56px) clamp(16px,3vw,24px)' }}>
        <div style={{
          fontFamily: theme.fontMono, fontSize: '11.5px', letterSpacing: '0.1em', textTransform: 'uppercase',
          color: theme.brassDark, marginBottom: '10px', fontWeight: '600'
        }}>Pricing</div>

        <h1 style={{
          fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(28px,3.6vw,40px)',
          color: theme.ink, marginBottom: '16px', lineHeight: '1.15'
        }}>Free to join. Upgrade when you&apos;re ready.</h1>

        <p style={{ fontSize: '15px', color: theme.inkSoft, lineHeight: '1.6', marginBottom: '44px', maxWidth: '560px' }}>
          Create your profile and start browsing for free — no card required. Premium unlocks full conversations and full profile access, paid via bKash.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: '20px' }}>
          {/* Free plan */}
          <div style={{
            padding: 'clamp(22px,3.5vw,28px)', background: theme.surface,
            borderRadius: '12px', border: `1px solid ${theme.line}`,
          }}>
            <h2 style={{ fontFamily: theme.fontDisplay, fontSize: '19px', fontWeight: '600', color: theme.ink, marginBottom: '4px' }}>
              Free
            </h2>
            <div style={{ fontFamily: theme.fontDisplay, fontSize: '26px', fontWeight: '700', color: theme.ink, marginBottom: '18px' }}>৳0</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '22px' }}>
              {FREE_FEATURES.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                  <Check color={theme.inkSoft} />
                  <span style={{ fontSize: '13.5px', color: theme.ink, lineHeight: '1.5' }}>{f}</span>
                </div>
              ))}
            </div>

            <Link href="/login" style={{
              display: 'inline-block', background: 'transparent', color: theme.brass,
              border: `1.5px solid ${theme.brass}`, borderRadius: '8px', padding: '10px 20px',
              fontSize: '13.5px', fontWeight: '600', textDecoration: 'none',
            }}>Create Free Account</Link>
          </div>

          {/* Premium plan */}
          <div style={{
            padding: 'clamp(22px,3.5vw,28px)', background: theme.surface,
            borderRadius: '12px', border: `1.5px solid ${theme.brass}`, position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: '-11px', left: '20px', background: theme.brass, color: '#FFFFFF',
              fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: '999px',
            }}>⭐ Premium</div>

            <h2 style={{ fontFamily: theme.fontDisplay, fontSize: '19px', fontWeight: '600', color: theme.ink, marginTop: '6px', marginBottom: '4px' }}>
              Premium
            </h2>
            <div style={{ fontSize: '13px', color: theme.inkSoft, marginBottom: '18px' }}>Pay via bKash from your account</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '22px' }}>
              {PREMIUM_FEATURES.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                  <Check color={theme.signal} />
                  <span style={{ fontSize: '13.5px', color: theme.ink, lineHeight: '1.5', fontWeight: f === 'Everything in Free' ? '600' : '400' }}>{f}</span>
                </div>
              ))}
            </div>

            <Link href="/premium" style={{
              display: 'inline-block', background: theme.brass, color: '#FFFFFF',
              borderRadius: '8px', padding: '11px 20px', fontSize: '13.5px', fontWeight: '600', textDecoration: 'none',
            }}>Upgrade to Premium</Link>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: theme.inkSoft, marginTop: '28px', lineHeight: '1.6' }}>
          Full terms and refund details are in our{' '}
          <Link href="/payment-policy" style={{ color: theme.brass, fontWeight: '600' }}>Payment Policy</Link>.
        </p>
      </div>
    </div>
  )
}
