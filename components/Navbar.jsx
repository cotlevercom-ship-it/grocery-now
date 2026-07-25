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

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', paddingBottom: '40px' }}>
      {/* Topbar */}
      <div style={{
        background: '#2e7d32', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <Link href="/">
          <div style={{ color: 'white', fontSize: '22px', lineHeight: 1 }}>←</div>
        </Link>
        <div style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>আমার একাউন্ট</div>
      </div>

      {/* Profile card */}
      <div style={{
        background: 'white', margin: '16px 16px 14px', borderRadius: '10px',
        border: '1px solid #e0e0e0', padding: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>প্রোফাইল</div>
          <Link href="/account/profile" style={{ fontSize: '12px', color: '#2e7d32', fontWeight: '600' }}>এডিট করুন</Link>
        </div>
        <div style={{ fontSize: '14px', color: '#333', marginBottom: '4px' }}>
          {profile?.full_name || <span style={{ color: '#999' }}>নাম যোগ করা হয়নি</span>}
        </div>
        <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
          {profile?.phone || <span style={{ color: '#999' }}>ফোন নম্বর যোগ করা হয়নি</span>}
        </div>
        <div style={{ fontSize: '13px', color: '#666' }}>
          {profile?.default_address || <span style={{ color: '#999' }}>কোনো ঠিকানা সেভ করা নেই</span>}
        </div>
      </div>

      {/* Orders card */}
      <div style={{
        background: 'white', margin: '0 16px 14px', borderRadius: '10px',
        border: '1px solid #e0e0e0', padding: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>সাম্প্রতিক অর্ডার</div>
          <Link href="/account/orders" style={{ fontSize: '12px', color: '#2e7d32', fontWeight: '600' }}>সব দেখুন</Link>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#999', fontSize: '13px' }}>
            এখনো কোনো অর্ডার করা হয়নি
          </div>
        ) : (
          orders.map(order => {
            const colors = STATUS_COLORS[order.status] || STATUS_COLORS.pending
            return (
              <Link key={order.id} href={`/orders/${order.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid #f0f0f0'
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                      {shopNames[order.shop_id] || 'দোকান'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                      {new Date(order.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })} · ৳{order.total}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px',
                    background: colors.bg, color: colors.text, whiteSpace: 'nowrap'
                  }}>
                    {STATUS_LABELS[order.status] || order.status}
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>

      <div style={{ padding: '0 16px' }}>
        <Link href="/shops" style={{
          display: 'block', textAlign: 'center', background: '#2e7d32', color: 'white',
          padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '600',
          marginBottom: '10px'
        }}>কেনাকাটা করুন</Link>

        <button onClick={handleLogout} style={{
          display: 'block', width: '100%', textAlign: 'center', background: 'white',
          color: '#c62828', padding: '12px', borderRadius: '10px', fontSize: '14px',
          fontWeight: '600', border: '1px solid #ffcdd2', cursor: 'pointer'
        }}>লগআউট</button>
      </div>
    </div>
  )
}
