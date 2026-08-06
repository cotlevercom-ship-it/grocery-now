'use client'
import Link from 'next/link'

export default function CategorySections({ products, categories = [] }) {
  const catById = {}
  categories.forEach(c => { catById[c.id] = c })

  const topAncestorId = (id) => {
    let cur = catById[id]
    if (!cur) return null
    while (cur.parent_id && catById[cur.parent_id]) {
      cur = catById[cur.parent_id]
    }
    return cur.id
  }

  const topCategories = categories.filter(c => !c.parent_id)

  const sections = topCategories
    .map(c => ({
      ...c,
      items: products.filter(p => topAncestorId(p.category_id) === c.id),
    }))
    .filter(s => s.items.length > 0)

  if (sections.length === 0) return null

  return (
    <div style={{ background: '#f5f5f5', padding: '4px 16px 24px' }}>
      {sections.map(s => (
        <div key={s.id} style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0a0a0a', marginBottom: '10px' }}>
            {s.name}
          </h3>
          <div className="cat-scroll">
            {s.items.map(p => {
              const price = p.sale_price || p.price
              const discount = p.sale_price && Number(p.sale_price) < Number(p.price)
              return (
                <Link key={p.id} href={`/products/${p.id}`} className="cat-card">
                  <div className="cat-card-img">
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image_url}
                        alt={p.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: '24px', opacity: 0.35 }}>🛍️</span>
                    )}
                  </div>
                  <div style={{ padding: '8px' }}>
                    <div style={{
                      fontSize: '12px', color: '#333', overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{p.name}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>৳{price}</span>
                      {discount && (
                        <span style={{ fontSize: '10px', color: '#aaa', textDecoration: 'line-through' }}>৳{p.price}</span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ))}

      <style jsx>{`
        .cat-scroll {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
          -webkit-mask-image: linear-gradient(to right, black calc(100% - 28px), transparent 100%);
          mask-image: linear-gradient(to right, black calc(100% - 28px), transparent 100%);
        }
        .cat-scroll::-webkit-scrollbar { display: none; }
        .cat-card {
          flex-shrink: 0;
          width: 132px;
          background: white;
          border: 1px solid #eee;
          text-decoration: none;
          overflow: hidden;
        }
        @media (min-width: 1024px) {
          .cat-card { width: 180px; }
        }
        .cat-card-img {
          width: 100%;
          aspect-ratio: 1;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  )
}
