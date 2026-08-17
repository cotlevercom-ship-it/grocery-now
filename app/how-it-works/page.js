'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  PenLine, TrendingUp, HeartHandshake, RefreshCw,
  Code2, Megaphone, PenTool, Briefcase,
  BarChart3, Users, Target, Compass,
  ClipboardCheck,
  Building2, Wrench, Hammer, ListChecks,
  UsersRound, Handshake,
  Sprout,
  Trophy,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { theme } from '@/lib/theme'

// Cream/beige card palette — matches the reference slide-deck design.
// The page around the carousel stays on the site's dark theme; each
// slide card itself uses this light palette instead of theme.paper/ink.
const card = {
  bg: '#F3E6D5',
  bgAlt: '#EFDFC9',
  text: '#2B1811',
  textSoft: '#6B5142',
  accent: '#8C2E20',
  pill: '#E6C8B8',
  line: 'rgba(43,24,17,0.14)',
}

function IconPill({ Icon }) {
  return (
    <div style={{
      width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
      background: card.pill,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={16} color={card.accent} strokeWidth={2} />
    </div>
  )
}

function BulletRow({ Icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
      <IconPill Icon={Icon} />
      <span style={{ fontSize: '14.5px', color: card.text }}>{text}</span>
    </div>
  )
}

function CenterArt({ Icon, size = 120 }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: `${size}px`, height: `${size}px`, margin: '0 auto',
    }}>
      <Icon size={size} color={card.accent} strokeWidth={1.1} />
    </div>
  )
}

// Wraps one element so it fades/slides up into place, staggered by `i`.
// Only meant to be used inside a freshly-mounted (active) slide — see
// the remount-on-active-change trick in HowItWorksPage below.
function Reveal({ i, children }) {
  return (
    <div className="hiw-anim-item" style={{ '--i': i }}>
      {children}
    </div>
  )
}

// ---- Slide content ----

function CoverSlide() {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center', padding: '32px 24px', background: card.bgAlt,
    }}>
      <Reveal i={0}>
        <div style={{ fontFamily: theme.fontDisplay, fontSize: 'clamp(26px,5vw,32px)', fontWeight: '700', marginBottom: '6px' }}>
          <span style={{ color: card.text }}>Cot</span><span style={{ color: card.accent }}>Lever</span>
        </div>
        <div style={{ width: '46px', height: '1.5px', background: card.accent, margin: '14px auto 22px' }} />
      </Reveal>
      <Reveal i={1}>
        <h1 style={{
          fontFamily: theme.fontDisplay, fontWeight: '700', color: card.text,
          fontSize: 'clamp(26px,5.5vw,36px)', lineHeight: '1.2', marginBottom: '14px',
        }}>Find Your<br />Co-Founder</h1>
      </Reveal>
      <Reveal i={2}>
        <p style={{ fontSize: '14.5px', color: card.textSoft, lineHeight: '1.6', maxWidth: '320px' }}>
          Great businesses start with the right people.
        </p>
      </Reveal>
      <Reveal i={3}>
        <div style={{ marginTop: '36px' }}>
          <CenterArt Icon={Handshake} size={96} />
        </div>
      </Reveal>
    </div>
  )
}

function ContentSlide({ n, title, intro, bullets, closer, Icon }) {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: 'clamp(24px,5vw,40px)', background: card.bg,
    }}>
      <div style={{ display: 'flex', gap: 'clamp(16px,4vw,32px)', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 260px', minWidth: '220px' }}>
          <Reveal i={0}>
            <div style={{
              fontFamily: theme.fontMono, fontSize: '13px', fontWeight: '700', color: card.accent,
            }}>{n}</div>
            <div style={{ width: '22px', height: '2px', background: card.accent, margin: '4px 0 14px' }} />
          </Reveal>
          <Reveal i={1}>
            <h2 style={{
              fontFamily: theme.fontDisplay, fontSize: 'clamp(21px,3.4vw,26px)', fontWeight: '600',
              color: card.text, marginBottom: '10px',
            }}>{title}</h2>
          </Reveal>
          {intro && (
            <Reveal i={2}>
              <p style={{ fontSize: '13.5px', color: card.textSoft, lineHeight: '1.55', marginBottom: '18px' }}>{intro}</p>
            </Reveal>
          )}
          {bullets && bullets.map((b, i) => (
            <Reveal key={i} i={3 + i}>
              <BulletRow Icon={b.Icon} text={b.text} />
            </Reveal>
          ))}
          {closer && (
            <Reveal i={3 + (bullets ? bullets.length : 0)}>
              <p style={{ fontSize: '13.5px', color: card.text, fontWeight: '600', marginTop: '16px' }}>{closer}</p>
            </Reveal>
          )}
        </div>
        {Icon && (
          <Reveal i={4 + (bullets ? bullets.length : 0)}>
            <div style={{ flex: '0 0 auto', width: 'clamp(90px,20vw,120px)' }}>
              <CenterArt Icon={Icon} size={90} />
            </div>
          </Reveal>
        )}
      </div>
    </div>
  )
}

