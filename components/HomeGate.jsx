'use client'
import { useEffect, useState } from 'react'
import { getSession } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import MarketingHome from '@/components/MarketingHome'
import HomeTabs from '@/components/HomeTabs'

export default function HomeGate() {
  const [checking, setChecking] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const check = () => {
      setLoggedIn(!!getSession()?.user)
      setChecking(false)
    }
    check()
    window.addEventListener('auth-changed', check)
    window.addEventListener('storage', check)
    return () => {
      window.removeEventListener('auth-changed', check)
      window.removeEventListener('storage', check)
    }
  }, [])

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

  return loggedIn ? <HomeTabs /> : <MarketingHome />
}
