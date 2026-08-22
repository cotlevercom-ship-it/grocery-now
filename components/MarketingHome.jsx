'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Search, ArrowRight, Lightbulb, UserSearch, MessageSquare,
  Users, TrendingUp, Handshake, Rocket, Heart, Puzzle, User,
} from 'lucide-react'
import { theme } from '@/lib/theme'

// Light cream/pink landing hero for logged-out visitors — mirrors the
// logged-in homepage hero (components/HomeTabs.jsx) in style, per the same
// user-provided reference mockup. Scoped to this file only via a local `lt`
// const; the global dark Navbar above it is untouched. Since browsing /members
// requires login, every CTA here routes to /login (which also offers signup).
const lt = {
  bg: '#FBF3EF',
  card: '#FFFFFF',
  chipBg: '#F7E3DC',
  ink: '#221714',
  inkSoft: '#7C6F6A',
  accent: theme.brass,
  line: '#F0DED6',
}

const ROLE_CHIPS = [
  { label: 'Co-Founder', Icon: Users },
  { label: 'Investor', Icon: TrendingUp },
  { label: 'Partner', Icon: Handshake },
  { label: 'StartUp', Icon: Rocket },
]

const STEPS = [
  { n: '01', Icon: Lightbulb, title: 'Share your idea', body: "Tell us what you're building and what you need." },
  { n: '02', Icon: UserSearch, title: 'Find the right person', body: 'Discover talented people who match your needs.' },
  { n: '03', Icon: MessageSquare, title: 'Build together', body: 'Connect, chat and turn your idea into something great.' },
]

