import { supabaseFetch } from '@/lib/supabase'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function SearchPage({ searchParams }) {
  const params = await searchParams
  const q = (params?.q || '').trim()

  let products = []
  let shops = []

  if (q) {
    try {
      const pattern = `*${q}*`
      ;[products, shops] = await Promise.all([
        supabaseFetch(
          `products?select=id,shop_id,name,price,sale_price,unit,image_url,image_urls,moq,shops(id,name)&name=ilike.${encodeURIComponent(pattern)}&is_available=eq.true&limit=48`
        ),
        supabaseFetch(
          `shops?select=id,name,image_url,category,location,rating&name=ilike.${encodeURIComponent(pattern)}&is_active=eq.true&limit=20`
        ),
      ])
    } catch (e) {
      console.error(e)
    }
  }

  const mainImage = (p) => (p.image_urls && p.image_urls[0]) || p.image_url

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Topbar */}
      <div style={{ background: '#0a0a0a', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/">
          <div style={{ color: 'white', fontSize: '22px', lineHeight: 1 }}>←</div>
        </Link>
        <div style={{ color: 'white', fontSize: '15px', fontWeight: '500', flex: 1 }}>
          {q ? `Results for "${q}"` : 'Search'}
        </div>
      </div>

      <div style={{ padding: '18px 16px', maxWidth: '1100px', margin: '0 auto' }}>
        {!q && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
            <p>Type something in the search bar to find products or merchants</p>
          </div>
        )}

        {q && shops.length === 0 && products.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📦</div>
            <p>No results found for "{q}"</p>
          </div>
        )}

        {shops.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a1a', marginBottom: '10px' }}>
              Merchants ({shops.length})
            </div>
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
              {shops.map(shop => (
                <Link key={shop.id} href={`/shops/${shop.id}`} style={{
                  flexShrink: 0, width: '150px', background: 'white', borderRadius: '4px',
                  border: '1px solid #e5e5e5', overflow: 'hidden', textDecoration: 'none'
                }}>
                  <div style={{
                    height: '90px', background: '#f5f5f5', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                  }}>
                    {shop.image_url ? (
                      <img src={shop.image_url} alt={shop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : '🏪'}
                  </div>
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#1a1a1a' }}>{shop.name}</div>
                    <div style={{ fontSize: '10.5px', color: '#999', marginTop: '2px' }}>
                      {shop.category} · ⭐ {shop.rating || 'New'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {products.length > 0 && (
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a1a', marginBottom: '10px' }}>
              Products ({products.length})
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px'
            }}>
              {products.map(p => (
                <Link key={p.id} href={`/shops/${p.shop_id}?product=${p.id}`} style={{
                  background: 'white', borderRadius: '4px', border: '1px solid #e5e5e5',
                  overflow: 'hidden', textDecoration: 'none', display: 'block'
                }}>
                  <div style={{
                    aspectRatio: '1 / 1', background: '#f5f5f5', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                  }}>
                    {mainImage(p) ? (
                      <img src={mainImage(p)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : <span style={{ fontSize: '30px' }}>🛍️</span>}
                  </div>
                  <div style={{ padding: '10px' }}>
                    <div style={{
                      fontSize: '12.5px', color: '#333', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      lineHeight: '1.4', minHeight: '35px'
                    }}>{p.name}</div>
                    {p.moq > 1 && (
                      <div style={{ fontSize: '10.5px', color: '#2d6a4f', marginTop: '4px', fontWeight: '500' }}>
                        ✓ MOQ {p.moq} {p.unit}
                      </div>
                    )}
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a', marginTop: '6px' }}>
                      ৳{p.sale_price || p.price}
                    </div>
                    {p.shops?.name && (
                      <div style={{ fontSize: '10.5px', color: '#999', marginTop: '4px' }}>
                        {p.shops.name}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
