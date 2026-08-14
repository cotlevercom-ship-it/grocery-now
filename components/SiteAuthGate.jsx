'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getSession } from '@/lib/supabase'
import { theme } from '@/lib/theme'

// Pages reachable without logging in — the auth/onboarding flow itself,
// plus everything linked from the footer (About/Legal tabs live under
// /about, How It Works is its own page), plus the homepage itself (it
// shows a marketing view when logged out, via HomeGate). /admin has its
// own independent gate (AdminLayout) so it's excluded here entirely.
const PUBLIC_PATHS = ['/', '/login', '/forgot-password', '/reset-password', '/verify-otp', '/about', '/how-it-works']

export default function SiteAuthGate({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)

  const isPublic = pathname?.startsWith('/admin') || PUBLIC_PATHS.includes(pathname)

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
