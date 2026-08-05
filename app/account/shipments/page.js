'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch } from '@/lib/supabase'

const STATUS_LABELS = {
  pending: 'Pending',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const STATUS_STAMP = {
  pending: '#c17a1f',
  picked_up: '#1f5aa6',
  in_transit: '#6a3fa0',
  delivered: '#1f4a37',
  cancelled: '#a6402b',
}

function StatusStamp({ status }) {
  const color = STATUS_STAMP[status] || STATUS_STAMP.pending
  const label = STATUS_LABELS[status] || status
  return (
    <div style={{
      position: 'relative', flexShrink: 0, transform: 'rotate(-7deg)',
      width: '62px', height: '62px', borderRadius: '50%',
      border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '4px'
    }}>
      <div style={{
        position: 'absolute', inset: '3px', borderRadius: '50%', border: `1px dashed ${color}`, opacity: 0.6
      }} />
      <div style={{
        fontSize: '9.5px', fontWeight: '800', color, textAlign: 'center', lineHeight: 1.15,
        letterSpacing: '0.01em', padding: '0 3px'
      }}>{label}</div>
    </div>
  )
}

export default function MyShipmentsPage() {
  const router = useRouter()
  const [loaded, setLoaded] = useState(false)
  const [shipments, setShipments] = useState([])

  useEffect(() => {
    async function init() {
      const session = getSession()
      if (!session?.user?.id) {
        router.replace('/login?next=/account/shipments')
        return
      }

      try {
        const rows = await supabaseFetch(
          `shipment_bookings?select=*&user_id=eq.${session.user.id}&order=created_at.desc`
        )
        setShipments(rows || [])
      } catch (e) {
        console.error(e)
      }
      setLoaded(true)
    }
    init()
  }, [router])

  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#999', fontSize: '14px' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0', paddingBottom: '48px' }}>
      {/* Topbar */}
      <div style={{ background: '#0a0a0a', padding: '16px' }}>
        <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/account">
            <div style={{ color: 'white', fontSize: '21px', lineHeight: 1 }}>←</div>
          </Link>
          <div>
            <div style={{ color: 'white', fontSize: '15.5px', fontWeight: '700' }}>My Shipments</div>
            <div style={{ color: 'rgba(220,38,38,0.9)', fontSize: '11px', marginTop: '1px', letterSpacing: '0.03em' }}>
              {shipments.length} parcel{shipments.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '18px 16px 0' }}>

        {shipments.length === 0 ? (
          <div style={{
            background: '#fffdf8', borderRadius: '4px', border: '1px dashed #e6ded0',
            padding: '44px 16px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '38px', marginBottom: '12px' }}>📦</div>
            <div style={{ fontSize: '13px', color: '#9a9182', marginBottom: '18px' }}>No parcels booked yet</div>
            <Link href="/ship" style={{
              display: 'inline-block', background: '#0a0a0a', color: 'white',
              padding: '11px 26px', borderRadius: '4px', fontSize: '13.5px', fontWeight: '700'
            }}>Book a Parcel</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {shipments.map(s => (
              <div key={s.id} style={{
                background: '#fffdf8', borderRadius: '4px', border: '1px solid #e6ded0',
                boxShadow: '0 1px 3px rgba(22,58,44,0.05)', padding: '16px',
                display: 'flex', alignItems: 'center', gap: '14px'
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14.5px', fontWeight: '700', color: '#1a1a1a' }}>
                    {s.courier_name} · {s.receiver_country}
                  </div>
                  <div style={{
                    fontSize: '11px', color: '#9a9182', marginTop: '4px',
                    fontFamily: '"Courier New", monospace'
                  }}>
                    #{s.id.slice(0, 8).toUpperCase()} · {new Date(s.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b6b6b', marginTop: '6px' }}>
                    To: {s.receiver_name} · {s.weight_kg}kg
                  </div>
                  {s.tracking_id && (
                    <div style={{ fontSize: '11.5px', color: '#1f5aa6', marginTop: '4px', fontWeight: '600' }}>
                      Tracking: {s.tracking_id}
                    </div>
                  )}
                  <div style={{
                    fontSize: '16px', color: '#dc2626', fontWeight: '700', marginTop: '8px',
                    fontFamily: '"Courier New", monospace'
                  }}>৳{s.charge_amount}</div>
                </div>
                <StatusStamp status={s.status} />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
