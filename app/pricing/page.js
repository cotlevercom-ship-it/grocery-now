'use client'
import Link from 'next/link'
import { theme } from '@/lib/theme'

const PLAN = {
  name: 'List on Cot Lever',
  tagline: 'List your business, idea, or co-founder search for a partner, co-founder, or share holder.',
  options: [
    { label: 'Yearly', regular: '৳6000', discount: '৳2500' },
  ],
  features: [
    'Add up to 3 Business listings under one subscription',
    'Every listing shown in the public directory, searchable by anyone browsing',
    'A verified checkmark badge once a listing is approved — builds trust with people who find you',
    'Interested people contact you directly using the details you provide',
    'Listings stay active for the full plan period, then renew',
  ],
  cta: { label: 'Get Started', href: '/login' },
}

export default function PricingPage() {
  return (
    <div style={{ background: theme.paper, minHeight: '70vh' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(28px,4vw,56px) clamp(16px,3vw,24px)' }}>
        <div style={{
          fontFamily: theme.fontMono, fontSize: '11.5px', letterSpacing: '0.1em', textTransform: 'uppercase',
          color: theme.brassDark, marginBottom: '10px', fontWeight: '600'
        }}>Pricing</div>

        <h1 style={{
          fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(28px,3.6vw,40px)',
          color: theme.ink, marginBottom: '16px', lineHeight: '1.15'
        }}>Simple, transparent pricing</h1>

        <p style={{ fontSize: '15px', color: theme.inkSoft, lineHeight: '1.6', marginBottom: '44px', maxWidth: '520px' }}>
          One simple listing, pay via bKash. Every listing is reviewed by our team before it goes live.
        </p>

        <div style={{
          padding: 'clamp(22px,3.5vw,32px)', background: theme.surface,
          borderRadius: '12px', border: `1px solid ${theme.line}`,
        }}>
          <h2 style={{ fontFamily: theme.fontDisplay, fontSize: '20px', fontWeight: '600', color: theme.ink, marginBottom: '6px' }}>
            {PLAN.name}
          </h2>
          <p style={{ fontSize: '13.5px', color: theme.inkSoft, marginBottom: '18px' }}>{PLAN.tagline}</p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {PLAN.options.map((opt) => (
              <div key={opt.label} style={{
                flex: '1 1 160px', border: `1px solid ${theme.line}`, borderRadius: '10px',
                padding: '14px 16px',
              }}>
                <div style={{ fontSize: '12px', color: theme.inkSoft, marginBottom: '4px' }}>{opt.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontFamily: theme.fontDisplay, fontSize: '22px', fontWeight: '700', color: theme.ink }}>
                    {opt.discount || opt.regular}
                  </span>
                  {opt.discount && (
                    <span style={{ fontSize: '13px', color: theme.inkSoft, textDecoration: 'line-through' }}>{opt.regular}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '22px' }}>
            <div style={{ fontFamily: theme.fontMono, fontSize: '10.5px', letterSpacing: '0.06em', textTransform: 'uppercase', color: theme.inkSoft, marginBottom: '10px', fontWeight: '600' }}>
              What you get
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {PLAN.features.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.signal} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                    style={{ flexShrink: 0, marginTop: '3px' }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span style={{ fontSize: '13.5px', color: theme.ink, lineHeight: '1.5' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <Link href={PLAN.cta.href} style={{
            display: 'inline-block', background: theme.brass, color: 'white',
            borderRadius: '8px', padding: '11px 20px', fontSize: '13.5px', fontWeight: '600', textDecoration: 'none',
          }}>{PLAN.cta.label}</Link>
        </div>

        <p style={{ fontSize: '13px', color: theme.inkSoft, marginTop: '28px', lineHeight: '1.6' }}>
          Full terms and refund details are in our{' '}
          <Link href="/payment-policy" style={{ color: theme.brass, fontWeight: '600' }}>Payment Policy</Link>.
        </p>
      </div>
    </div>
  )
}
