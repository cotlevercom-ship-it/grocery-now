import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'

export default async function PopularProducts() {
  let products = []
  try {
    products = await supabaseFetch(
      `products?select=id,name,price,sale_price,moq,unit,image_url,shop_id,shops(name)&is_available=eq.true&order=created_at.desc&limit=12`
    )
  } catch (e) {
    console.error(e)
  }

  if (!products || products.length === 0) return null

  return (
    <div style={{ background: '#f5f5f5', padding: '24px 16px 8px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h2 className="shop-heading" style={{ fontWeight: '800', color: '#0a0a0a', marginBottom: '14px' }}>
          Popular Products
        </h2>

        <div className="products-grid">
          {products.map(p => {
            const price = p.sale_price || p.price
            const discount = p.sale_price && Number(p.sale_price) < Number(p.price)

            return (
              <Link
                key={p.id}
                href={`/shops/${p.shop_id}?product=${p.id}`}
                style={{
                  display: 'block', background: 'white', border: '1px solid #eee',
                  textDecoration: 'none', overflow: 'hidden',
                }}
              >
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1', background: '#f0f0f0' }}>
                  {p.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image_url}
                      alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </div>
                <div style={{ padding: '10px' }}>
                  <div style={{
                    fontSize: '12.5px', fontWeight: '400', color: '#333',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden', lineHeight: '1.4', minHeight: '35px',
                  }}>{p.name}</div>

                  {p.moq > 1 && (
                    <div style={{ fontSize: '10.5px', color: '#2d6a4f', marginTop: '4px', fontWeight: '500' }}>
                      ✓ MOQ {p.moq} {p.unit}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a' }}>৳{price}</span>
                    {discount && (
                      <span style={{ fontSize: '11px', color: '#aaa', textDecoration: 'line-through' }}>৳{p.price}</span>
                    )}
                  </div>

                  <div style={{
                    fontSize: '11px', color: '#999', marginTop: '4px',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{p.shops?.name || ''}</div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <style>{`
        .products-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media (min-width: 640px) {
          .products-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 900px) {
          .products-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>
    </div>
  )
}
