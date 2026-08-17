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

function TriggerCard({ open, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-expanded={open}
      style={{
        width: '100%',
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
  const scrollRef = useRef(null)

  const scrollBy = (dir) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * 240, behavior: 'smooth' })
  }

  return (
    <div style={{
      maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(16px,3vw,56px) clamp(40px,6vw,72px)',
    }}>
      <style jsx>{`
        .howitworks-trigger-wrap {
          width: 220px;
        }
        @media (max-width: 680px) {
          .howitworks-row {
            flex-direction: column !important;
          }
          .howitworks-trigger-wrap {
            width: 100% !important;
          }
        }
        .steps-scroll {
          scrollbar-width: none;
        }
        .steps-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="howitworks-row" style={{
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <div className="howitworks-trigger-wrap" style={{ flexShrink: 0, alignSelf: 'flex-start' }}>
          <TriggerCard open={open} onClick={() => setOpen((v) => !v)} />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: open ? '1fr' : '0fr',
          transition: 'grid-template-columns 1.9s ease',
          minWidth: 0, flex: '0 1 auto',
        }}>
          <div style={{ overflow: 'hidden', minWidth: 0, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Scroll left"
              style={{
                flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%',
                background: theme.surface, border: `1px solid ${theme.line}`, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div ref={scrollRef} className="steps-scroll" style={{
              display: 'flex', flexDirection: 'row', gap: '16px', overflowX: 'auto', paddingBottom: '10px',
            }}>
              {STEPS.map((step, i) => (
                <div key={step.n} style={{ width: '220px', flexShrink: 0 }}>
                  <StepCard step={step} index={i} />
                </div>
              ))}
            </div>

            <button
              onClick={() => scrollBy(1)}
              aria-label="Scroll right"
              style={{
                flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%',
                background: theme.surface, border: `1px solid ${theme.line}`, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateRows: open ? '1fr' : '0fr',
        transition: 'grid-template-rows 1.9s ease',
      }}>
        <div style={{ overflow: 'hidden', minHeight: 0 }}>
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
