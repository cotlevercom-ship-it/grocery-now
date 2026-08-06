import { supabaseFetch } from '@/lib/supabase'

const FALLBACK_EMOJI = '🛍️'

export default async function CategorySidebar() {
  let categories = []
  try {
    categories = await supabaseFetch(
      `categories?select=id,name,image_url,sort_order&parent_id=is.null&is_active=eq.true&order=sort_order`
    )
  } catch (e) {
    console.error(e)
  }

  if (!categories || categories.length === 0) return null

  return (
    <div className="cat-sidebar">
      {categories.map(c => (
        <a key={c.id} href={`#cat-${c.id}`} className="cat-sidebar-item">
          <span className="cat-sidebar-icon">
            {c.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
            ) : FALLBACK_EMOJI}
          </span>
          <span>{c.name}</span>
        </a>
      ))}

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
          }
        }
        .cat-sidebar-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 16px;
          font-size: 13.5px;
          color: #333;
          text-decoration: none;
          border-bottom: 1px solid #f2f2f2;
        }
        .cat-sidebar-item:last-child { border-bottom: none; }
        .cat-sidebar-item:hover { background: #faf6ec; color: #a06c00; }
        .cat-sidebar-icon {
          width: 22px;
          height: 22px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
        }
      `}</style>
    </div>
  )
}
