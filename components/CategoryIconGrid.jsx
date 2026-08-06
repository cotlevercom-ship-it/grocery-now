import { supabaseFetch } from '@/lib/supabase'
import { guessCategoryEmoji } from '@/lib/categoryEmoji'

export default async function CategoryIconGrid() {
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
    <div style={{ background: 'white', padding: '18px 16px' }}>
      <div className="icon-grid">
        {categories.map(c => (
          <a key={c.id} href={`#cat-${c.id}`} className="icon-grid-item">
            <div className="icon-grid-circle">
              {c.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : guessCategoryEmoji(c.name)}
            </div>
            <span>{c.name}</span>
          </a>
        ))}
      </div>

      <style>{`
        .icon-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 18px 20px;
        }
        .icon-grid-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          color: #333;
          text-align: center;
          width: 64px;
        }
        .icon-grid-circle {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          overflow: hidden;
        }
        .icon-grid-item span {
          font-size: 11.5px;
          line-height: 1.3;
        }
      `}</style>
    </div>
  )
}
