'use client'
import Image from 'next/image'
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
    </div>
  )
}
