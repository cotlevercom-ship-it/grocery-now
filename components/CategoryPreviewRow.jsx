import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'
import { guessCategoryEmoji } from '@/lib/categoryEmoji'

const PREVIEW_COUNT = 8

export default async function CategoryPreviewRow() {
  let categories = []
  try {
    categories = await supabaseFetch(
      `categories?select=id,name,image_url,sort_order&parent_id=is.null&is_active=eq.true&order=sort_order&limit=${PREVIEW_COUNT}`
    )
  } catch (e) {
    console.error(e)
  }

  if (!categories || categories.length === 0) return null

  const renderIcon = (c) => (
    c.image_url ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={c.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
    ) : guessCategoryEmoji(c.name)
  )

  return (
    <div style={{ background: 'white', padding: '16px' }}>
      <div className="cat-preview-scroll">
        {categories.map(c => (
          <Link key={c.id} href={`/category/${c.id}`} className="cat-preview-item">
            <div className="cat-preview-circle">{renderIcon(c)}</div>
            <span>{c.name}</span>
          </Link>
        ))}
        <Link href="/categories" className="cat-preview-item">
          <div className="cat-preview-circle cat-preview-more">→</div>
          <span>See All</span>
        </Link>
      </div>

      <style>{`
        .cat-preview-scroll {
          display: flex;
          gap: 18px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .cat-preview-scroll::-webkit-scrollbar { display: none; }
        .cat-preview-item {
          flex-shrink: 0;
          width: 66px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          color: #333;
          text-align: center;
        }
        .cat-preview-circle {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          overflow: hidden;
          box-sizing: border-box;
        }
        .cat-preview-more {
          background: #fff3d6;
          color: #a06c00;
          font-weight: 800;
          font-size: 18px;
        }
        .cat-preview-item span {
          font-size: 11px;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
        }
      `}</style>
    </div>
  )
}
