'use client'
import Link from 'next/link'
import { theme } from '@/lib/theme'

const STEPS = [
  {
    n: '01',
    title: 'List your business',
    body: 'Tell us what you\'re looking for — co-founder, partner, investor, employee, supplier, or buyer — and a bit about your business. Takes a few minutes.',
  },
  {
    n: '02',
    title: 'Choose a plan and pay',
    body: 'Pick a monthly or yearly listing plan and confirm payment via bKash. One simple fee, no hidden costs.',
  },
  {
    n: '03',
    title: 'We verify your listing',
    body: 'Every listing is reviewed before it goes live — this keeps the directory trustworthy for everyone browsing it.',
  },
  {
    n: '04',
    title: 'Your listing goes live',
    body: 'Once approved, your business appears in the directory under every category you selected.',
  },
  {
    n: '05',
    title: 'Interested people contact you',
    body: 'Anyone who finds your listing reaches out directly using the contact details you provided — you stay in control of every conversation.',
  },
]

export default function HowItWorksPage() {
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
          From listing your business to getting contacted by the right person — five steps, start to finish.
        </p>

        <div style={{ position: 'relative' }}>
          {/* connecting line */}
          <div style={{
            position: 'absolute', left: '23px', top: '10px', bottom: '10px', width: '1.5px',
            background: theme.line,
          }} />

          {STEPS.map((step, i) => (
            <div key={step.n} style={{ display: 'flex', gap: '24px', marginBottom: i < STEPS.length - 1 ? '40px' : 0, position: 'relative' }}>
              <div style={{
                flexShrink: 0, width: '48px', height: '48px', borderRadius: '50%',
                background: theme.ink, color: theme.paper,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: theme.fontMono, fontSize: '13px', fontWeight: '600', zIndex: 1,
                border: `4px solid ${theme.paper}`,
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
            <p style={{ fontSize: '13.5px', color: theme.inkSoft }}>List your business and let the right people find you.</p>
          </div>
          <Link href="/listings/new" style={{
            display: 'inline-block', background: theme.brass, color: 'white',
            borderRadius: '8px', padding: '13px 24px', fontSize: '14px', fontWeight: '600', textDecoration: 'none', whiteSpace: 'nowrap'
          }}>List Your Business</Link>
        </div>
      </div>
    </div>
  )
}
