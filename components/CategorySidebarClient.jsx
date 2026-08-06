'use client'
import { useState } from 'react'
import { guessCategoryEmoji } from '@/lib/categoryEmoji'

export default function CategorySidebarClient({ categories }) {
  const [expanded, setExpanded] = useState(new Set())

  const topCategories = categories.filter(c => !c.parent_id)
  const childrenOf = (id) => categories.filter(c => c.parent_id === id)

  if (topCategories.length === 0) return null

  const toggle = (id) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderIcon = (c) => (
    c.image_url ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={c.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
    ) : guessCategoryEmoji(c.name)
  )

  return (
    <div className="cat-sidebar">
      {topCategories.map(c => {
        const children = childrenOf(c.id)
        const isOpen = expanded.has(c.id)
        return (
          <div key={c.id} className="cat-sidebar-row">
            <div className="cat-sidebar-item">
              <a href={`/?cat=${c.id}#products-grid`} className="cat-sidebar-link">
                <span className="cat-sidebar-icon">{renderIcon(c)}</span>
                <span className="cat-sidebar-name">{c.name}</span>
              </a>
              {children.length > 0 && (
                <button
                  type="button"
                  onClick={() => toggle(c.id)}
                  aria-label={isOpen ? 'Collapse' : 'Expand'}
                  className="cat-sidebar-toggle"
                >
                  {isOpen ? '−' : '+'}
                </button>
              )}
            </div>

            {children.length > 0 && isOpen && (
              <div className="cat-sub-list">
                {children.map(sub => (
                  <a key={sub.id} href={`/?cat=${c.id}#products-grid`} className="cat-sub-item">
                    <span className="cat-sub-icon">{renderIcon(sub)}</span>
                    <span>{sub.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <style jsx>{`
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
          }
        }
        .cat-sidebar-row {
          border-bottom: 1px solid #f2f2f2;
        }
        .cat-sidebar-row:last-child { border-bottom: none; }
        .cat-sidebar-item {
          display: flex;
          align-items: stretch;
        }
        .cat-sidebar-link {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 6px 9px 14px;
          font-size: 13px;
          color: #333;
          text-decoration: none;
        }
        .cat-sidebar-link:hover { background: #faf6ec; color: #a06c00; }
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
        .cat-sidebar-toggle {
          flex-shrink: 0;
          width: 34px;
          border: none;
          background: none;
          color: #999;
          font-size: 17px;
          font-weight: 700;
          cursor: pointer;
        }
        .cat-sidebar-toggle:hover { color: #f4a300; }
        .cat-sub-list {
          background: #fafafa;
          padding: 4px 0 6px;
        }
        .cat-sub-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px 6px 40px;
          font-size: 12.5px;
          color: #555;
          text-decoration: none;
        }
        .cat-sub-item:hover { color: #a06c00; }
        .cat-sub-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          background: #f0f0f0;
          border-radius: 5px;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
