'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'

export default function ProductGrid({ products, departments, categories = [] }) {
  const [selectedDept, setSelectedDept] = useState('all')
  const [selectedCat, setSelectedCat] = useState('all')

  const deptOf = (p) => p.shops?.department_id || null

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

  const deptCounts = departments.map(d => ({
    ...d,
    count: products.filter(p => deptOf(p) === d.id).length,
  })).filter(d => d.count > 0)

  const catCounts = topCategories.map(c => ({
    ...c,
    count: products.filter(p => catOf(p) === c.id).length,
  })).filter(c => c.count > 0)

  const filteredProducts = products
    .filter(p => selectedDept === 'all' || deptOf(p) === selectedDept)
    .filter(p => selectedCat === 'all' || catOf(p) === selectedCat)

  return (
    <>
      {deptCounts.length > 0 && (
        <div className="dept-row">
          <button
            className={`dept-chip ${selectedDept === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedDept('all')}
          >
            All ({products.length})
          </button>
          {deptCounts.map(d => (
            <button
              key={d.id}
              className={`dept-chip ${selectedDept === d.id ? 'active' : ''}`}
              onClick={() => setSelectedDept(d.id)}
            >
              <span style={{ marginRight: '5px' }}>{d.icon}</span>
              {d.name} ({d.count})
            </button>
          ))}
        </div>
      )}

      {catCounts.length > 0 && (
        <div className="dept-row cat-row">
          <button
            className={`cat-chip ${selectedCat === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCat('all')}
          >
            All Categories
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
              <Link
                key={p.id}
                href={`/products/${p.id}`}
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
        .dept-chip {
          flex-shrink: 0;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 999px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          color: #444;
          white-space: nowrap;
        }
        .dept-chip.active {
          background: #0a0a0a;
          border-color: #0a0a0a;
          color: white;
        }
        .cat-row {
          margin-top: -10px;
        }
        .cat-chip {
          flex-shrink: 0;
          background: white;
          border: 1px solid #f4a300;
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          color: #a06c00;
          white-space: nowrap;
        }
        .cat-chip.active {
          background: #f4a300;
          border-color: #f4a300;
          color: #0a0a0a;
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(clamp(140px, 15vw, 210px), 1fr));
          gap: clamp(10px, 1.2vw, 20px);
        }
      `}</style>
    </>
  )
}
