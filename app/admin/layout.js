'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getSession, signOut, supabaseFetch } from '@/lib/supabase'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')

  useEffect(() => {
    if (pathname === '/admin/login') {
      setChecking(false)
      return
    }
    async function check() {
      const session = getSession()
      if (!session?.user) {
        router.replace('/admin/login')
        setChecking(false)
        return
      }
      try {
        const rows = await supabaseFetch(`admin_users?select=id&user_id=eq.${session.user.id}`)
        if (rows && rows.length > 0) {
          setIsAdmin(true)
          setAdminEmail(session.user.email)
        } else {
          router.replace('/admin/login')
        }
      } catch (e) {
        console.error(e)
        router.replace('/admin/login')
      }
      setChecking(false)
    }
    check()
  }, [pathname, router])

  if (pathname === '/admin/login') return children

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

  if (!isAdmin) return null

  const navItems = [
    { href: '/admin', label: 'ড্যাশবোর্ড', icon: '📊' },
    { href: '/admin/shops', label: 'দোকান', icon: '🏪' },
    { href: '/admin/products', label: 'প্রোডাক্ট', icon: '📦' },
    { href: '/admin/orders', label: 'অর্ডার', icon: '🧾' },
    { href: '/admin/areas', label: 'এলাকা', icon: '📍' },
    { href: '/admin/banners', label: 'ব্যানার', icon: '🖼️' },
    { href: '/admin/package-requests', label: 'পেমেন্ট রিকোয়েস্ট', icon: '💳' },
  ]

  const handleLogout = () => {
    signOut()
    router.replace('/admin/login')
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
          <span style={{ fontSize: '20px' }}>🧺</span>
          <span style={{ fontWeight: '700', fontSize: '15px' }}>GroceryNow Admin</span>
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
          }}>{adminEmail}</div>
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
