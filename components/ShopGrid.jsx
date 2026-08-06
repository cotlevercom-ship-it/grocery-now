'use client'
import Link from 'next/link'

export default function ShopGrid({ shops }) {
  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h2 className="shop-heading" style={{ fontWeight: '700', color: '#163a2c', margin: 0 }}>
          All Shops
        </h2>
        <span style={{
          fontSize: '12px', color: '#2d6a4f', background: '#f5f5f5',
          padding: '4px 12px', borderRadius: '20px', fontWeight: '500'
        }}>
          {shops.length} shops
        </span>
      </div>

      {shops.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏪</div>
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
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                  {shop.category}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
