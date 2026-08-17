'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
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

const STEPS = [
  { n: '01', title: 'Create your profile', body: 'Add your skills, experience, and what you\'re looking for.' },
  { n: '02', title: 'Choose a plan and pay', body: 'Confirm your yearly membership via bKash.' },
  { n: '03', title: 'We review your profile', body: 'Every profile is checked before it goes live.' },
  { n: '04', title: 'Browse other members', body: 'Search the directory for the right match.' },
  { n: '05', title: 'Interested people contact you', body: 'You stay in control of every conversation.' },
]

function StepCard({ step, index }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setVisible(true)
        })
      },
      { threshold: 0.4, rootMargin: '0px 0px -10% 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        background: theme.surface, border: `1px solid ${theme.line}`, borderRadius: '10px',
        padding: '18px', height: '190px', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        transition: `opacity 0.6s ease-out ${index * 0.12}s, transform 0.6s ease-out ${index * 0.12}s`,
      }}
    >
      <div style={{
        fontFamily: theme.fontMono, fontSize: '12px', fontWeight: '700', color: theme.brass, marginBottom: '10px'
      }}>{step.n}</div>
      <div style={{
        fontFamily: theme.fontDisplay, fontSize: '15px', fontWeight: '600', color: theme.ink, marginBottom: '5px'
      }}>{step.title}</div>
      <p style={{ fontSize: '12.5px', color: theme.inkSoft, lineHeight: '1.5' }}>{step.body}</p>
    </div>
  )
}

const CARD_SIZE = { width: '100%' }

function TriggerCard({ open, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-expanded={open}
      style={{
        ...CARD_SIZE,
        background: theme.surface, border: `1px solid ${theme.line}`, borderRadius: '10px',
        padding: '18px', height: '190px', boxSizing: 'border-box', cursor: 'pointer', textAlign: 'left',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}
    >
      <div style={{
        fontFamily: theme.fontDisplay, fontSize: '15px', fontWeight: '600', color: theme.ink,
      }}>How Cot Lever works</div>
    </button>
  )
}

function HowItWorksTeaser() {
  const [open, setOpen] = useState(false)

  return (
    <div style={{
      maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(16px,3vw,56px) clamp(40px,6vw,72px)',
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 220px))', gap: '16px',
      }}>
        <TriggerCard open={open} onClick={() => setOpen((v) => !v)} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateRows: open ? '1fr' : '0fr',
        transition: 'grid-template-rows 1.1s ease',
      }}>
        <div style={{ overflow: 'hidden', minHeight: 0 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 220px))', gap: '16px',
            marginTop: '16px',
          }}>
            {STEPS.map((step, i) => (
              <div key={step.n} style={CARD_SIZE}>
                <StepCard step={step} index={i} />
              </div>
            ))}
          </div>

          <Link href="/how-it-works" style={{
            display: 'inline-block', marginTop: '20px',
            fontSize: '13.5px', fontWeight: '600', color: theme.brass, textDecoration: 'none'
          }}>See the full details →</Link>
        </div>
      </div>
    </div>
  )
}

export default function MarketingHome() {
  return (
    <div style={{ background: theme.paper }}>
      {/* Hero */}
      <div style={{
        width: '100%', padding: '0 0 clamp(32px,5vw,56px)',
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