export default function MarketingHome() {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const goSearch = (e) => {
    e.preventDefault()
    router.push('/login')
  }

  return (
    <div style={{ background: lt.bg, minHeight: '100vh' }}>
      <h1 style={{
        position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px',
        overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0
      }}>Find the right people for your business — Cot Lever connects founders in Bangladesh with the co-founders, partners, and share holders their business needs.</h1>

      <div className="mh-hero-wrap">
        <div className="mh-hero-text">
          {/* Hero */}
          <h2 style={{
            fontFamily: theme.fontDisplay, fontWeight: '700', fontSize: 'clamp(32px,7vw,46px)',
            color: lt.ink, lineHeight: '1.15', margin: '10px 0 16px', letterSpacing: '-0.01em',
          }}>
            Have an idea? Find the right person to <span style={{ color: lt.accent }}>build it.</span>
          </h2>
          <p style={{ fontSize: '16px', color: lt.inkSoft, lineHeight: '1.5', marginBottom: '26px', maxWidth: '440px' }}>
            Connect with people who have the skills your idea needs.
          </p>

          <Link href="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none',
            background: lt.accent, color: '#FFFFFF', fontWeight: '700', fontSize: '15.5px',
            padding: '15px 26px', borderRadius: '999px', marginBottom: '30px',
            boxShadow: '0 8px 20px rgba(179,55,42,0.25)',
          }}>
            Find Your Person <ArrowRight size={18} />
          </Link>

          {/* Search */}
          <form onSubmit={goSearch} style={{ position: 'relative', marginBottom: '16px' }}>
            <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: lt.inkSoft, display: 'flex' }}>
              <Search size={18} />
            </span>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="What are you looking for?"
              style={{
                width: '100%', boxSizing: 'border-box', border: `1px solid ${lt.line}`, borderRadius: '16px',
                padding: '16px 18px 16px 48px', fontSize: '15px', fontFamily: theme.fontBody,
                background: lt.card, color: lt.ink, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            />
          </form>

          {/* Quick role chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {ROLE_CHIPS.map(({ label, Icon }) => (
              <Link
                key={label} href="/login"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px', textDecoration: 'none',
                  background: lt.chipBg, color: lt.accent, fontWeight: '600', fontSize: '13.5px',
                  padding: '10px 16px', borderRadius: '999px',
                }}
              >
                <Icon size={15} /> {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop-only decorative panel: floating role cards, filling the space a
            narrow mobile-first hero leaves empty on wide viewports. */}
        <div className="mh-hero-visual">
          <div style={{ position: 'relative', width: '100%', height: '420px' }}>
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              width: '340px', height: '340px', borderRadius: '50%', background: lt.chipBg, opacity: 0.7,
            }} />
            {[
              { Icon: Users, label: 'Co-Founder', top: '4%', left: '8%', rot: -7 },
              { Icon: TrendingUp, label: 'Investor', top: '10%', left: '54%', rot: 5 },
              { Icon: Handshake, label: 'Partner', top: '56%', left: '2%', rot: 6 },
              { Icon: Rocket, label: 'StartUp', top: '62%', left: '58%', rot: -5 },
            ].map(({ Icon, label, top, left, rot }) => (
              <div key={label} style={{
                position: 'absolute', top, left, transform: `rotate(${rot}deg)`,
                background: lt.card, borderRadius: '16px', padding: '14px 18px',
                boxShadow: '0 10px 30px rgba(89,42,31,0.12)', display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '10px', background: lt.chipBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={17} color={lt.accent} strokeWidth={2} />
                </div>
                <span style={{ fontWeight: '700', fontSize: '13.5px', color: lt.ink, whiteSpace: 'nowrap' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mh-rest">
        {/* How it works */}
        <h3 style={{
          fontFamily: theme.fontDisplay, fontWeight: '700', fontSize: 'clamp(22px,5vw,26px)',
          color: lt.ink, textAlign: 'center', marginBottom: '22px',
        }}>How CotLever Works</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: '14px', marginBottom: '46px' }}>
          {STEPS.map(({ n, Icon, title, body }) => (
            <div key={n} style={{
              position: 'relative', background: lt.chipBg, borderRadius: '18px',
              padding: '22px 16px 20px', textAlign: 'center',
            }}>
              <span style={{
                position: 'absolute', top: '10px', left: '10px', width: '26px', height: '26px', borderRadius: '50%',
                background: lt.accent, color: '#FFFFFF', fontSize: '11px', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{n}</span>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%', background: lt.card, margin: '6px auto 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={24} color={lt.accent} strokeWidth={1.8} />
              </div>
              <div style={{ fontFamily: theme.fontDisplay, fontWeight: '700', fontSize: '15px', color: lt.ink, marginBottom: '6px' }}>{title}</div>
              <div style={{ fontSize: '12.5px', color: lt.inkSoft, lineHeight: '1.5' }}>{body}</div>
            </div>
          ))}
        </div>

        {/* Bottom CTA banner */}
        <div style={{
          background: lt.chipBg, borderRadius: '22px', padding: '30px 22px', textAlign: 'center', marginBottom: '34px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '18px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px', background: lt.card,
              display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-6deg)',
            }}><Puzzle size={24} color={lt.accent} /></div>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px', background: lt.card,
              display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(6deg)',
            }}><User size={24} color={lt.accent} /></div>
          </div>
          <h3 style={{
            fontFamily: theme.fontDisplay, fontWeight: '700', fontSize: 'clamp(19px,4.5vw,22px)',
            color: lt.ink, marginBottom: '18px', lineHeight: '1.3',
          }}>Your idea is waiting for the right person.</h3>
          <Link href="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none',
            background: lt.accent, color: '#FFFFFF', fontWeight: '700', fontSize: '15px',
            padding: '14px 24px', borderRadius: '999px',
          }}>
            Find People <ArrowRight size={17} />
          </Link>
        </div>

        {/* Footer tagline */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', color: lt.ink, fontWeight: '600', fontSize: '13.5px', marginBottom: '4px' }}>
            <Heart size={15} color={lt.accent} fill={lt.accent} /> Built for dreamers and doers.
          </div>
          <div style={{ fontSize: '13px', color: lt.inkSoft }}>Let&apos;s build something amazing, together.</div>
        </div>
      </div>

      <style jsx>{`
        .mh-hero-wrap {
          max-width: 640px;
          margin: 0 auto;
          padding: clamp(20px,4vw,40px) clamp(16px,4vw,56px) 0;
        }
        .mh-rest {
          max-width: 640px;
          margin: 0 auto;
          padding: 40px clamp(16px,4vw,56px) 60px;
        }
        .mh-hero-visual { display: none; }
        @media (min-width: 1024px) {
          .mh-hero-wrap {
            max-width: 1180px;
            display: flex;
            align-items: center;
            gap: 56px;
            padding-top: 70px;
            padding-bottom: 10px;
          }
          .mh-hero-text { flex: 1 1 0; max-width: 560px; }
          .mh-hero-visual { display: block; flex: 1 1 0; }
          .mh-rest { max-width: 1040px; padding-top: 30px; }
        }
      `}</style>
    </div>
  )
}
