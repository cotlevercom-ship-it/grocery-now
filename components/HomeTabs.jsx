'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Search, ArrowRight, Lightbulb, UserSearch, MessageSquare,
  Code2, Palette, Megaphone, Briefcase, Heart, Puzzle, User,
} from 'lucide-react'
import { supabaseFetch, getSession } from '@/lib/supabase'
import { theme } from '@/lib/theme'

// Light cream/pink landing hero for the logged-in homepage — a deliberate
// departure from the site's dark red/black theme, scoped to this file only,
// matching a user-provided reference mockup. Browsing itself now happens on
// /members (search text and quick-role chips are passed through as ?q= /
// ?skill= query params, which /members reads on mount).
const lt = {
  bg: '#FBF3EF',
  card: '#FFFFFF',
  chipBg: '#F7E3DC',
  ink: '#221714',
  inkSoft: '#7C6F6A',
  accent: theme.brass,
  accentDark: theme.brassDark,
  accentSoft: 'rgba(179,55,42,0.08)',
  line: '#F0DED6',
}

const ROLE_CHIPS = [
  { label: 'Developer', skill: 'Software Engineering', Icon: Code2 },
  { label: 'Designer', skill: 'UI/UX Design', Icon: Palette },
  { label: 'Marketer', skill: 'Marketing', Icon: Megaphone },
  { label: 'Product Manager', skill: 'Product Management', Icon: Briefcase },
]

const STEPS = [
  { n: '01', Icon: Lightbulb, title: 'Share your idea', body: "Tell us what you're building and what you need." },
  { n: '02', Icon: UserSearch, title: 'Find the right person', body: 'Discover talented people who match your needs.' },
  { n: '03', Icon: MessageSquare, title: 'Build together', body: 'Connect, chat and turn your idea into something great.' },
]

export default function HomeTabs() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [myProfile, setMyProfile] = useState(null)

  useEffect(() => {
    async function load() {
      const session = getSession()
      const uid = session?.user?.id || null
      if (uid) {
        try {
          const rows = await supabaseFetch(`member_profiles?select=display_name,photo_url&user_id=eq.${uid}`)
          setMyProfile(rows?.[0] || null)
        } catch (e) { console.error(e) }
      }
    }
    load()
  }, [])

  const goSearch = (e) => {
    e.preventDefault()
    router.push(search.trim() ? `/members?q=${encodeURIComponent(search.trim())}` : '/members')
  }

  const myInitial = (myProfile?.display_name || '?').trim().charAt(0).toUpperCase()

  return (
    <div style={{ background: lt.bg, minHeight: '100vh' }}>
      {/* Topbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px clamp(16px,4vw,56px)',
      }}>
        <span style={{ fontFamily: theme.fontDisplay, fontSize: '22px', fontWeight: '700', color: lt.ink }}>
          Cot<span style={{ color: lt.accent }}>Lever</span>
        </span>
        <Link href="/account" style={{
          width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
          background: lt.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `2px solid ${lt.card}`, boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}>
          {myProfile?.photo_url ? (
            <img src={myProfile.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '700', fontFamily: theme.fontDisplay }}>{myInitial}</span>
          )}
        </Link>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '8px clamp(16px,4vw,56px) 60px' }}>

        {/* Hero */}
        <h1 style={{
          fontFamily: theme.fontDisplay, fontWeight: '700', fontSize: 'clamp(32px,7vw,42px)',
          color: lt.ink, lineHeight: '1.15', margin: '10px 0 16px', letterSpacing: '-0.01em',
        }}>
          Have an idea? Find the right person to <span style={{ color: lt.accent }}>build it.</span>
        </h1>
        <p style={{ fontSize: '16px', color: lt.inkSoft, lineHeight: '1.5', marginBottom: '26px', maxWidth: '440px' }}>
          Connect with people who have the skills your idea needs.
        </p>

        <Link href="/members" style={{
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '52px' }}>
          {ROLE_CHIPS.map(({ label, skill, Icon }) => (
            <Link
              key={label} href={`/members?skill=${encodeURIComponent(skill)}`}
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

        {/* How it works */}
        <h2 style={{
          fontFamily: theme.fontDisplay, fontWeight: '700', fontSize: 'clamp(22px,5vw,26px)',
          color: lt.ink, textAlign: 'center', marginBottom: '22px',
        }}>How CotLever Works</h2>

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
          <Link href="/members" style={{
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
    </div>
  )
}
