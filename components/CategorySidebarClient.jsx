'use client'
import { useState } from 'react'
import { guessCategoryEmoji } from '@/lib/categoryEmoji'

function renderIcon(c) {
  return c.image_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={c.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
  ) : guessCategoryEmoji(c.name)
}

// Renders one category row, and (if expanded) recurses into its children —
// works for any depth, not just top-level + direct children.
function CategoryNode({ category, categories, depth, topId, expanded, toggle }) {
  const children = categories.filter(c => c.parent_id === category.id)
  const isOpen = expanded.has(category.id)

  return (
    <div className="cat-sidebar-row">
      <div className="cat-sidebar-item">
        <a
          href={`/?cat=${topId}#products-grid`}
          className="cat-sidebar-link"
          style={{
            paddingLeft: `${14 + depth * 24}px`,
            boxSizing: 'border-box',
            maxWidth: '100%',
            overflow: 'hidden',
          }}
        >
          <span className="cat-sidebar-icon">{renderIcon(category)}</span>
          <span
            className="cat-sidebar-name"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
              minWidth: 0,
            }}
          >{category.name}</span>
        </a>
        {children.length > 0 && (
          <button
            type="button"
            onClick={() => toggle(category.id)}
            aria-label={isOpen ? 'Collapse' : 'Expand'}
            className="cat-sidebar-toggle"
          >
            {isOpen ? '−' : '+'}
          </button>
        )}
      </div>

      {children.length > 0 && isOpen && (
        <div className="cat-sub-list">
          {children.map(child => (
            <CategoryNode
              key={child.id}
              category={child}
              categories={categories}
              depth={depth + 1}
              topId={topId}
              expanded={expanded}
              toggle={toggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CategorySidebarClient({ categories }) {
  const [expanded, setExpanded] = useState(new Set())

  const topCategories = categories.filter(c => !c.parent_id)
  if (topCategories.length === 0) return null

  const toggle = (id) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="cat-sidebar">
      {topCategories.map(c => (
        <CategoryNode
          key={c.id}
          category={c}
          categories={categories}
          depth={0}
          topId={c.id}
          expanded={expanded}
          toggle={toggle}
        />
      ))}

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
            box-sizing: border-box;
            overflow: hidden;
          }
        }
        .cat-sidebar-row {
          border-bottom: 1px solid #f2f2f2;
          box-sizing: border-box;
          width: 100%;
          overflow: hidden;
        }
        .cat-sidebar-row:last-child { border-bottom: none; }
        .cat-sidebar-item {
          display: flex;
          align-items: stretch;
          width: 100%;
          box-sizing: border-box;
        }
        .cat-sidebar-link {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 9px;
          padding-bottom: 9px;
          padding-right: 6px;
          font-size: 13px;
          color: #333;
          text-decoration: none;
        }
        .cat-sidebar-link:hover { background: #faf6ec; color: #a06c00; }
        .cat-sidebar-icon {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
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
        }
      `}</style>
    </div>
  )
}
