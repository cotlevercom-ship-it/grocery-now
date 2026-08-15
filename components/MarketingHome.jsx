'use client'
import Link from 'next/link'
import Image from 'next/image'
import { theme } from '@/lib/theme'

const FEATURES = [
  { title: 'Co-founders & Partners', image: '/marketing/cofounders-partners.jpg' },
  { title: 'Share Holders', image: '/marketing/shareholder.jpg' },
]

export default function MarketingHome() {
  return (
    <div style={{ background: theme.paper }}>
      {/* Hero */}
      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,3vw,56px) clamp(32px,5vw,56px)',
      }}>
        {/* Visually hidden but present for SEO/screen readers — the image below carries this same headline visually */}
        <h1 style={{
          position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px',
          overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0
        }}>Find the right people for your business — Cot Lever connects founders in Bangladesh with the co-founders, partners, and share holders their business needs.</h1>

        <div style={{
          position: 'relative', width: '100%', aspectRatio: '1536 / 1024',
          borderRadius: '14px', overflow: 'hidden', marginBottom: '24px'
        }}>
          <Image
            src="/marketing/hero-find-people.jpg"
            alt="Find the right people for your business — Cot Lever connects founders in Bangladesh with the co-founders, partners, and share holders their business needs, all verified, all in one place."
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        </div>

      </div>

      {/* Features */}
      <div style={{ borderTop: `1px solid ${theme.line}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(36px,5vw,64px) clamp(16px,3vw,56px)' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 'clamp(14px,1.8vw,22px)'
          }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                position: 'relative', width: '100%', aspectRatio: '3 / 2',
                borderRadius: '12px', overflow: 'hidden', border: `1px solid ${theme.line}`
              }}>
                <Image src={f.image} alt={f.title} fill sizes="(max-width: 700px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
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
    </div>
  )
}
