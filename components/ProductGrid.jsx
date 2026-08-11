'use client'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function ProductGrid({ products, categories = [] }) {
  const searchParams = useSearchParams()
  const [selectedCat, setSelectedCat] = useState('all')

  useEffect(() => {
    const catParam = searchParams.get('cat')
    if (catParam) setSelectedCat(catParam)
  }, [searchParams])

  // Build category tree helpers: resolve any category to its top-level ancestor
  const catById = useMemo(() => {
    const map = {}
    categories.forEach(c => { map[c.id] = c })
    return map
  }, [categories])

  const topAncestorId = useMemo(() => {
    const cache = {}
    const resolve = (id) => {
      if (!id) return null
      if (cache[id]) return cache[id]
      let cur = catById[id]
      if (!cur) return null
      while (cur.parent_id && catById[cur.parent_id]) {
        cur = catById[cur.parent_id]
      }
      cache[id] = cur.id
      return cur.id
    }
    return resolve
  }, [catById])

  const topCategories = categories.filter(c => !c.parent_id)

  const catOf = (p) => topAncestorId(p.category_id)

  const catCounts = topCategories.map(c => ({
    ...c,
    count: products.filter(p => catOf(p) === c.id).length,
  })).filter(c => c.count > 0)

  const filteredProducts = selectedCat === 'all'
    ? products
    : products.filter(p => catOf(p) === selectedCat)

  return (
    <>
      {catCounts.length > 0 && (
        <div className="dept-row cat-row">
          <button
            className={`cat-chip ${selectedCat === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCat('all')}
          >
            All ({products.length})
          </button>
          {catCounts.map(c => (
            <button
              key={c.id}
              className={`cat-chip ${selectedCat === c.id ? 'active' : ''}`}
              onClick={() => setSelectedCat(c.id)}
            >
              {c.name} ({c.count})
            </button>
          ))}
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#999' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🛍️</div>
          <p>No products in this category yet</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(p => {
            const price = p.sale_price || p.price
            const discount = p.sale_price && Number(p.sale_price) < Number(p.price)

            return (
              <Link key={p.id} href={`/products/${p.id}`} className="product-tile">
                <div className="product-tile-img">
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image_url}
                      alt={p.name}
                      style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <span style={{ fontSize: '28px', opacity: 0.35 }}>🛍️</span>
                  )}
                </div>
                <div className="product-tile-body">
                  <div className="product-tile-price">
                    ৳{price}
                    {discount && <span className="product-tile-strike">৳{p.price}</span>}
                  </div>
                  <div className="product-tile-name">{p.name}</div>

                  {p.moq > 1 && (
                    <div className="product-tile-moq">✓ MOQ {p.moq} {p.unit}</div>
                  )}

                  <div className="product-tile-shop">{p.shops?.name || ''}</div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <style jsx>{`
        .dept-row {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 2px 20px 6px 2px;
          margin: 0 -2px 16px;
          scrollbar-width: none;
          -webkit-mask-image: linear-gradient(to right, black calc(100% - 28px), transparent 100%);
          mask-image: linear-gradient(to right, black calc(100% - 28px), transparent 100%);
        }
        .dept-row::-webkit-scrollbar { display: none; }
        .cat-chip {
          flex-shrink: 0;
          background: white;
          border: 1px solid #e4e4e1;
          border-radius: 999px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          color: #55554f;
        }
        .cat-chip.active {
          background: #0a0a0a;
          border-color: #0a0a0a;
          color: #f4a300;
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 640px) {
          .products-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
        }
        @media (min-width: 1024px) {
          .products-grid { grid-template-columns: repeat(5, 1fr); gap: 18px; }
        }
        .product-tile {
          display: block;
          background: white;
          border: 1px solid #ececea;
          border-radius: 12px;
          overflow: hidden;
          text-decoration: none;
          transition: box-shadow 0.15s ease, transform 0.15s ease;
        }
        .product-tile:hover {
          box-shadow: 0 6px 18px rgba(10,10,10,0.08);
          transform: translateY(-1px);
        }
        .product-tile-img {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          background: #f6f6f4;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .product-tile-body { padding: 10px 12px 12px; }
        .product-tile-price {
          font-size: 16px;
          font-weight: 800;
          color: #0a0a0a;
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .product-tile-strike {
          font-size: 11px;
          font-weight: 500;
          color: #b3b3ac;
          text-decoration: line-through;
        }
        .product-tile-name {
          font-size: 12.5px;
          color: #333;
          margin-top: 4px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
          min-height: 35px;
        }
        .product-tile-moq {
          font-size: 10.5px;
          color: #2d6a4f;
          font-weight: 500;
          margin-top: 2px;
        }
        .product-tile-shop {
          font-size: 11px;
          color: #999;
          margin-top: 6px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </>
  )
}
