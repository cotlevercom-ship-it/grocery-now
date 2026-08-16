'use client'
import Image from 'next/image'
import Link from 'next/link'
import { theme } from '@/lib/theme'

function HeroBanner() {
  return (
    <div style={{
      position: 'relative', width: '100%', aspectRatio: '1536 / 1024',
      borderRadius: '14px', overflow: 'hidden'
    }}>
      <Image
        src="/marketing/hero-find-cofounder.jpg"
        alt="Find a co-founder for your business — Cot Lever"
        fill
        priority
        sizes="100vw"
        style={{ objectFit: 'cover' }}
      />
    </div>
  )
}

const STEPS = [
  { n: '01', title: 'Create your profile', body: 'Add your skills, experience, and what you\'re looking for.' },
  { n: '02', title: 'Choose a plan and pay', body: 'Confirm your yearly membership via bKash.' },
  { n: '03', title: 'We review your profile', body: 'Every profile is checked before it goes live.' },
  { n: '04', title: 'Browse other members', body: 'Search the directory for the right match.' },
  { n: '05', title: 'Interested people contact you', body: 'You stay in control of every conversation.' },
]

function HowItWorksTeaser() {
  return (
    <div style={{
      maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(16px,3vw,56px) clamp(40px,6vw,72px)',
    }}>
      <div style={{
        fontFamily: theme.fontMono, fontSize: '11.5px', letterSpacing: '0.1em', textTransform: 'uppercase',
        color: theme.brassDark, marginBottom: '8px', fontWeight: '600'
      }}>The Process</div>
      <h2 style={{
        fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(22px,2.8vw,30px)',
        color: theme.ink, marginBottom: '28px'
      }}>How Cot Lever works</h2>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px',
        marginBottom: '28px'
      }}>
        {STEPS.map(step => (
          <div key={step.n} style={{
            background: theme.surface, border: `1px solid ${theme.line}`, borderRadius: '10px',
            padding: '18px'
          }}>
            <div style={{
              fontFamily: theme.fontMono, fontSize: '12px', fontWeight: '700', color: theme.brass, marginBottom: '10px'
            }}>{step.n}</div>
            <div style={{
              fontFamily: theme.fontDisplay, fontSize: '15px', fontWeight: '600', color: theme.ink, marginBottom: '5px'
            }}>{step.title}</div>
            <p style={{ fontSize: '12.5px', color: theme.inkSoft, lineHeight: '1.5' }}>{step.body}</p>
          </div>
        ))}
      </div>

      <Link href="/how-it-works" style={{
        fontSize: '13.5px', fontWeight: '600', color: theme.brass, textDecoration: 'none'
      }}>See the full details →</Link>
    </div>
  )
}

export default function MarketingHome() {
  return (
    <div style={{ background: theme.paper }}>
      {/* Hero */}
      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,3vw,56px) clamp(32px,5vw,56px)',
      }}>
        {/* Visually hidden but present for SEO/screen readers — the banner below carries this same content visually */}
        <h1 style={{
          position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px',
          overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0
        }}>Find the right people for your business — Cot Lever connects founders in Bangladesh with the co-founders, partners, and share holders their business needs.</h1>

        <HeroBanner />
      </div>

      {/* How it works teaser */}
      <HowItWorksTeaser />
    </div>
  )
}
