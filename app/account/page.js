'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch, signOut } from '@/lib/supabase'

const STATUS_LABELS = {
  pending: 'অপেক্ষমান',
  confirmed: 'কনফার্ম হয়েছে',
  processing: 'প্রস্তুত করা হচ্ছে',
  out_for_delivery: 'ডেলিভারিতে আছে',
  delivered: 'ডেলিভারি সম্পন্ন',
  cancelled: 'বাতিল হয়েছে',
}

const STATUS_COLORS = {
  pending: { bg: '#fff3e0', text: '#e65100' },
  confirmed: { bg: '#e3f2fd', text: '#1565c0' },
  processing: { bg: '#e3f2fd', text: '#1565c0' },
  out_for_delivery: { bg: '#f3e5f5', text: '#6a1b9a' },
  delivered: { bg: '#e8f5e9', text: '#2e7d32' },
  cancelled: { bg: '#ffebee', text: '#c62828' },
}

export default function AccountPage() {
  const router = useRouter()
  const [loaded, setLoaded] = useState(false)
  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [orderCount, setOrderCount] = useState(0)
  const [shopNames, setShopNames] = useState({})

  const handleLogout = () => {
    signOut()
    router.push('/')
  }

  useEffect(() => {
    async function init() {
      const session = getSession()
      if (!session?.user?.id) {
        router.replace('/login?next=/account')
        return
      }

      try {
        const profiles = await supabaseFetch(`user_profiles?select=*&id=eq.${session.user.id}`)
        setProfile(profiles?.[0] || { id: session.user.id, full_name: '', phone: '', default_address: '' })
      } catch (e) {
        console.error(e)
        setProfile({ id: session.user.id, full_name: '', phone: '', default_address: '' })
      }

      try {
        const recentOrders = await supabaseFetch(
          `orders?select=*&user_id=eq.${session.user.id}&order=created_at.desc&limit=5`
        )
        setOrders(recentOrders || [])

        const shopIds = [...new Set((recentOrders || []).map(o => o.shop_id).filter(Boolean))]
        if (shopIds.length > 0) {
          const shops = await supabaseFetch(`shops?select=id,name&id=in.(${shopIds.join(',')})`)
          const map = {}
          ;(shops || []).forEach(s => { map[s.id] = s.name })
          setShopNames(map)
        }

        const countRes = await supabaseFetch(`orders?select=id&user_id=eq.${session.user.id}`)
        setOrderCount(Array.isArray(countRes) ? countRes.length : 0)
      } catch (e) {
        console.error(e)
      }

      setLoaded(true)
    }
    init()
  }, [router])

  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#999', fontSize: '14px' }}>লোড হচ্ছে...</div>
      </div>
    )
  }

  const initial = (profile?.full_name || '?').trim().charAt(0).toUpperCase()

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', paddingBottom: '40px' }}>
      {/* Hero header */}
      <div style={{
        background: 'linear-gradient(160deg, #163a2c 0%, #2d6a4f 100%)',
        padding: '18px 16px 56px'
      }}>
        <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.85)', fontSize: '14px', textDecoration: 'none', marginBottom: '18px' }}>
            <span style={{ fontSize: '18px', lineHeight: 1 }}>←</span> হোমে ফিরুন
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '58px', height: '58px', borderRadius: '50%', background: '#f4a300',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', fontWeight: '700', color: 'white', flexShrink: 0,
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
            }}>{initial}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: 'white', fontSize: '18px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.full_name || 'অতিথি ব্যবহারকারী'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', marginTop: '2px' }}>
                {profile?.phone || 'ফোন নম্বর যোগ করা হয়নি'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content — pulled up over the hero */}
      <div style={{ width: '100%', maxWidth: '480px', margin: '-38px auto 0', padding: '0 16px' }}>

        {/* Quick stat */}
        <div style={{
          background: 'white', borderRadius: '14px', boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
          padding: '16px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px', background: '#e8f5e9',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0
          }}>🧾</div>
          <div>
            <div style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>{orderCount}</div>
            <div style={{ fontSize: '12px', color: '#888' }}>মোট অর্ডার</div>
          </div>
        </div>

        {/* Profile card */}
        <div style={{
          background: 'white', borderRadius: '14px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
          padding: '18px', marginBottom: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a' }}>প্রোফাইল তথ্য</div>
            <Link href="/account/profile" style={{
              fontSize: '12px', color: '#2e7d32', fontWeight: '700', textDecoration: 'none',
              background: '#e8f5e9', padding: '5px 12px', borderRadius: '20px'
            }}>এডিট করুন</Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '16px', width: '20px', textAlign: 'center', flexShrink: 0 }}>👤</span>
            <span style={{ fontSize: '14px', color: profile?.full_name ? '#333' : '#aaa' }}>
              {profile?.full_name || 'নাম যোগ করা হয়নি'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '16px', width: '20px', textAlign: 'center', flexShrink: 0 }}>📞</span>
            <span style={{ fontSize: '14px', color: profile?.phone ? '#333' : '#aaa' }}>
              {profile?.phone || 'ফোন নম্বর যোগ করা হয়নি'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ fontSize: '16px', width: '20px', textAlign: 'center', flexShrink: 0 }}>📍</span>
            <span style={{ fontSize: '14px', color: profile?.default_address ? '#333' : '#aaa', lineHeight: 1.4 }}>
              {profile?.default_address || 'কোনো ঠিকানা সেভ করা নেই'}
            </span>
          </div>
        </div>

        {/* Orders card */}
        <div style={{
          background: 'white', borderRadius: '14px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
          padding: '18px', marginBottom: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a' }}>সাম্প্রতিক অর্ডার</div>
            <Link href="/account/orders" style={{ fontSize: '12px', color: '#2e7d32', fontWeight: '700', textDecoration: 'none' }}>সব দেখুন →</Link>
          </div>

          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: '#aaa' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛒</div>
              <div style={{ fontSize: '13px' }}>এখনো কোনো অর্ডার করা হয়নি</div>
            </div>
          ) : (
            orders.map(order => {
              const colors = STATUS_COLORS[order.status] || STATUS_COLORS.pending
              return (
                <Link key={order.id} href={`/orders/${order.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 0', borderTop: '1px solid #f0f0f0'
                  }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '10px', background: '#f5f5f5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', flexShrink: 0
                    }}>🏪</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {shopNames[order.shop_id] || 'দোকান'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                        {new Date(order.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })} · ৳{order.total}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px',
                      background: colors.bg, color: colors.text, whiteSpace: 'nowrap', flexShrink: 0
                    }}>
                      {STATUS_LABELS[order.status] || order.status}
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>

        {/* Actions */}
        <Link href="/shops" style={{
          display: 'block', textAlign: 'center', background: '#2e7d32', color: 'white',
          padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: '700',
          marginBottom: '10px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(46,125,50,0.25)'
        }}>কেনাকাটা করুন</Link>

        <button onClick={handleLogout} style={{
          display: 'block', width: '100%', textAlign: 'center', background: 'white',
          color: '#c62828', padding: '14px', borderRadius: '12px', fontSize: '14px',
          fontWeight: '700', border: '1px solid #ffcdd2', cursor: 'pointer'
        }}>লগআউট</button>
      </div>
    </div>
  )
}
