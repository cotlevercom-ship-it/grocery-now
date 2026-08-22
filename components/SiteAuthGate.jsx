'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getSession, supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'

// Pages reachable without logging in — the auth/onboarding flow itself,
// plus everything linked from the footer (About/Legal tabs live under
// /about, How It Works is its own page), plus the homepage itself (it
// shows a marketing view when logged out, via HomeGate). /admin has its
// own independent gate (AdminLayout) so it's excluded here entirely.
//
// Also public: /resources (+ detail pages) — carries the SEO work
// (sitemap, JSON-LD) done for organic search, so gating it behind login
// would keep Google from ever indexing it. Everything else (create form,
// account, payment, members browse/detail) stays login-gated.
const PUBLIC_PATHS = ['/', '/login', '/forgot-password', '/reset-password', '/verify-otp', '/about', '/how-it-works', '/contact', '/privacy-policy', '/terms', '/payment-policy', '/user-agreement', '/why-use-cotlever', '/pricing']
const PUBLIC_PREFIXES = ['/resources']

export default function SiteAuthGate({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)

  const isPublic = pathname?.startsWith('/admin')
    || PUBLIC_PATHS.includes(pathname)
    || PUBLIC_PREFIXES.some(prefix => pathname?.startsWith(prefix))

  useEffect(() => {
    if (isPublic) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAllowed(true)
      setChecking(false)
      return
    }
    const session = getSession()
    if (!session?.user) {
      router.replace(`/login?next=${encodeURIComponent(pathname || '/')}`)
      setAllowed(false)
      setChecking(false)
      return
    }

    // A logged-in account isn't a real Cot Lever member until they've
    // confirmed payment — enforced everywhere except the subscribe page
    // itself, so a user can't wander the rest of the site unpaid (e.g. by
    // closing the tab right after signup, before the redirect completes).
    const skipSubscriptionCheck = pathname === '/account/subscribe'
    if (!skipSubscriptionCheck) {
      supabaseFetch(`member_subscriptions?select=id&user_id=eq.${session.user.id}&status=eq.active&limit=1`)
        .then(subs => {
          if (!subs || subs.length === 0) {
            router.replace('/account/subscribe')
            setAllowed(false)
          } else {
            setAllowed(true)
          }
          setChecking(false)
        })
        .catch(e => {
          console.error(e)
          // Fail open rather than lock a paid user out on a network hiccup.
          setAllowed(true)
          setChecking(false)
        })
      return
    }

    setAllowed(true)
    setChecking(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  if (isPublic) return children

  if (checking) {
    return (
      <div style={{
        minHeight: '70vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: theme.inkSoft, fontSize: '14px'
      }}>
        Loading...
      </div>
    )
  }

  if (!allowed) return null

  return children
}
