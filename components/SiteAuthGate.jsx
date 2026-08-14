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
// Also public: /resources (+ detail pages) and individual listing/
// co-founder detail pages — these carry the SEO work (sitemap, OG
// images, JSON-LD) done for organic search, so gating them behind login
// would keep Google from ever indexing them. The *browse* pages
// (/listings, /cofounder) and everything else (create forms, account,
// payment, members) stay login-gated as originally requested.
const PUBLIC_PATHS = ['/', '/login', '/forgot-password', '/reset-password', '/verify-otp', '/about', '/how-it-works', '/contact', '/privacy-policy', '/terms', '/payment-policy', '/user-agreement', '/why-use-cotlever', '/pricing']
const PUBLIC_PREFIXES = ['/resources', '/listing/'] // /listing/[id] — distinct path from /listings (gated browse page)

// /cofounder/[id] is public (SEO detail page), but /cofounder/new (the
// create form) must stay gated — both share the /cofounder/ prefix so
// this needs its own check rather than a plain prefix match.
function isCofounderDetail(pathname) {
  if (!pathname?.startsWith('/cofounder/')) return false
  const rest = pathname.slice('/cofounder/'.length)
  return !!rest && rest !== 'new' && !rest.startsWith('new/')
}

export default function SiteAuthGate({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)

  const isPublic = pathname?.startsWith('/admin')
    || PUBLIC_PATHS.includes(pathname)
    || PUBLIC_PREFIXES.some(prefix => pathname?.startsWith(prefix))
    || isCofounderDetail(pathname)

  useEffect(() => {
    if (isPublic) {
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
    // Legacy /payment/cofounder/[postId] is exempt so any old pending
    // cofounder payment (from before this signup-payment change) can still
    // be completed — those live in a separate cofounder_subscriptions
    // table, not listing_subscriptions, so this check wouldn't see them.
    const skipSubscriptionCheck = pathname === '/account/subscribe' || pathname?.startsWith('/payment/cofounder/')
    if (!skipSubscriptionCheck) {
      supabaseFetch(`listing_subscriptions?select=id&user_id=eq.${session.user.id}&limit=1`)
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
