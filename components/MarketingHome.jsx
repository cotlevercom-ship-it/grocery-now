'use client'
import Image from 'next/image'
import Link from 'next/link'
import { theme } from '@/lib/theme'

function HeroBanner() {
  const alt = 'Find the right co-founder. Build something great, together. — Cot Lever'

  return (
    <div className="banner-anim" style={{
      position: 'relative', width: '100%', overflow: 'hidden', background: theme.surface,
      animationDelay: '0s',
    }}>
      {/* Mobile-only hero image (portrait) */}
      <div className="hero-mobile-only" style={{ position: 'relative', width: '100%', aspectRatio: '1536 / 1024' }}>
        <Image
          src="/marketing/hero-mobile-idea.jpg"
          alt={alt}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
      </div>
      {/* Desktop hero image (wide) */}
      <div className="hero-desktop-only" style={{ position: 'relative', width: '100%', aspectRatio: '1942 / 809' }}>
        <Image
          src="/marketing/hero-cofounder-banner.png"
          alt={alt}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'contain' }}
        />
      </div>
    </div>
  )
}

function IdeasPeopleTogetherBanner() {
  const alt = 'Ideas. People. Together. Find the right co-founder and build something amazing. — 1. The Idea: you have an idea but building it alone can be hard. 2. The Missing Piece: maybe you need a developer, a marketer, a designer, or a business mind. 3. Meet Cot Lever: find the right co-founder.'

  return (
    <div className="banner-anim" style={{
      position: 'relative', width: '100%', aspectRatio: '1821 / 864',
      overflow: 'hidden', background: theme.surface,
      animationDelay: '0.25s',
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

function HowItWorksMobileTeaser() {
  return (
    <Link
      href="/how-it-works"
      className="how-it-works-teaser-mobile banner-anim"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
        margin: '0 20px', marginTop: '20px', padding: '18px 20px',
        background: theme.surface, border: `1px solid ${theme.brass}33`, borderRadius: '14px',
        textDecoration: 'none', animationDelay: '0.15s',
      }}
    >
      <div>
        <div style={{ color: theme.brass, fontSize: '12px', letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase' }}>
          How It Works
        </div>
        <div style={{ color: theme.ink, fontSize: '16px', fontWeight: 600, marginTop: '4px' }}>
          See how Cot Lever finds your co-founder
        </div>
      </div>
      <span aria-hidden="true" style={{ color: theme.brass, fontSize: '22px', flexShrink: 0 }}>→</span>
    </Link>
  )
}

export default function MarketingHome() {
  return (
    <div style={{ background: theme.paper, position: 'relative' }}>
      <h1 style={{
        position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px',
        overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0
      }}>Find the right people for your business — Cot Lever connects founders in Bangladesh with the co-founders, partners, and share holders their business needs.</h1>

      {/* Hero — on desktop stays pinned while the next banner scrolls up over it; on mobile just normal flow */}
      <div className="banner-sticky-1">
        <HeroBanner />
      </div>

      {/* How It Works teaser — mobile only, sits right under the hero */}
      <HowItWorksMobileTeaser />

      {/* Ideas. People. Together. — desktop only: slides up to cover the hero on scroll. Hidden on mobile. */}
      <div className="banner-sticky-2 ideas-banner-desktop-only" style={{
        paddingBottom: 'clamp(32px,5vw,56px)',
      }}>
        <IdeasPeopleTogetherBanner />
      </div>

      <style jsx global>{`
        @keyframes bannerFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .banner-anim {
          opacity: 0;
          animation: bannerFadeUp 0.9s ease-out forwards;
        }
        .banner-sticky-1 {
          position: static;
        }
        .banner-sticky-2 {
          position: static;
          background: ${theme.paper};
        }
        .hero-mobile-only { display: block; }
        .hero-desktop-only { display: none; }
        .ideas-banner-desktop-only { display: none; }
        .how-it-works-teaser-mobile { display: flex; }
        @media (min-width: 768px) {
          .how-it-works-teaser-mobile { display: none; }
          .banner-sticky-1 {
            position: sticky;
            top: 0;
            z-index: 1;
          }
          .banner-sticky-2 {
            position: sticky;
            top: 0;
            z-index: 2;
          }
          .hero-mobile-only { display: none; }
          .hero-desktop-only { display: block; }
          .ideas-banner-desktop-only { display: block; }
        }
      `}</style>
    </div>
  )
}

