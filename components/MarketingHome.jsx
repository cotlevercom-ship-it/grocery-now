'use client'
import Link from 'next/link'
import { theme } from '@/lib/theme'

const FEATURES = [
  { icon: '🧩', title: 'Co-founders & Partners', body: 'List your idea or business for the co-founder or partner it needs — reach people actively looking.' },
  { icon: '🤝', title: 'Share Holders', body: 'Bring on a share holder for the equity your business needs.' },
  { icon: '✅', title: 'Verified Listings', body: 'Every listing is reviewed before it goes live, so what you see is a real, checked business.' },
]

const STEPS = [
  { n: '01', title: 'Create your account', body: 'Sign up free — takes less than a minute.' },
  { n: '02', title: 'List or browse', body: 'List your business or idea, or browse what others are looking for.' },
  { n: '03', title: 'Connect directly', body: 'Reach out to the people and businesses that match what you need.' },
]

export default function MarketingHome() {
  return (
    <div style={{ background: theme.paper }}>
      {/* Hero */}
      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: 'clamp(40px,7vw,88px) clamp(16px,3vw,56px) clamp(32px,5vw,56px)',
      }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{
            fontFamily: theme.fontMono, fontSize: '11.5px', letterSpacing: '0.1em', textTransform: 'uppercase',
            color: theme.brassDark, marginBottom: '14px', fontWeight: '600'
          }}>A Business-Matching Directory</div>
          <h1 style={{
            fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(34px,4.6vw,56px)',
            lineHeight: '1.08', color: theme.ink, marginBottom: '20px', letterSpacing: '-0.01em'
          }}>
            Find the right people for your business.
          </h1>
          <p style={{ fontSize: 'clamp(15px,1.6vw,17px)', color: theme.inkSoft, lineHeight: '1.6', marginBottom: '32px', maxWidth: '540px' }}>
            Cot Lever connects founders in Bangladesh with the co-founders, partners, and share holders their business needs — all verified, all in one place.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/login" style={{
              display: 'inline-block', background: theme.brass, color: 'white',
              borderRadius: '8px', padding: '14px 26px', fontSize: '14.5px', fontWeight: '600', textDecoration: 'none'
            }}>Get Started — It&apos;s Free</Link>
            <Link href="/how-it-works" style={{
              display: 'inline-block', background: 'transparent', color: theme.ink, border: `1px solid ${theme.line}`,
              borderRadius: '8px', padding: '14px 26px', fontSize: '14.5px', fontWeight: '600', textDecoration: 'none'
            }}>How It Works</Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ borderTop: `1px solid ${theme.line}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(36px,5vw,64px) clamp(16px,3vw,56px)' }}>
          <h2 style={{
            fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(22px,2.6vw,28px)',
            color: theme.ink, marginBottom: '28px'
          }}>What you&apos;ll find on Cot Lever</h2>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 'clamp(14px,1.8vw,22px)'
          }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                background: theme.surface, border: `1px solid ${theme.line}`, borderRadius: '12px',
                padding: '22px 20px'
              }}>
                <div style={{ fontSize: '26px', marginBottom: '12px' }}>{f.icon}</div>
                <div style={{ fontFamily: theme.fontDisplay, fontSize: '16.5px', fontWeight: '600', color: theme.ink, marginBottom: '6px' }}>
                  {f.title}
                </div>
                <p style={{ fontSize: '13px', color: theme.inkSoft, lineHeight: '1.55' }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works (condensed) */}
      <div style={{ borderTop: `1px solid ${theme.line}`, background: theme.surface }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(36px,5vw,64px) clamp(16px,3vw,56px)' }}>
          <h2 style={{
            fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(22px,2.6vw,28px)',
            color: theme.ink, marginBottom: '28px'
          }}>Getting started is simple</h2>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 'clamp(20px,2.5vw,32px)'
          }}>
            {STEPS.map(s => (
              <div key={s.n}>
                <div style={{
                  fontFamily: theme.fontMono, fontSize: '13px', fontWeight: '600', color: theme.brassDark, marginBottom: '10px'
                }}>{s.n}</div>
                <div style={{ fontFamily: theme.fontDisplay, fontSize: '17px', fontWeight: '600', color: theme.ink, marginBottom: '6px' }}>
                  {s.title}
                </div>
                <p style={{ fontSize: '13px', color: theme.inkSoft, lineHeight: '1.55' }}>{s.body}</p>
              </div>
            ))}
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
            <p style={{ fontSize: '13px', color: theme.inkSoft }}>Short, practical reads on finding co-founders and partners.</p>
          </div>
          <Link href="/login" style={{
            display: 'inline-block', background: 'transparent', color: theme.ink, border: `1px solid ${theme.line}`,
            borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', whiteSpace: 'nowrap'
          }}>Get Started →</Link>
        </div>
      </div>

      {/* Final CTA */}
      <div style={{ borderTop: `1px solid ${theme.line}`, background: theme.ink }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: 'clamp(32px,5vw,56px) clamp(16px,3vw,56px)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '18px'
        }}>
          <div style={{ fontFamily: theme.fontDisplay, fontSize: 'clamp(19px,2.2vw,24px)', fontWeight: '600', color: theme.paper, maxWidth: '480px' }}>
            Ready to find the right people for your business?
          </div>
          <Link href="/login" style={{
            display: 'inline-block', background: theme.brass, color: 'white',
            borderRadius: '8px', padding: '14px 26px', fontSize: '14.5px', fontWeight: '600', textDecoration: 'none', whiteSpace: 'nowrap'
          }}>Create Free Account</Link>
        </div>
      </div>
    </div>
  )
}
