import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function ShopsPage({ searchParams }) {
  const params = await searchParams
  const areaId = params?.area
  const areaName = params?.name || 'এলাকা'

  let shops = []
  try {
    shops = await supabaseFetch(
      `shops?select=*&area_id=eq.${areaId}&is_active=eq.true&order=is_featured.desc,name`
    )
  } catch (e) {
    console.error(e)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Topbar */}
      <div style={{ background: '#2e7d32', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/">
          <div style={{ color: 'white', fontSize: '22px', lineHeight: 1 }}>←</div>
        </Link>
        <div style={{ color: 'white', fontSize: '16px', fontWeight: '500', flex: 1 }}>
          {areaName}-এর দোকান
        </div>
      </div>

      {/* Area pill */}
      <Link href="/">
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: '#e8f5e9', borderRadius: '8px', padding: '8px 14px',
          margin: '16px 16px 0', border: '1px solid #a5d6a7', cursor: 'pointer'
        }}>
          <span style={{ fontSize: '14px' }}>📍</span>
          <span style={{ fontSize: '13px', color: '#1b5e20', fontWeight: '500' }}>{areaName}</span>
          <span style={{ fontSize: '12px', color: '#2e7d32', textDecoration: 'underline', marginLeft: '4px' }}>পরিবর্তন</span>
        </div>
      </Link>

      {/* Shop list */}
      <div style={{ padding: '16px' }}>
        {shops.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏪</div>
            <p>এই এলাকায় এখনো কোনো দোকান নেই</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {shops.map((shop) => (
              <Link key={shop.id} href={`/shops/${shop.id}`}>
                <div style={{
                  background: 'white', borderRadius: '12px',
                  border: '1px solid #e0e0e0', overflow: 'hidden', cursor: 'pointer'
                }}>
                  {/* Banner */}
                  <div style={{
                    height: '110px', background: '#f1f8e9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '48px', position: 'relative'
                  }}>
                    🛒
                    {shop.is_featured && (
                      <div style={{
                        position: 'absolute', top: '8px', left: '8px',
                        background: '#2e7d32', color: 'white',
                        fontSize: '10px', padding: '3px 8px', borderRadius: '4px'
                      }}>ফিচার্ড</div>
                    )}
                    <div style={{
                      position: 'absolute', bottom: '8px', right: '8px',
                      background: 'white', borderRadius: '6px',
                      padding: '3px 8px', fontSize: '11px', color: '#555'
                    }}>
                      ⏱ {shop.delivery_time_min}-{shop.delivery_time_max} মি.
                    </div>
                  </div>
                  {/* Body */}
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a' }}>{shop.name}</div>
                    {shop.description && (
                      <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{shop.description}</div>
                    )}
                    <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#555' }}>
                        ⭐ {shop.rating || '৪.৫'}
                      </span>
                      <span style={{ fontSize: '12px', color: '#555' }}>
                        🚴 {shop.delivery_charge === 0 ? 'ফ্রি ডেলিভারি' : `৳${shop.delivery_charge}`}
                      </span>
                      {shop.min_order_amount > 0 && (
                        <span style={{ fontSize: '12px', color: '#555' }}>
                          সর্বনিম্ন ৳{shop.min_order_amount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
