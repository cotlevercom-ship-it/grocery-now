'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getSession, signOut, supabaseFetch } from '@/lib/supabase'

// Each admin_users row has a `role`. 'super_admin' sees everything below.
// A department role (its key matches the nav href's last segment) is
// restricted to just that one section — enforced both by hiding the nav
// links AND by redirecting away from a URL typed/bookmarked directly.
const ALL_NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '📊', roles: 'all' },
  { href: '/admin/members', label: 'Members', icon: '👤', roles: ['members'] },
  { href: '/admin/feed', label: 'Feed', icon: '📰', roles: ['feed'] },
  { href: '/admin/resources', label: 'Resources', icon: '📰', roles: ['resources'] },
  { href: '/admin/resource-categories', label: 'Article Categories', icon: '🗂️', roles: ['resources'] },
  { href: '/admin/banners', label: 'Banners', icon: '🖼️', roles: ['banners'] },
  { href: '/admin/pages', label: 'Page Management', icon: '📄', roles: ['pages'] },
  { href: '/admin/agreements', label: 'Agreements', icon: '📜', roles: ['agreements'] },
  { href: '/admin/help', label: 'Help Center', icon: '❓', roles: ['help'] },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️', roles: ['settings'] },
  { href: '/admin/admin-users', label: 'Admin Users', icon: '🔑', roles: [] }, // super_admin only
]

function itemsForRole(role) {
  if (role === 'super_admin') return ALL_NAV_ITEMS
  return ALL_NAV_ITEMS.filter(item => item.roles === 'all' || item.roles.includes(role))
}

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminRole, setAdminRole] = useState('')
  const [navOpen, setNavOpen] = useState(false)

  const publicPaths = ['/admin/login', '/admin/forgot-password']

  useEffect(() => {
    if (publicPaths.includes(pathname)) {
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
        const rows = await supabaseFetch(`admin_users?select=id,role&user_id=eq.${session.user.id}`)
        if (rows && rows.length > 0) {
          const role = rows[0].role || 'super_admin'
          setIsAdmin(true)
          setAdminEmail(session.user.email)
          setAdminRole(role)

          // Route-level enforcement: bounce away from a section this
          // role isn't allowed into, even if they typed/bookmarked the URL.
          const allowed = itemsForRole(role).some(item => item.href === pathname)
          if (!allowed) {
            router.replace('/admin')
            setChecking(false)
            return
          }
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

  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  if (publicPaths.includes(pathname)) return children

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

  if (!isAdmin) return null

  const navItems = itemsForRole(adminRole)

  const handleLogout = () => {
    signOut()
    router.replace('/admin/login')
  }

  return (
    <div className="admin-shell">
      {/* mobile top bar */}
      <div className="admin-topbar">
        <button className="hamburger-btn" onClick={() => setNavOpen(true)} aria-label="Open menu">
          <span /><span /><span />
        </button>
        <div className="topbar-brand">
          <span style={{ fontSize: '18px' }}>🤝</span>
          <span style={{ fontWeight: 700, fontSize: '14px' }}>Cot Lever Admin</span>
        </div>
      </div>

      {navOpen && <div className="admin-backdrop" onClick={() => setNavOpen(false)} />}

      <div className={`admin-sidebar ${navOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🤝</span>
            <span style={{ fontWeight: '700', fontSize: '15px' }}>Cot Lever Admin</span>
          </div>
          <button className="close-btn" onClick={() => setNavOpen(false)} aria-label="Close menu">✕</button>
        </div>
        <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
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
          }}>{adminEmail}{adminRole !== 'super_admin' && ` · ${adminRole}`}</div>
          <button onClick={handleLogout} style={{
            width: '100%', background: 'rgba(255,255,255,0.1)', color: 'white',
            border: 'none', borderRadius: '8px', padding: '8px', fontSize: '13px', cursor: 'pointer'
          }}>Logout</button>
        </div>
      </div>

      <div className="admin-content">
        {children}
      </div>

      <style jsx global>{`
        html, body {
          overflow-x: hidden;
          max-width: 100%;
        }
        .admin-shell {
          min-height: 100vh;
          background: #f5f5f5;
          display: flex;
        }
        .admin-topbar {
          display: none;
        }
        .admin-backdrop {
          display: none;
        }
        .admin-sidebar {
          width: 220px;
          background: linear-gradient(180deg, #163a2c 0%, #2d6a4f 100%);
          color: white;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .sidebar-header {
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .close-btn {
          display: none;
        }
        .admin-content {
          flex: 1;
          min-width: 0;
          padding: 28px;
          overflow-x: hidden;
        }

        @media (max-width: 860px) {
          .admin-shell {
            display: block;
          }
          .admin-topbar {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            background: linear-gradient(180deg, #163a2c 0%, #2d6a4f 100%);
            color: white;
            position: sticky;
            top: 0;
            z-index: 30;
          }
          .hamburger-btn {
            width: 34px;
            height: 34px;
            border-radius: 8px;
            background: rgba(255,255,255,0.12);
            border: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            flex-shrink: 0;
          }
          .hamburger-btn span {
            width: 16px;
            height: 2px;
            background: white;
            border-radius: 2px;
          }
          .topbar-brand {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .admin-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.45);
            z-index: 40;
          }
          .admin-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            width: 250px;
            max-width: 80vw;
            transform: translateX(-100%);
            transition: transform 0.2s ease;
            z-index: 50;
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .close-btn {
            display: block;
            background: transparent;
            border: none;
            color: white;
            font-size: 18px;
            flex-shrink: 0;
          }
          .admin-content {
            padding: 18px 14px;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
