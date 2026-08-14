'use client'
import Link from 'next/link'
import { theme } from '@/lib/theme'

const REASONS = [
  {
    title: 'Built for founders in Bangladesh',
    body: 'Finding a co-founder, partner, employee, supplier, or buyer here usually means asking around your own circle. Cot Lever gives you a directory built specifically for that search.',
  },
  {
    title: 'Every listing is verified',
    body: 'Nothing goes live without admin review first. That keeps the directory trustworthy — when you see a listing, you know a real person stands behind it.',
  },
  {
    title: 'Co-founder search included',
    body: 'Have an idea but no one to build it with? Post it as a listing and select "Co-founder" — the same simple flow as any other listing.',
  },
  {
    title: 'You stay in control',
    body: 'Interested people contact you directly with the details you provide. No middleman, no algorithm deciding who you talk to.',
  },
]

export default function WhyUseCotleverPage() {
  return (
    <div style={{ background: theme.paper, minHeight: '70vh' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(28px,4vw,56px) clamp(16px,3vw,24px)' }}>
        <div style={{
          fontFamily: theme.fontMono, fontSize: '11.5px', letterSpacing: '0.1em', textTransform: 'uppercase',
          color: theme.brassDark, marginBottom: '10px', fontWeight: '600'
        }}>Why Cot Lever</div>

        <h1 style={{
          fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(28px,3.6vw,40px)',
          color: theme.ink, marginBottom: '16px', lineHeight: '1.15'
        }}>Why use Cot Lever</h1>

        <p style={{ fontSize: '15px', color: theme.inkSoft, lineHeight: '1.6', marginBottom: '44px', maxWidth: '520px' }}>
          A directory built to connect founders in Bangladesh with the partners and people they need.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {REASONS.map((r) => (
            <div key={r.title} style={{
              padding: 'clamp(20px,3vw,28px)', background: theme.surface,
              borderRadius: '12px', border: `1px solid ${theme.line}`,
            }}>
              <h2 style={{ fontFamily: theme.fontDisplay, fontSize: '18px', fontWeight: '600', color: theme.ink, marginBottom: '8px' }}>
                {r.title}
              </h2>
              <p style={{ fontSize: '14px', color: theme.inkSoft, lineHeight: '1.65' }}>{r.body}</p>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '48px', padding: 'clamp(24px,3.5vw,36px)', background: theme.surface,
          borderRadius: '12px', border: `1px solid ${theme.line}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '18px'
        }}>
          <div>
            <div style={{ fontFamily: theme.fontDisplay, fontSize: '19px', fontWeight: '600', color: theme.ink, marginBottom: '4px' }}>
              See how it works
            </div>
            <p style={{ fontSize: '13.5px', color: theme.inkSoft }}>From listing to getting contacted, step by step.</p>
          </div>
          <Link href="/how-it-works" style={{
            display: 'inline-block', background: theme.brass, color: 'white',
            borderRadius: '8px', padding: '13px 24px', fontSize: '14px', fontWeight: '600', textDecoration: 'none', whiteSpace: 'nowrap'
          }}>How It Works</Link>
        </div>
      </div>
    </div>
  )
}
