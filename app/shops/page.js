import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function ShopsPage() {
  let shops = []
  try {
    shops = await supabaseFetch(
      `shops?select=*&is_active=eq.true&order=is_featured.desc,name`
    )
  } catch (e) {
    console.error(e)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Topbar */}
      <div style={{
        background: '#0a0a0a',
        padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <Link href="/">
          <div style={{ color: 'white', fontSize: '22px', lineHeight: 1 }}>←</div>
        </Link>
        <div style={{ color: 'white', fontSize: '16px', fontWeight: '600', flex: 1 }}>
          All Shops
        </div>
      </div>

      {/* Shop list */}
      <div style={{ padding: '20px 16px' }}>
        {shops.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏪</div>
            <p>No shops yet</p>
          </div>
        ) : (
          <div className="shop-grid">
            {shops.map((shop) => (
              <Link key={shop.id} href={`/shop/${shop.slug}`} className="shop-card">
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
                    }}>Featured</div>
                  )}
                  <div style={{
                    position: 'absolute', bottom: '8px', right: '8px',
                    background: 'rgba(255,255,255,0.92)', borderRadius: '6px',
                    padding: '3px 8px', fontSize: '11px', fontWeight: '600', color: '#1a1a1a'
                  }}>
                    ⭐ {shop.rating || 'New'}
                  </div>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                    {shop.name}
                  </div>
                  {shop.location && (
                    <div style={{ fontSize: '11.5px', color: '#666', marginTop: '2px', fontWeight: '500' }}>
                      📍 {shop.location}
                    </div>
                  )}
                  {shop.description && (
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                      {shop.description}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
