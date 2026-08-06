'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getSession } from '@/lib/supabase'
import Logo from './Logo'

export default function Navbar() {
  const [session, setSession] = useState(null)
  const [cartCount, setCartCount] = useState(0)
  const [q, setQ] = useState('')
  const pathname = usePathname()
  const router = useRouter()
  const isMerchantArea = pathname?.startsWith('/merchant')

  useEffect(() => {
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
    const readCart = () => {
      try {
        const saved = localStorage.getItem('cart')
        if (!saved) { setCartCount(0); return }
        const parsed = JSON.parse(saved)
        const shopsObj = parsed.shops || (parsed.shopId ? { [parsed.shopId]: parsed } : {})
        const count = Object.values(shopsObj).reduce(
          (sum, s) => sum + (s.items || []).reduce((a, b) => a + (b.qty || 0), 0), 0
        )
        setCartCount(count)
      } catch (e) {
        setCartCount(0)
      }
    }
    readCart()
    window.addEventListener('cart-changed', readCart)
    window.addEventListener('storage', readCart)
    return () => {
      window.removeEventListener('cart-changed', readCart)
      window.removeEventListener('storage', readCart)
    }
  }, [])

  const customerName = session?.user?.email ? session.user.email.split('@')[0] : ''

  const submitSearch = (e) => {
    e.preventDefault()
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <>
      <div className="navbar-bar" style={{
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        padding: '14px 16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
      }}>
        <Link href="/" className="navbar-logo-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, textDecoration: 'none', flexShrink: 0 }}>
          <Logo variant="light" size="1em" />
        </Link>

        {!isMerchantArea && (
          <form onSubmit={submitSearch} className="navbar-search" style={{
            flex: 1, maxWidth: '520px', display: 'flex', alignItems: 'center',
            background: 'rgba(255,255,255,0.1)', borderRadius: '7px', overflow: 'hidden',
          }}>
            <input
              type="text"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search products..."
              style={{
                flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
                color: '#faf7f0', padding: '8px 10px', fontSize: '13px',
              }}
            />
            <button type="submit" aria-label="Search" style={{
              background: 'none', border: 'none', color: '#faf7f0', padding: '0 10px',
              display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </form>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <Link href="/cart" style={{
            position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.12)', color: '#faf7f0',
            borderRadius: '8px', width: '36px', height: '36px', flexShrink: 0
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                background: '#f4a300', color: '#1a1a1a', fontSize: '10px', fontWeight: '700',
                borderRadius: '999px', minWidth: '16px', height: '16px', padding: '0 3px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1, border: '2px solid #000'
              }}>
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {session ? (
            <Link href="/account" style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'rgba(255,255,255,0.12)', color: '#faf7f0',
              borderRadius: '8px', padding: '7px 12px',
              fontSize: '13px', whiteSpace: 'nowrap', textDecoration: 'none',
              maxWidth: '120px', overflow: 'hidden'
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {customerName || 'Account'}
              </span>
            </Link>
          ) : (
            <Link href="/login">
              <div style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: 'rgba(255,255,255,0.12)', color: '#faf7f0',
                borderRadius: '8px', padding: '7px 12px',
                fontSize: '13px', whiteSpace: 'nowrap'
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Login
              </div>
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
