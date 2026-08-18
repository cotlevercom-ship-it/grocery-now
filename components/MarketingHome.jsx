'use client'
import Image from 'next/image'
import { theme } from '@/lib/theme'

function HeroBanner() {
  const alt = 'Find the right co-founder. Build something great, together. — Cot Lever'

  return (
    <div style={{
      position: 'relative', width: '100%', aspectRatio: '1942 / 809',
      overflow: 'hidden', background: theme.surface
    }}>
      <Image
        src="/marketing/hero-cofounder-banner.png"
        alt={alt}
        fill
        priority
        sizes="100vw"
        style={{ objectFit: 'contain' }}
      />
    </div>
  )
}

function IdeasPeopleTogetherBanner() {
  const alt = 'Ideas. People. Together. Find the right co-founder and build something amazing. — 1. The Idea: you have an idea but building it alone can be hard. 2. The Missing Piece: maybe you need a developer, a marketer, a designer, or a business mind. 3. Meet Cot Lever: find the right co-founder.'

  return (
    <div style={{
      position: 'relative', width: '100%', aspectRatio: '1821 / 864',
      overflow: 'hidden', background: theme.surface
    }}>
      <Image
        src="/marketing/ideas-people-together.png"
        alt={alt}
        fill
        sizes="100vw"
        style={{ objectFit: 'contain' }}
      />
    </div>
  )
}

export default function MarketingHome() {
  return (
    <div style={{ background: theme.paper }}>
      {/* Hero */}
      <div style={{
        width: '100%',
      }}>
        <h1 style={{
          position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px',
          overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0
        }}>Find the right people for your business — Cot Lever connects founders in Bangladesh with the co-founders, partners, and share holders their business needs.</h1>

        <HeroBanner />
      </div>

      {/* Ideas. People. Together. */}
      <div style={{
        width: '100%', padding: '0 0 clamp(32px,5vw,56px)',
      }}>
        <IdeasPeopleTogetherBanner />
      </div>
    </div>
  )
}

