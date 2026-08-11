'use client'
import Link from 'next/link'

export default function ShopGrid({ shops }) {
  return (
    <>
      <div className="shops-header">
        <div>
          <span className="shops-label">Merchants</span>
          <h2 className="shop-heading shops-title">Shops on Cot Lever</h2>
        </div>
        <Link href="/shops" className="shops-see-all">See all →</Link>
      </div>

      <div className="shop-strip">
        {shops.map((shop) => (
          <Link key={shop.id} href={`/shop/${shop.slug}`} className="shop-tile">
            <div className="shop-tile-img-wrap">
              <img
                src={shop.image_url || '/placeholder-shop.png'}
                alt={shop.name}
                className="shop-tile-img"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {shop.is_featured && <div className="shop-tile-badge">Featured</div>}
            </div>
            <div className="shop-tile-body">
              <div className="shop-tile-name">{shop.name}</div>
              <div className="shop-tile-rating">⭐ {shop.rating || 'New'}</div>
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .shops-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 14px;
          gap: 12px;
        }
        .shops-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #a3a39d;
          margin-bottom: 4px;
        }
        .shops-title { font-weight: 800; color: #0a0a0a; margin: 0; }
        .shops-see-all {
          font-size: 13px;
          font-weight: 700;
          color: #0a0a0a;
          white-space: nowrap;
          padding-bottom: 2px;
          border-bottom: 2px solid #f4a300;
        }
        .shop-strip {
          display: flex;
          gap: 14px;
          overflow-x: auto;
          padding-bottom: 6px;
          scrollbar-width: none;
        }
        .shop-strip::-webkit-scrollbar { display: none; }
        .shop-tile {
          flex-shrink: 0;
          width: 150px;
          background: white;
          border: 1px solid #ececea;
          border-radius: 12px;
          overflow: hidden;
          text-decoration: none;
          transition: box-shadow 0.15s ease, transform 0.15s ease;
        }
        .shop-tile:hover {
          box-shadow: 0 6px 18px rgba(10,10,10,0.08);
          transform: translateY(-1px);
        }
        .shop-tile-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1.3 / 1;
          background: #f6f6f4;
          overflow: hidden;
        }
        .shop-tile-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: #f4a300;
          color: #0a0a0a;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 6px;
        }
        .shop-tile-body { padding: 10px 12px 12px; }
        .shop-tile-name {
          font-size: 13px;
          font-weight: 700;
          color: #0a0a0a;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .shop-tile-rating {
          font-size: 11px;
          color: #767672;
          margin-top: 3px;
        }
        @media (min-width: 640px) {
          .shop-tile { width: 180px; }
        }
      `}</style>
    </>
  )
}
