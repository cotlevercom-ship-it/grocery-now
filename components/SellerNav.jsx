'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getSession, signOut, supabaseFetch } from '@/lib/supabase'
import Image from 'next/image'

const navItems = [
  { href: '/seller/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/seller/products', label: 'Products', icon: '📦' },
  { href: '/seller/orders', label: 'Orders', icon: '🧾' },
  { href: '/seller/package', label: 'Package', icon: '💎' },
  { href: '/seller/settings', label: 'Settings', icon: '⚙️' },
]

export default function SellerNav({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const [shopName, setShopName] = useState('')
  const [sellerEmail, setSellerEmail] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function check() {
      const session = getSession()
      if (!session?.user) {
        router.replace(`/seller/login?next=${pathname}`)
        if (!cancelled) setChecking(false)
        return
      }
      try {
        const shops = await supabaseFetch(`shops?select=id,name&owner_id=eq.${session.user.id}`)
        if (!shops || shops.length === 0) {
          router.replace('/seller/create')
          if (!cancelled) setChecking(false)
          return
        }
        if (!cancelled) {
          setShopName(shops[0].name)
          setSellerEmail(session.user.email)
          setAllowed(true)
        }
      } catch (e) {
        console.error(e)
        router.replace('/seller/login')
      }
      if (!cancelled) setChecking(false)
    }
    check()
    return () => { cancelled = true }
  }, [pathname, router])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const handleLogout = () => {
    signOut()
    router.replace('/seller/login')
  }

  if (checking) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: '#888', fontSize: '14px'
      }}>
        Loading...
      </div>
    )
  }

  if (!allowed) return null

  return (
    <div className="seller-shell" style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex' }}>
      <style jsx>{`
        .seller-shell { position: relative; }
        .sidebar {
          width: 220px;
          background: #0a0a0a;
          color: white;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .overlay { display: none; }
        .hamburger { display: none; }
        .main-content { flex: 1; padding: 28px; overflow: auto; }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            z-index: 50;
            transform: translateX(-100%);
            transition: transform 0.2s ease;
          }
          .sidebar.open { transform: translateX(0); }
          .overlay.open {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 40;
          }
          .hamburger {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 8px;
            background: #0a0a0a;
            color: white;
            border: none;
            font-size: 18px;
            margin-bottom: 16px;
            cursor: pointer;
          }
          .main-content { padding: 16px; }
        }
      `}</style>

      <div className={`overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />

      <div className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <span style={{ position: 'relative', display: 'inline-block', height: '44px', width: '150px' }}>
            <Image src="/logo-text.png" alt="Cot Lever" fill
              style={{ objectFit: 'contain', objectPosition: 'left center' }} />
          </span>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '6px' }}>Seller Centre</div>
        </div>

        {shopName && (
          <div style={{
            padding: '14px 20px', fontSize: '13px', fontWeight: '600', color: '#dc2626',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            🏪 {shopName}
          </div>
        )}

        <nav style={{ flex: 1, padding: '10px 0' }}>
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '11px 20px', fontSize: '14px',
                  background: active ? 'rgba(220,38,38,0.18)' : 'transparent',
                  borderRight: active ? '3px solid #dc2626' : '3px solid transparent',
                  color: active ? '#dc2626' : 'rgba(255,255,255,0.85)',
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
          }}>{sellerEmail}</div>
          <button onClick={handleLogout} style={{
            width: '100%', background: 'rgba(255,255,255,0.1)', color: 'white',
            border: 'none', borderRadius: '8px', padding: '8px', fontSize: '13px', cursor: 'pointer'
          }}>Logout</button>
        </div>
      </div>

      <div className="main-content">
        <button className="hamburger" onClick={() => setMenuOpen(true)}>☰</button>
        {children}
      </div>
    </div>
  )
}
