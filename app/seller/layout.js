'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getSession, signOut, supabaseFetch } from '@/lib/supabase'

export default function SellerLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [shop, setShop] = useState(null)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    if (pathname === '/seller/create' || pathname === '/seller/login') {
      setChecking(false)
      return
    }
    async function check() {
      const session = getSession()
      if (!session?.user) {
        router.replace(`/seller/login?next=${pathname}`)
        setChecking(false)
        return
      }
      try {
        const rows = await supabaseFetch(`shops?select=*&owner_id=eq.${session.user.id}`)
        if (rows && rows.length > 0) {
          setShop(rows[0])
          setUserEmail(session.user.email)
        } else {
          router.replace('/seller/create')
        }
      } catch (e) {
        console.error(e)
        router.replace('/seller/create')
      }
      setChecking(false)
    }
    check()
  }, [pathname, router])

  if (pathname === '/seller/create' || pathname === '/seller/login') return children

  if (checking) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: '#888', fontSize: '14px'
      }}>
        লোড হচ্ছে...
      </div>
    )
  }

  if (!shop) return null

  const navItems = [
    { href: '/seller', label: 'ড্যাশবোর্ড', icon: '📊' },
    { href: '/seller/products', label: 'প্রোডাক্ট', icon: '📦' },
    { href: '/seller/orders', label: 'অর্ডার', icon: '🧾' },
    { href: '/seller/settings', label: 'Settings', icon: '⚙️' },
  ]

  const handleLogout = () => {
    signOut()
    router.replace('/seller/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex' }}>
      <div style={{
        width: '220px',
        background: 'linear-gradient(180deg, #163a2c 0%, #2d6a4f 100%)',
        color: 'white', flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{
          padding: '20px', display: 'flex', alignItems: 'center', gap: '8px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <span style={{ fontSize: '20px' }}>🏪</span>
          <span style={{ fontWeight: '700', fontSize: '15px' }}>{shop.name}</span>
        </div>
        <nav style={{ flex: 1, padding: '10px 0' }}>
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '11px 20px', fontSize: '14px',
                  background: active ? 'rgba(244,163,0,0.18)' : 'transparent',
                  borderRight: active ? '3px solid #f4a300' : '3px solid transparent',
                  color: active ? '#f4a300' : 'rgba(255,255,255,0.85)',
                  fontWeight: active ? '600' : '400'
                }}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </Link>
            )
          })}
        </nav>
        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{
            fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>{userEmail}</div>
          <button onClick={handleLogout} style={{
            width: '100%', background: 'rgba(255,255,255,0.1)', color: 'white',
            border: 'none', borderRadius: '8px', padding: '8px', fontSize: '13px', cursor: 'pointer'
          }}>লগআউট</button>
        </div>
      </div>
      <div style={{ flex: 1, padding: '28px', overflow: 'auto' }}>
        {children}
      </div>
    </div>
  )
}
