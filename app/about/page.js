const INK = '#241209'
const INK_SOFT = '#3A281C'
const ACCENT = '#8C2E20'
const PANEL_BG = 'rgba(240,228,209,0.94)'
const FONT_DISPLAY = "var(--font-fraunces), Georgia, serif"
const FONT_BODY = "var(--font-plex-sans), Arial, sans-serif"
const FONT_MONO = "var(--font-plex-mono), 'Courier New', monospace"

function Kicker({ children }) {
  return (
    <div
      style={{
        fontFamily: FONT_MONO,
        fontSize: '11px',
        fontWeight: '600',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: ACCENT,
        marginBottom: '6px',
      }}
    >
      {children}
    </div>
  )
}

function SectionHeading({ children }) {
  return (
    <h2
      style={{
        fontFamily: FONT_DISPLAY,
        fontWeight: '700',
        fontSize: 'clamp(20px, 2.1vw, 27px)',
        color: INK,
        margin: '0 0 12px',
        lineHeight: '1.2',
      }}
    >
      {children}
    </h2>
  )
}

function Divider() {
  return <div style={{ height: '1px', background: 'rgba(43,24,17,0.18)', margin: '26px 0' }} />
}

export default function AboutPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: `url(/marketing/about-us-bg.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div
        style={{
          maxWidth: '1000px',
          marginLeft: 'clamp(24px, 32vw, 560px)',
          marginRight: 'clamp(24px, 6vw, 100px)',
          paddingTop: 'clamp(140px, 16vh, 220px)',
          paddingBottom: '80px',
        }}
      >
        <h1
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: '800',
            fontSize: 'clamp(34px, 4.4vw, 56px)',
            color: INK,
            margin: '0 0 28px',
            lineHeight: '1.05',
          }}
        >
          About <span style={{ color: ACCENT }}>Us</span>
        </h1>

        <div
          style={{
            background: PANEL_BG,
            borderRadius: '10px',
            padding: 'clamp(20px, 3vw, 36px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
          }}
        >
          <Kicker>Our Story</Kicker>
          <SectionHeading>Every great venture starts as two people who found each other</SectionHeading>
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: '14px',
              lineHeight: '1.75',
              color: INK_SOFT,
              columnCount: 2,
              columnGap: '32px',
            }}
          >
            <p style={{ margin: '0 0 14px' }}>
              Cotlever started with a simple observation: Bangladesh has no shortage of ideas or
              ambition, but the people who could turn those ideas into real businesses were rarely
              finding each other. A developer with a working prototype and no business partner. A
              marketer with market instincts and no product to build. An investor ready to back the
              right team, but no way to find one.
            </p>
            <p style={{ margin: '0 0 14px' }}>
              We built Cotlever to close that gap — a place where founders, co-founders, and early
              partners can find each other by what they actually bring to the table, not just who
              they already know.
            </p>
          </div>

          <Divider />

          <Kicker>Our Mission</Kicker>
          <SectionHeading>Help ideas find the right people, and turn them into impact</SectionHeading>
          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize: '14px',
              lineHeight: '1.75',
              color: INK_SOFT,
              margin: '0 0 8px',
              maxWidth: '640px',
            }}
          >
            Every profile on Cotlever exists to answer one question — who should you be building
            with? We keep the platform focused on that single job: real people, real skills, and a
            direct way to start the conversation.
          </p>

          <Divider />

          <Kicker>Looking Ahead</Kicker>
          <SectionHeading>Building the network, one founder at a time</SectionHeading>
          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize: '14px',
              lineHeight: '1.75',
              color: INK_SOFT,
              margin: '0',
              maxWidth: '640px',
            }}
          >
            We're still early. Every founder who joins makes the next match easier to find — that's
            what we're building toward.
          </p>
        </div>
      </div>
    </div>
  )
}
