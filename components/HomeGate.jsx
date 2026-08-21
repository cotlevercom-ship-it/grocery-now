'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import MarketingHome from '@/components/MarketingHome'

// Logged-out visitors see the marketing hero (MarketingHome). Logged-in
// users don't need a second copy of that same hero (it used to live in
// components/HomeTabs.jsx, since removed) — they're sent straight to
// /members, which is where browsing actually happens.
export default function HomeGate() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const check = () => {
      const isLoggedIn = !!getSession()?.user
      setLoggedIn(isLoggedIn)
      setChecking(false)
      if (isLoggedIn) {
        router.replace('/members')
      }
    }
    check()
    window.addEventListener('auth-changed', check)
    window.addEventListener('storage', check)
    return () => {
      window.removeEventListener('auth-changed', check)
      window.removeEventListener('storage', check)
    }
  }, [router])

  if (checking || loggedIn) {
    return (
      <div style={{
        minHeight: '70vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: theme.inkSoft, fontSize: '14px'
      }}>
        Loading...
      </div>
    )
  }

  return <MarketingHome />
}
