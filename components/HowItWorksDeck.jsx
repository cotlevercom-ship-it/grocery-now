'use client'
import { useState, useRef, useEffect } from 'react'
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

// Wraps one element so it fades into place, staggered by `i`. Stays
// invisible until its parent `.hiw-slide` gets the `.is-revealed`
// class (added by SlideCard's IntersectionObserver on scroll-into-view).
function Reveal({ i, children }) {
  return (
    <div className="hiw-anim-item" style={{ '--i': i }}>
      {children}
    </div>
  )
}

// ---- Slide content ----

function ContentSlide({ n, title, intro, bullets, closer, Icon }) {
  return (
    <div style={{
      width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
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
      width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
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

function SlideCard({ slide, isFirst }) {
  const ref = useRef(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (isFirst) {
      // First card is already in view on load — reveal immediately.
      setRevealed(true)
    }
    // Re-triggers on every scroll-into-view (both directions), not just
    // the first time — toggling revealed off when it leaves the viewport
    // lets the fade-up animation replay the next time it comes back in.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setRevealed(entry.isIntersecting)
        })
      },
      { threshold: 0.3, rootMargin: '0px 0px -10% 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [isFirst])

  return (
    <div
      ref={ref}
      className={revealed ? 'hiw-slide is-revealed' : 'hiw-slide'}
      style={{
        borderRadius: '14px', border: `1px solid ${theme.line}`, overflow: 'hidden',
        marginBottom: 'clamp(18px,3vw,28px)', minHeight: 'clamp(360px,52vh,480px)',
        display: 'flex',
      }}
    >
      {slide.render()}
    </div>
  )
}

// Shared scroll-reveal "How It Works" deck. Used standalone on
// /how-it-works (with heading + max-width wrapper) and embedded
// directly on the homepage (mobile-only, no heading/wrapper needed
// since the caller supplies its own container).
export default function HowItWorksDeck({ showHeading = true }) {
  const dotRefs = useRef([])

  const scrollToSlide = (i) => {
    const el = dotRefs.current[i]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div>
      {showHeading && (
        <>
          <div style={{
            fontFamily: theme.fontMono, fontSize: '11.5px', letterSpacing: '0.1em', textTransform: 'uppercase',
            color: theme.brassDark, marginBottom: '6px', fontWeight: '600', textAlign: 'center',
          }}>The Process</div>
          <h1 style={{
            fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(24px,3.4vw,32px)',
            color: theme.ink, marginBottom: '10px', lineHeight: '1.15', textAlign: 'center',
          }}>How Cot Lever works</h1>
          <p style={{
            fontSize: '13px', color: theme.inkSoft, textAlign: 'center', marginBottom: '32px',
          }}>Scroll down — each step reveals as you go.</p>
        </>
      )}

      {SLIDES.map((s, i) => (
        <div key={s.key} ref={(el) => { dotRefs.current[i] = el }}>
          <SlideCard slide={s} isFirst={i === 0} />
        </div>
      ))}

      {/* Quick-jump dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '7px', marginTop: '8px', flexWrap: 'wrap' }}>
        {SLIDES.map((s, i) => (
          <button
            key={s.key}
            onClick={() => scrollToSlide(i)}
            aria-label={`Jump to slide ${i + 1}`}
            style={{
              width: '7px', height: '7px', borderRadius: '4px',
              background: theme.line, border: 'none', cursor: 'pointer',
            }}
          />
        ))}
      </div>

      <style jsx global>{`
        @keyframes hiwFadeUp {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .hiw-anim-item { opacity: 0; }
        .hiw-slide.is-revealed .hiw-anim-item {
          animation: hiwFadeUp 0.7s ease-out forwards;
          animation-delay: calc(var(--i) * 100ms);
        }
      `}</style>
    </div>
  )
}
