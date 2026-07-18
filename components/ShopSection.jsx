import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function ShopSection() {
  let shops = []
  try {
    shops = await supabaseFetch(
      `shops?select=*&is_active=eq.true&order=is_featured.desc,created_at.desc`
    )
  } catch (e) {
    console.error(e)
  }

  if (!shops || shops.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏪</div>
        <p>এই মুহূর্তে কোনো দোকান পাওয়া যায়নি</p>
      </div>
    )
  }

  return (
    <section style={{ padding: '28px 16px 8px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h2 className="shop-heading" style={{ fontWeight: '700', color: '#163a2c', margin: 0 }}>
          সব দোকান
        </h2>
        <span style={{
          fontSize: '12px', color: '#2d6a4f', background: '#e8f5e9',
          padding: '4px 12px', borderRadius: '20px', fontWeight: '500'
        }}>
          {shops.length}টি দোকান
        </span>
      </div>

      <div className="shop-grid">
        {shops.map((shop) => (
          <Link key={shop.id} href={`/shops/${shop.id}`} className="shop-card">
            <div style={{ position: 'relative' }}>
              <img
                src={shop.image_url || '/placeholder-shop.png'}
                alt={shop.name}
                className="shop-image"
                style={{ width: '100%', objectFit: 'cover', display: 'block' }}
              />
              {shop.is_featured && (
                <div style={{
                  position: 'absolute', top: '8px', left: '8px',
                  background: '#f4a300', color: '#1a1a1a',
                  fontSize: '10px', fontWeight: '700', padding: '3px 9px',
                  borderRadius: '6px'
                }}>ফিচার্ড</div>
              )}
              <div style={{
                position: 'absolute', bottom: '8px', right: '8px',
                background: 'rgba(255,255,255,0.92)', borderRadius: '6px',
                padding: '3px 8px', fontSize: '11px', fontWeight: '600', color: '#1a1a1a'
              }}>
                ⭐ {shop.rating || 'নতুন'}
              </div>
            </div>
            <div style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                {shop.name}
              </div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                {shop.category}
              </div>
              <div style={{
                fontSize: '12px', color: '#2d6a4f', marginTop: '8px',
                fontWeight: '500'
              }}>
                🚴 {shop.delivery_time_min}-{shop.delivery_time_max} মিনিট
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
