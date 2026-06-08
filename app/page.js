import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'

export default async function Home() {
  let areas = []
  try {
    areas = await supabaseFetch('areas?select=*&is_active=eq.true&order=name')
  } catch (e) {
    console.error(e)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Topbar */}
      <div style={{ background: '#2e7d32', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: 'white', fontSize: '20px', fontWeight: '600' }}>🛒 GroceryNow</div>
      </div>

      {/* Hero */}
      <div style={{ background: '#2e7d32', padding: '24px 16px 32px' }}>
        <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '600', marginBottom: '6px' }}>
          আপনার এলাকা কোনটি?
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
          এলাকা সিলেক্ট করুন, কাছের দোকান দেখুন
        </p>
      </div>

      {/* Areas */}
      <div style={{ padding: '20px 16px' }}>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '14px', fontWeight: '500' }}>
          জনপ্রিয় এলাকা
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {areas.map((area) => (
            <Link key={area.id} href={`/shops?area=${area.id}&name=${encodeURIComponent(area.name)}`}>
              <div style={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                padding: '16px 12px',
                textAlign: 'center',
                cursor: 'pointer',
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: '#e8f5e9', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 8px', fontSize: '20px'
                }}>📍</div>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a' }}>{area.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
