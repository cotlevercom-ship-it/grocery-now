'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { theme } from '@/lib/theme'

const STEPS = [
  {
    n: '01',
    title: 'Create your profile',
    body: 'Tell us who you are, your skills and experience, and what you\'re looking for — a co-founder, partner, or investor. Takes a few minutes.',
  },
  {
    n: '02',
    title: 'Choose a plan and pay',
    body: 'Confirm your yearly membership via bKash. One simple fee, no hidden costs.',
  },
  {
    n: '03',
    title: 'We review your profile',
    body: 'Every profile is checked before it goes live — this keeps the directory trustworthy for everyone browsing it.',
  },
  {
    n: '04',
    title: 'Browse other members',
    body: 'Search the directory for people whose skills and goals match what you\'re looking for.',
  },
  {
    n: '05',
    title: 'Interested people contact you',
    body: 'Anyone who finds your profile reaches out directly using the contact details you provided — you stay in control of every conversation.',
  },
]

function TimelineStep({ step, index, isLast, onVisible }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            onVisible(index)
          }
        })
      },
      { threshold: 0.4, rootMargin: '0px 0px -10% 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [index, onVisible])

  return (
    <div
      ref={ref}
      style={{
        display: 'flex', gap: '24px', marginBottom: isLast ? 0 : '40px', position: 'relative',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
    >
      <div style={{
        flexShrink: 0, width: '48px', height: '48px', borderRadius: '50%',
        background: visible ? theme.brass : theme.surface,
        color: visible ? 'white' : theme.inkSoft,
        border: visible ? `4px solid ${theme.paper}` : `1.5px solid ${theme.line}`,
        boxShadow: visible ? `0 0 0 1.5px ${theme.brass}` : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: theme.fontMono, fontSize: '13px', fontWeight: '600', zIndex: 1,
        transition: 'background 0.4s ease-out, color 0.4s ease-out, box-shadow 0.4s ease-out, border 0.4s ease-out',
      }}>{step.n}</div>

      <div style={{ paddingTop: '8px' }}>
        <h2 style={{
          fontFamily: theme.fontDisplay, fontSize: '20px', fontWeight: '600',
          color: theme.ink, marginBottom: '6px'
        }}>{step.title}</h2>
        <p style={{ fontSize: '14px', color: theme.inkSoft, lineHeight: '1.65', maxWidth: '480px' }}>
          {step.body}
        </p>
      </div>
    </div>
  )
}

export default function HowItWorksPage() {
  const [furthestVisible, setFurthestVisible] = useState(-1)
  const trackRef = useRef(null)
  const [fillHeight, setFillHeight] = useState(0)

  const handleVisible = (index) => {
    setFurthestVisible((prev) => (index > prev ? index : prev))
  }

  useEffect(() => {
    if (furthestVisible < 0 || !trackRef.current) return
    const stepEls = trackRef.current.querySelectorAll('[data-step]')
    const target = stepEls[furthestVisible]
    if (target) {
      const trackTop = trackRef.current.getBoundingClientRect().top
      const targetCenter = target.getBoundingClientRect().top - trackTop + 24
      setFillHeight(targetCenter)
    }
  }, [furthestVisible])

  return (
    <div style={{ background: theme.paper, minHeight: '70vh' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(28px,4vw,56px) clamp(16px,3vw,24px)' }}>
        <div style={{
          fontFamily: theme.fontMono, fontSize: '11.5px', letterSpacing: '0.1em', textTransform: 'uppercase',
          color: theme.brassDark, marginBottom: '10px', fontWeight: '600'
        }}>The Process</div>

        <h1 style={{
          fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(28px,3.6vw,40px)',
          color: theme.ink, marginBottom: '16px', lineHeight: '1.15'
        }}>How Cot Lever works</h1>

        <p style={{ fontSize: '15px', color: theme.inkSoft, lineHeight: '1.6', marginBottom: '48px', maxWidth: '520px' }}>
          From creating your profile to getting contacted by the right person — five steps, start to finish.
        </p>

        <div ref={trackRef} style={{ position: 'relative' }}>
          {/* base connecting line */}
          <div style={{
            position: 'absolute', left: '23px', top: '10px', bottom: '10px', width: '1.5px',
            background: theme.line,
          }} />
          {/* fill line — grows as you scroll through the steps */}
          <div style={{
            position: 'absolute', left: '23px', top: '10px', width: '1.5px',
            height: `${fillHeight}px`,
            background: theme.brass,
            transition: 'height 0.5s ease-out',
          }} />

          {STEPS.map((step, i) => (
            <div key={step.n} data-step>
              <TimelineStep step={step} index={i} isLast={i === STEPS.length - 1} onVisible={handleVisible} />
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '56px', padding: 'clamp(24px,3.5vw,36px)', background: theme.surface,
          borderRadius: '12px', border: `1px solid ${theme.line}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '18px'
        }}>
          <div>
            <div style={{ fontFamily: theme.fontDisplay, fontSize: '19px', fontWeight: '600', color: theme.ink, marginBottom: '4px' }}>
              Ready to get started?
            </div>
            <p style={{ fontSize: '13.5px', color: theme.inkSoft }}>Create your profile and let the right people find you.</p>
          </div>
          <Link href="/members/new" style={{
            display: 'inline-block', background: theme.brass, color: 'white',
            borderRadius: '8px', padding: '13px 24px', fontSize: '14px', fontWeight: '600', textDecoration: 'none', whiteSpace: 'nowrap'
          }}>Create Your Profile</Link>
        </div>
      </div>
    </div>
  )
}
