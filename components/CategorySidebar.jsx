import { supabaseFetch } from '@/lib/supabase'
import { guessCategoryEmoji } from '@/lib/categoryEmoji'

export default async function CategorySidebar() {
  let categories = []
  try {
    categories = await supabaseFetch(
      `categories?select=id,name,parent_id,image_url,sort_order&is_active=eq.true&order=sort_order`
    )
  } catch (e) {
    console.error(e)
  }

  if (!categories || categories.length === 0) return null

  const topCategories = categories.filter(c => !c.parent_id)
  const childrenOf = (id) => categories.filter(c => c.parent_id === id)

  if (topCategories.length === 0) return null

  return (
    <div className="cat-sidebar">
      {topCategories.map(c => {
        const children = childrenOf(c.id)
        return (
          <div key={c.id} className="cat-sidebar-row">
            <a href={`#cat-${c.id}`} className="cat-sidebar-item">
              <span className="cat-sidebar-icon">
                {c.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                ) : guessCategoryEmoji(c.name)}
              </span>
              <span className="cat-sidebar-name">{c.name}</span>
              {children.length > 0 && (
                <span className="cat-sidebar-arrow">›</span>
              )}
            </a>

            {children.length > 0 && (
              <div className="cat-flyout">
                <div className="cat-flyout-title">{c.name}</div>
                <div className="cat-flyout-grid">
                  {children.map(sub => (
                    <a key={sub.id} href={`#cat-${c.id}`} className="cat-flyout-item">
                      <span className="cat-flyout-icon">
                        {sub.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={sub.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                        ) : guessCategoryEmoji(sub.name)}
                      </span>
                      <span>{sub.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}

      <style>{`
        .cat-sidebar {
          display: none;
        }
        @media (min-width: 1024px) {
          .cat-sidebar {
            display: block;
            width: 220px;
            flex-shrink: 0;
            background: white;
            border: 1px solid #eee;
            align-self: flex-start;
            position: relative;
          }
        }
        .cat-sidebar-row {
          position: relative;
          border-bottom: 1px solid #f2f2f2;
        }
        .cat-sidebar-row:last-child { border-bottom: none; }
        .cat-sidebar-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 14px;
          font-size: 13px;
          color: #333;
          text-decoration: none;
        }
        .cat-sidebar-row:hover .cat-sidebar-item { background: #faf6ec; color: #a06c00; }
        .cat-sidebar-icon {
          width: 26px;
          height: 26px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          background: #f7f7f7;
          border-radius: 6px;
          overflow: hidden;
        }
        .cat-sidebar-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .cat-sidebar-arrow { flex-shrink: 0; font-size: 15px; color: #ccc; }
        .cat-sidebar-row:hover .cat-sidebar-arrow { color: #f4a300; }

        .cat-flyout {
          display: none;
          position: absolute;
          left: 100%;
          top: -1px;
          min-width: 340px;
          max-width: 480px;
          background: white;
          border: 1px solid #eee;
          box-shadow: 4px 4px 18px rgba(0,0,0,0.08);
          padding: 16px 18px;
          z-index: 50;
        }
        .cat-sidebar-row:hover .cat-flyout { display: block; }
        .cat-flyout-title {
          font-size: 13px;
          font-weight: 800;
          color: #0a0a0a;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid #f4a300;
        }
        .cat-flyout-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px 16px;
        }
        .cat-flyout-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: #444;
          text-decoration: none;
        }
        .cat-flyout-item:hover { color: #a06c00; }
        .cat-flyout-icon {
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          background: #f7f7f7;
          border-radius: 6px;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
