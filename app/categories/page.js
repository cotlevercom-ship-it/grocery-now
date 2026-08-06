import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'
import { guessCategoryEmoji } from '@/lib/categoryEmoji'

export const dynamic = 'force-dynamic'

async function getAllCategories() {
  try {
    return await supabaseFetch(`categories?select=id,name,slug,parent_id,image_url,sort_order&is_active=eq.true&order=sort_order`)
  } catch (e) {
    console.error(e)
    return []
  }
}

function getBreadcrumb(categories, id) {
  const byId = Object.fromEntries(categories.map(c => [c.id, c]))
  const chain = []
  let cur = id ? byId[id] : null
  while (cur) {
    chain.unshift(cur)
    cur = cur.parent_id ? byId[cur.parent_id] : null
  }
  return chain
}

export default async function CategoriesPage({ searchParams }) {
  const parentId = searchParams?.parent || null
  const categories = await getAllCategories()

  const breadcrumb = getBreadcrumb(categories, parentId)
  const level = parentId
    ? categories.filter(c => c.parent_id === parentId)
    : categories.filter(c => !c.parent_id)

  const hasChildren = (id) => categories.some(c => c.parent_id === id)

  const renderIcon = (c) => (
    c.image_url ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={c.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
    ) : guessCategoryEmoji(c.name)
  )

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '20px 16px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ fontSize: '12.5px', color: '#888', marginBottom: '14px' }}>
          <Link href="/categories" style={{ color: '#888', textDecoration: 'none' }}>All Categories</Link>
          {breadcrumb.map((c, i) => (
            <span key={c.id}>
              {' › '}
              {i === breadcrumb.length - 1 ? (
                <span style={{ color: '#0a0a0a', fontWeight: '600' }}>{c.name}</span>
              ) : (
                <Link href={`/categories?parent=${c.id}`} style={{ color: '#888', textDecoration: 'none' }}>{c.name}</Link>
              )}
            </span>
          ))}
        </div>

        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0a0a0a', marginBottom: '4px' }}>
          {parentId ? breadcrumb[breadcrumb.length - 1]?.name : 'All Categories'}
        </h1>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '18px' }}>
          {parentId ? 'Pick a subcategory to see products' : 'Pick a category to browse'}
        </p>

        {level.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#999' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>📂</div>
            <p>No subcategories here</p>
            {parentId && (
              <Link href={`/category/${parentId}`} style={{ display: 'inline-block', marginTop: '14px', color: 'white', background: '#0a0a0a', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>
                View products →
              </Link>
            )}
          </div>
        ) : (
          <div className="cat-slide-scroll">
            {level.map(c => {
              const targetHref = hasChildren(c.id) ? `/categories?parent=${c.id}` : `/category/${c.id}`
              return (
                <Link key={c.id} href={targetHref} className="cat-slide-card">
                  <div className="cat-slide-icon">{renderIcon(c)}</div>
                  <div className="cat-slide-name">{c.name}</div>
                  {hasChildren(c.id) && <div className="cat-slide-hint">Browse subcategories →</div>}
                </Link>
              )
            })}
          </div>
        )}

        {parentId && level.length > 0 && (
          <Link href={`/category/${parentId}`} style={{ display: 'inline-block', marginTop: '22px', color: '#a06c00', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>
            Or view all products in "{breadcrumb[breadcrumb.length - 1]?.name}" →
          </Link>
        )}
      </div>

      <style>{`
        .cat-slide-scroll {
          display: flex;
          gap: 14px;
          overflow-x: auto;
          padding-bottom: 10px;
          scrollbar-width: thin;
        }
        .cat-slide-card {
          flex-shrink: 0;
          width: 150px;
          background: white;
          border: 1px solid #eee;
          border-radius: 12px;
          padding: 18px 14px;
          text-decoration: none;
          color: #333;
          text-align: center;
          box-sizing: border-box;
        }
        .cat-slide-card:hover { border-color: #f4a300; }
        .cat-slide-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin: 0 auto 10px;
          overflow: hidden;
        }
        .cat-slide-name {
          font-size: 13px;
          font-weight: 700;
          color: #0a0a0a;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .cat-slide-hint {
          font-size: 10.5px;
          color: #a06c00;
          margin-top: 6px;
        }
      `}</style>
    </div>
  )
}
