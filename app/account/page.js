'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch, signOut } from '@/lib/supabase'

export default function AccountPage() {
  const router = useRouter()
  const [loaded, setLoaded] = useState(false)
  const [profile, setProfile] = useState(null)
  const [orderCount, setOrderCount] = useState(0)
  const [ongoingCount, setOngoingCount] = useState(0)
  const [addressCount, setAddressCount] = useState(0)

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
        setProfile(profiles?.[0] || { id: session.user.id, full_name: '', phone: '' })
      } catch (e) {
        console.error(e)
        setProfile({ id: session.user.id, full_name: '', phone: '' })
      }

      try {
        const allOrders = await supabaseFetch(`orders?select=id,status&user_id=eq.${session.user.id}`)
        setOrderCount(allOrders?.length || 0)
        const ongoingStatuses = ['pending', 'confirmed', 'processing', 'out_for_delivery']
        setOngoingCount((allOrders || []).filter(o => ongoingStatuses.includes(o.status)).length)
      } catch (e) {
        console.error(e)
      }

      try {
        const addresses = await supabaseFetch(`user_addresses?select=id&user_id=eq.${session.user.id}`)
        setAddressCount(addresses?.length || 0)
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
        padding: '18px 16px 24px'
      }}>
        <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.85)', fontSize: '14px', textDecoration: 'none', marginBottom: '18px' }}>
            <span style={{ fontSize: '18px', lineHeight: 1 }}>←</span> হোমে ফিরুন
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%', background: '#f4a300',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: '700', color: 'white', flexShrink: 0
            }}>{initial}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: 'white', fontSize: '17px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.full_name || 'অতিথি ব্যবহারকারী'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', marginTop: '2px' }}>
                {profile?.phone || 'ফোন নম্বর যোগ করা হয়নি'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '16px' }}>

        {/* Edit profile */}
        <Link href="/account/profile" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'white', borderRadius: '12px', border: '1px solid #e0e0e0',
            padding: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '9px', background: '#f5f5f5',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', flexShrink: 0
            }}>👤</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>প্রোফাইল এডিট করুন</div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '1px' }}>নাম ও ফোন নম্বর</div>
            </div>
            <span style={{ color: '#ccc', fontSize: '16px' }}>›</span>
          </div>
        </Link>

        {/* Address book */}
        <Link href="/account/addresses" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'white', borderRadius: '12px', border: '1px solid #e0e0e0',
            padding: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '9px', background: '#f5f5f5',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', flexShrink: 0
            }}>📍</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>আমার ঠিকানা</div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '1px' }}>
                {addressCount > 0 ? `${addressCount}টি সেভ করা ঠিকানা` : 'কোনো ঠিকানা সেভ করা নেই'}
              </div>
            </div>
            <span style={{ color: '#ccc', fontSize: '16px' }}>›</span>
          </div>
        </Link>

        {/* Order history */}
        <Link href="/account/orders" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'white', borderRadius: '12px', border: '1px solid #e0e0e0',
            padding: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '9px', background: '#f5f5f5',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', flexShrink: 0
            }}>🧾</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>অর্ডার হিস্টোরি</div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '1px' }}>
                {orderCount}টি অর্ডার{ongoingCount > 0 ? ` · ${ongoingCount}টি চলমান` : ''}
              </div>
            </div>
            <span style={{ color: '#ccc', fontSize: '16px' }}>›</span>
          </div>
        </Link>

        <button onClick={handleLogout} style={{
          display: 'block', width: '100%', textAlign: 'center', background: 'white',
          color: '#c62828', padding: '13px', borderRadius: '12px', fontSize: '14px',
          fontWeight: '700', border: '1px solid #ffcdd2', cursor: 'pointer'
        }}>লগআউট</button>
      </div>
    </div>
  )
}