function ClosingSlide() {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center', padding: '32px 24px', background: card.bgAlt,
    }}>
      <Reveal i={0}>
        <div style={{ fontFamily: theme.fontDisplay, fontSize: 'clamp(24px,4.5vw,28px)', fontWeight: '700', color: card.text, marginBottom: '18px' }}>
          CotLever
        </div>
      </Reveal>
      <Reveal i={1}>
        <p style={{ fontSize: '14.5px', color: card.textSoft, lineHeight: '1.65', maxWidth: '320px', marginBottom: '24px' }}>
          The right co-founder can turn your idea into something extraordinary.
        </p>
      </Reveal>
      <Reveal i={2}>
        <CenterArt Icon={Handshake} size={72} />
      </Reveal>
      <Reveal i={3}>
        <p style={{
          fontFamily: theme.fontDisplay, fontSize: '16px', fontWeight: '600', color: card.accent, marginTop: '24px', marginBottom: '28px',
        }}>Let&apos;s build the future together.</p>
      </Reveal>
      <Reveal i={4}>
        <Link href="/members/new" style={{
          display: 'inline-block', background: card.accent, color: '#F3E6D5',
          borderRadius: '8px', padding: '13px 26px', fontSize: '14px', fontWeight: '600', textDecoration: 'none',
        }}>Create Your Profile</Link>
      </Reveal>
    </div>
  )
}

const SLIDES = [
  { key: 'cover', render: () => <CoverSlide /> },
  {
    key: '01', render: () => (
      <ContentSlide
        n="01" title="The Idea" Icon={Sprout}
        intro="Every great business begins with..."
        bullets={[
          { Icon: PenLine, text: 'A vision.' },
          { Icon: TrendingUp, text: 'A solid strategy.' },
          { Icon: HeartHandshake, text: 'Passion & purpose.' },
          { Icon: RefreshCw, text: 'A plan to execute.' },
        ]}
        closer="But execution makes it real."
      />
    )
  },
  {
    key: '02', render: () => (
      <ContentSlide
        n="02" title="The Missing Piece" Icon={Target}
        intro="Maybe you need someone."
        bullets={[
          { Icon: Code2, text: 'A developer.' },
          { Icon: Megaphone, text: 'A marketer.' },
          { Icon: PenTool, text: 'A designer.' },
          { Icon: Briefcase, text: 'A business mind.' },
        ]}
        closer="Someone who brings what you don't."
      />
    )
  },
  {
    key: '03', render: () => (
      <ContentSlide
        n="03" title="The Market" Icon={BarChart3}
        intro="Analyze the landscape and your place in it..."
        bullets={[
          { Icon: TrendingUp, text: 'Growth and size.' },
          { Icon: Users, text: 'Key competitors.' },
          { Icon: Target, text: 'A target audience.' },
          { Icon: Compass, text: 'A clear direction.' },
        ]}
        closer="Insight leads to success."
      />
    )
  },
  {
    key: '04', render: () => (
      <ContentSlide
        n="04" title="Tell Us About You" Icon={ClipboardCheck}
        intro="Your skills. Your vision. Your goals."
        closer="Create your founder profile and tell the community what you're building — and who you're looking for."
      />
    )
  },
  {
    key: '05', render: () => (
      <ContentSlide
        n="05" title="The Execution" Icon={Building2}
        intro="Put the strategy into motion and build with precision..."
        bullets={[
          { Icon: Building2, text: 'Build strong foundations.' },
          { Icon: Wrench, text: 'Leverage the right tools.' },
          { Icon: Hammer, text: 'Streamline team workflows.' },
          { Icon: ListChecks, text: 'Monitor progress daily.' },
        ]}
        closer="Action makes the plan reality."
      />
    )
  },
  {
    key: '06', render: () => (
      <ContentSlide
        n="06" title="The Team" Icon={UsersRound}
        intro="Assemble the right skills and foster collaboration..."
        bullets={[
          { Icon: UsersRound, text: 'Define clear roles.' },
          { Icon: RefreshCw, text: 'Leverage diverse strengths.' },
          { Icon: Handshake, text: 'Encourage open communication.' },
          { Icon: Target, text: 'Monitor common goals.' },
        ]}
        closer="Action makes the team unstoppable."
      />
    )
  },
  {
    key: '07', render: () => (
      <ContentSlide
        n="07" title="The Growth" Icon={TrendingUp}
        intro="Expand the reach and achieve new milestones..."
        bullets={[
          { Icon: Megaphone, text: 'Define market presence.' },
          { Icon: Compass, text: 'Leverage new opportunities.' },
          { Icon: Sprout, text: 'Encourage customer feedback.' },
          { Icon: Target, text: 'Monitor growth metrics.' },
        ]}
        closer="Action makes the growth sustainable."
      />
    )
  },
  {
    key: '08', render: () => (
      <ContentSlide
        n="08" title="The Success" Icon={Trophy}
        intro="Every milestone reached is proof the right team was worth finding."
        bullets={[
          { Icon: Megaphone, text: 'A stronger market presence.' },
          { Icon: Compass, text: 'New opportunities, seized.' },
          { Icon: Sprout, text: 'A community that trusts you.' },
          { Icon: Target, text: 'Goals met, together.' },
        ]}
        closer="This is what building with the right people looks like."
      />
    )
  },
  { key: 'closing', render: () => <ClosingSlide /> },
]

