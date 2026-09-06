'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { getSession, supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import NotificationBell from '@/components/NotificationBell'
import MessageIcon from '@/components/MessageIcon'

function NavSearch() {
  const router = useRouter()
  const [q, setQ] = useState('')

  const submit = (e) => {
    e.preventDefault()
    router.push(`/members${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`)
  }

  return (
    <form onSubmit={submit} style={{ flex: 1, maxWidth: '440px', position: 'relative' }} className="nav-search">
      <Search size={15} color={theme.inkSoft} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
      <input
        type="text"
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search people, ideas, skills…"
        style={{
          width: '100%', boxSizing: 'border-box', background: theme.surface, border: `1px solid ${theme.line}`,
          borderRadius: '999px', padding: '9px 14px 9px 36px', fontSize: '13px', fontFamily: theme.fontBody,
          color: theme.ink, outline: 'none',
        }}
      />
      <style jsx>{`
        @media (max-width: 640px) {
          .nav-search { display: none; }
        }
      `}</style>
    </form>
  )
}

const MENU_LINKS = [
  { href: '/why-use-cotlever', label: 'Why Use Cot Lever' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/resources', label: 'Articles' },
]

function NavMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
        style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px',
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '8px 6px', flexShrink: 0,
        }}
      >
        <span style={{ width: '20px', height: '2px', background: theme.ink, borderRadius: '2px' }} />
        <span style={{ width: '20px', height: '2px', background: theme.ink, borderRadius: '2px' }} />
        <span style={{ width: '20px', height: '2px', background: theme.ink, borderRadius: '2px' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', left: 0, minWidth: '176px',
          background: theme.surface, borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(20,33,61,0.08)', overflow: 'hidden', zIndex: 50,
          padding: '6px',
        }}>
          {MENU_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{
                display: 'block', padding: '9px 10px', borderRadius: '6px',
                fontSize: '13px', color: theme.inkSoft, textDecoration: 'none',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function AccountMenu({ displayName, customerName }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          background: theme.surface, color: theme.ink, border: `1px solid ${theme.line}`,
          borderRadius: '7px', padding: '8px 12px', cursor: 'pointer',
          fontSize: '13px', whiteSpace: 'nowrap',
          maxWidth: '120px', overflow: 'hidden'
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayName || customerName || 'Account'}
        </span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: '160px',
          background: theme.surface, borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(20,33,61,0.08)', overflow: 'hidden', zIndex: 50,
          padding: '6px',
        }}>
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            style={{ display: 'block', padding: '9px 10px', borderRadius: '6px', fontSize: '13px', color: theme.inkSoft, textDecoration: 'none' }}
          >My Profile</Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            style={{ display: 'block', padding: '9px 10px', borderRadius: '6px', fontSize: '13px', color: theme.inkSoft, textDecoration: 'none' }}
          >Settings</Link>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const [session, setSession] = useState(null)
  const [displayName, setDisplayName] = useState('')
  const pathname = usePathname()
  const isAdminArea = pathname?.startsWith('/admin')
  const navRef = useRef(null)

  useEffect(() => {
    // getSession() reads localStorage, which doesn't exist during SSR — must
    // run client-side only in an effect, not a lazy useState initializer
    // (that would mismatch what the server rendered on hydration).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(getSession())
    const onAuthChanged = () => setSession(getSession())
    window.addEventListener('auth-changed', onAuthChanged)
    window.addEventListener('storage', onAuthChanged)
    return () => {
      window.removeEventListener('auth-changed', onAuthChanged)
      window.removeEventListener('storage', onAuthChanged)
    }
  }, [])

  useEffect(() => {
    // Publish the navbar's real (responsive) height as a CSS var so
    // other sticky sections (e.g. the homepage hero) can offset their
    // own `top` by exactly this amount instead of sticking at 0 and
    // scrolling up underneath this sticky, higher-z-index navbar.
    const el = navRef.current
    if (!el) return
    const setVar = () => {
      document.documentElement.style.setProperty('--nav-h', `${el.offsetHeight}px`)
    }
    setVar()
    const observer = new ResizeObserver(setVar)
    observer.observe(el)
    return () => observer.disconnect()
  }, [isAdminArea])

  const customerName = session?.user?.email ? session.user.email.split('@')[0] : ''

  useEffect(() => {
    let cancelled = false
    async function loadDisplayName() {
      if (!session?.user?.id) { setDisplayName(''); return }
      try {
        const rows = await supabaseFetch(`member_profiles?select=display_name&user_id=eq.${session.user.id}`)
        if (!cancelled) setDisplayName(rows?.[0]?.display_name || '')
      } catch (e) { console.error(e) }
    }
    loadDisplayName()
    window.addEventListener('member-profile-updated', loadDisplayName)
    return () => { cancelled = true; window.removeEventListener('member-profile-updated', loadDisplayName) }
  }, [session?.user?.id])

  if (isAdminArea) return null

  return (
    <div ref={navRef} style={{
      background: theme.paper,
      borderBottom: `1px solid ${theme.line}`,
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        padding: 'clamp(12px,1.6vw,18px) clamp(16px,3vw,56px)',
      }}>
        <NavMenu />

        <Link href="/" style={{
          fontFamily: theme.fontDisplay, fontSize: 'clamp(18px,1.6vw,22px)', fontWeight: '600',
          color: theme.ink, textDecoration: 'none', flexShrink: 0
        }}>
          Cot<span style={{ color: theme.brass }}>Lever</span>
        </Link>

        {session ? <NavSearch /> : <div style={{ flex: 1 }} />}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {session && <MessageIcon />}
          {session && <NotificationBell />}
          {session ? (
            <AccountMenu displayName={displayName} customerName={customerName} />
          ) : (
            <Link href="/login" style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: theme.surface, color: theme.ink, border: `1px solid ${theme.line}`,
              borderRadius: '7px', padding: '9px 14px',
              fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', textDecoration: 'none'
            }}>Log In</Link>
          )}
        </div>
      </div>
    </div>
  )
}
