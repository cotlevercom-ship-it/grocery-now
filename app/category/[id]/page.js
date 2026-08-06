import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'
import { guessCategoryEmoji } from '@/lib/categoryEmoji'

export const dynamic = 'force-dynamic'

async function getAllCategories() {
  try {
    return await supabaseFetch(`categories?select=id,name,slug,parent_id,image_url&is_active=eq.true&order=sort_order`)
  } catch (e) {
    console.error(e)
    return []
  }
}

function getBreadcrumb(categories, id) {
  const byId = Object.fromEntries(categories.map(c => [c.id, c]))
  const chain = []
  let cur = byId[id]
  while (cur) {
    chain.unshift(cur)
    cur = cur.parent_id ? byId[cur.parent_id] : null
  }
  return chain
}

function getDescendantIds(categories, id) {
  const ids = [id]
  const walk = (parentId) => {
    categories.filter(c => c.parent_id === parentId).forEach(c => {
      ids.push(c.id)
      walk(c.id)
    })
  }
  walk(id)
  return ids
}

export default async function CategoryPage({ params }) {
  const { id } = params
  const categories = await getAllCategories()
  const current = categories.find(c => c.id === id)

  if (!current) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#999' }}>
        <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔍</div>
        <p>Category not found</p>
        <Link href="/" style={{ color: '#a06c00', fontSize: '13px' }}>← Back to home</Link>
      </div>
    )
  }

  const breadcrumb = getBreadcrumb(categories, id)
  const children = categories.filter(c => c.parent_id === id)
  const descendantIds = getDescendantIds(categories, id)

  let products = []
  try {
    products = await supabaseFetch(
      `products?select=id,name,price,sale_price,moq,unit,image_url,shop_id,category_id,shops(name)&is_available=eq.true&category_id=in.(${descendantIds.join(',')})&order=created_at.desc`
    )
  } catch (e) {
    console.error(e)
  }

  let soldCounts = {}
  if (products.length > 0) {
    try {
      const ids = products.map(p => p.id).join(',')
      const items = await supabaseFetch(`order_items?select=product_id,quantity&product_id=in.(${ids})`)
      soldCounts = (items || []).reduce((acc, item) => {
        acc[item.product_id] = (acc[item.product_id] || 0) + (item.quantity || 0)
        return acc
      }, {})
    } catch (e) {
      console.error(e)
    }
  }

  const renderIcon = (c) => (
    c.image_url ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={c.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
    ) : guessCategoryEmoji(c.name)
  )

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '20px 16px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: '12.5px', color: '#888', marginBottom: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>Home</Link>
          {breadcrumb.map((c, i) => (
            <span key={c.id}>
              {' › '}
              {i === breadcrumb.length - 1 ? (
                <span style={{ color: '#0a0a0a', fontWeight: '600' }}>{c.name}</span>
              ) : (
                <Link href={`/category/${c.id}`} style={{ color: '#888', textDecoration: 'none' }}>{c.name}</Link>
              )}
            </span>
          ))}
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0a0a0a', marginBottom: '16px' }}>{current.name}</h1>

        {/* Subcategory chips */}
        {children.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '22px' }}>
            {children.map(c => (
              <Link key={c.id} href={`/category/${c.id}`} style={{
                display: 'flex', alignItems: 'center', gap: '8px', background: 'white',
                border: '1px solid #eee', borderRadius: '999px', padding: '7px 16px 7px 8px',
                textDecoration: 'none', color: '#333', fontSize: '13px', fontWeight: '600',
              }}>
                <span style={{
                  width: '24px', height: '24px', borderRadius: '50%', background: '#f7f7f7',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', overflow: 'hidden', flexShrink: 0,
                }}>{renderIcon(c)}</span>
                {c.name}
              </Link>
            ))}
          </div>
        )}

        {/* Products */}
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#999' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🛍️</div>
            <p>No products in this category yet</p>
          </div>
        ) : (
          <div className="cat-page-grid">
            {products.map(p => {
              const price = p.sale_price || p.price
              const discount = p.sale_price && Number(p.sale_price) < Number(p.price)
              return (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  style={{ display: 'block', background: 'white', border: '1px solid #eee', textDecoration: 'none', overflow: 'hidden' }}
                >
                  <div style={{
                    position: 'relative', width: '100%', aspectRatio: '1', background: '#f0f0f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                  }}>
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
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px',
                    }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.shops?.name || ''}</span>
                      {soldCounts[p.id] > 0 && <span style={{ flexShrink: 0 }}>SOLD: {soldCounts[p.id]}</span>}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        .cat-page-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media (min-width: 640px) {
          .cat-page-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
        }
        @media (min-width: 1024px) {
          .cat-page-grid { grid-template-columns: repeat(5, 1fr); gap: 20px; }
        }
      `}</style>
    </div>
  )
}
