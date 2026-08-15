'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { theme } from '@/lib/theme'

const HERO_SLIDES = [
  { title: 'Find the right people for your business', image: '/marketing/hero-find-people.jpg' },
  { title: 'Co-founders & Partners', image: '/marketing/cofounders-partners.jpg' },
  { title: 'Share Holders', image: '/marketing/shareholder.jpg' },
]

function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 3000)
    return () => clearInterval(timerRef.current)
  }, [])

  return (
    <div style={{
      position: 'relative', width: '100%', aspectRatio: '1536 / 1024',
      borderRadius: '14px', overflow: 'hidden'
    }}>
      {HERO_SLIDES.map((slide, i) => (
        <div key={slide.image} style={{
          position: 'absolute', inset: 0,
          opacity: i === index ? 1 : 0,
          transition: 'opacity 0.7s ease',
        }}>
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={i === 0}
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
      ))}

      <div style={{
        position: 'absolute', bottom: '14px', left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: '6px',
      }}>
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={slide.image}
            onClick={() => setIndex(i)}
            style={{
              width: i === index ? '18px' : '7px', height: '7px', borderRadius: '4px',
              background: i === index ? theme.brass : 'rgba(255,255,255,0.65)',
              cursor: 'pointer', transition: 'width 0.3s ease',
            }}
          />
        ))}
      </div>
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
        {/* Visually hidden but present for SEO/screen readers — the carousel below carries this same content visually */}
        <h1 style={{
          position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px',
          overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0
        }}>Find the right people for your business — Cot Lever connects founders in Bangladesh with the co-founders, partners, and share holders their business needs.</h1>

        <HeroCarousel />
      </div>
    </div>
  )
}