export default function HowItWorksPage() {
  const [index, setIndex] = useState(0)
  const trackRef = useRef(null)
  const touchStartX = useRef(null)

  const goTo = useCallback((i) => {
    const clamped = Math.max(0, Math.min(SLIDES.length - 1, i))
    setIndex(clamped)
  }, [])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') goTo(index + 1)
      if (e.key === 'ArrowLeft') goTo(index - 1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [index, goTo])

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) {
      if (dx < 0) goTo(index + 1)
      else goTo(index - 1)
    }
    touchStartX.current = null
  }

  return (
    <div style={{ background: theme.paper, minHeight: '70vh' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(20px,4vw,40px) clamp(12px,3vw,24px)' }}>
        <div style={{
          fontFamily: theme.fontMono, fontSize: '11.5px', letterSpacing: '0.1em', textTransform: 'uppercase',
          color: theme.brassDark, marginBottom: '6px', fontWeight: '600', textAlign: 'center',
        }}>The Process</div>
        <h1 style={{
          fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(24px,3.4vw,32px)',
          color: theme.ink, marginBottom: '24px', lineHeight: '1.15', textAlign: 'center',
        }}>How Cot Lever works</h1>

        <div style={{ position: 'relative' }}>
          {/* Slide viewport */}
          <div
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={{
              position: 'relative', overflow: 'hidden', borderRadius: '14px',
              border: `1px solid ${theme.line}`, background: theme.paper,
              height: 'clamp(420px,62vh,560px)',
            }}
          >
            <div
              ref={trackRef}
              style={{
                display: 'flex', height: '100%', width: `${SLIDES.length * 100}%`,
                transform: `translateX(-${(index * 100) / SLIDES.length}%)`,
                transition: 'transform 0.45s ease-out',
              }}
            >
              {SLIDES.map((s, i) => (
                <div key={s.key} style={{ width: `${100 / SLIDES.length}%`, height: '100%', flexShrink: 0 }}>
                  <div key={i === index ? 'active' : 'inactive'} style={{ height: '100%' }}>
                    {s.render()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prev / Next arrows — hidden on touch/mobile widths via CSS below */}
          <button
            className="hiw-arrow"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="Previous slide"
            style={{
              position: 'absolute', left: '-18px', top: '50%', transform: 'translateY(-50%)',
              width: '38px', height: '38px', borderRadius: '50%',
              background: theme.surface, border: `1px solid ${theme.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              opacity: index === 0 ? 0.35 : 1,
            }}
          >
            <ChevronLeft size={18} color={theme.ink} />
          </button>
          <button
            className="hiw-arrow"
            onClick={() => goTo(index + 1)}
            disabled={index === SLIDES.length - 1}
            aria-label="Next slide"
            style={{
              position: 'absolute', right: '-18px', top: '50%', transform: 'translateY(-50%)',
              width: '38px', height: '38px', borderRadius: '50%',
              background: theme.surface, border: `1px solid ${theme.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              opacity: index === SLIDES.length - 1 ? 0.35 : 1,
            }}
          >
            <ChevronRight size={18} color={theme.ink} />
          </button>
        </div>

        {/* Dot indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '7px', marginTop: '18px', flexWrap: 'wrap' }}>
          {SLIDES.map((s, i) => (
            <button
              key={s.key}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === index ? '20px' : '7px', height: '7px', borderRadius: '4px',
                background: i === index ? theme.brass : theme.line,
                border: 'none', cursor: 'pointer', transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        <style jsx>{`
          @media (max-width: 640px) {
            .hiw-arrow { display: none; }
          }
        `}</style>
        <style jsx global>{`
          @keyframes hiwFadeUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .hiw-anim-item {
            opacity: 0;
            animation: hiwFadeUp 0.6s cubic-bezier(0.16, 0.8, 0.3, 1) forwards;
            animation-delay: calc(var(--i) * 100ms);
          }
        `}</style>
      </div>
    </div>
  )
}
