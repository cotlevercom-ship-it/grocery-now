import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'

export default async function RecentFounders() {
  let profiles = []
  try {
    profiles = await supabaseFetch(
      `founder_profiles?select=id,full_name,headline,location,image_url,looking_for&is_active=eq.true&order=is_featured.desc,created_at.desc&limit=6`
    )
  } catch (e) {
    console.error(e)
  }

  if (!profiles || profiles.length === 0) return null

  return (
    <div className="recent-section">
      <div className="recent-header">
        <span className="recent-label">Recently Joined</span>
        <h2 className="recent-title">Founders on Cot Lever</h2>
      </div>

      <div className="recent-grid">
        {profiles.map(p => (
          <Link key={p.id} href={`/founder/${p.id}`} className="recent-card">
            <div className="recent-avatar">
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image_url} alt={p.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : '👤'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="recent-name">{p.full_name}</div>
              <div className="recent-headline">{p.headline}</div>
              {p.location && <div className="recent-location">{p.location}</div>}
            </div>
          </Link>
        ))}
      </div>

      <div className="recent-footer">
        <Link href="/browse" className="see-all-link">See all founders →</Link>
      </div>

      <style>{`
        .recent-section { max-width: 1080px; margin: 0 auto; padding: 40px 20px 50px; }
        .recent-header { margin-bottom: 20px; }
        .recent-label {
          display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
          text-transform: uppercase; color: #a3a39d; margin-bottom: 4px;
        }
        .recent-title { font-size: 22px; font-weight: 800; color: #0a0a0a; margin: 0; }
        .recent-grid {
          display: grid; grid-template-columns: 1fr; gap: 12px;
        }
        @media (min-width: 640px) { .recent-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 960px) { .recent-grid { grid-template-columns: repeat(3, 1fr); } }
        .recent-card {
          display: flex; align-items: center; gap: 12px;
          background: white; border: 1px solid #ececea; border-radius: 12px;
          padding: 14px; text-decoration: none;
        }
        .recent-avatar {
          width: 44px; height: 44px; border-radius: 50%; background: #f6f6f4;
          flex-shrink: 0; display: flex; align-items: center; justify-content: center;
          font-size: 18px; overflow: hidden;
        }
        .recent-name { font-size: 14px; font-weight: 700; color: #0a0a0a; }
        .recent-headline {
          font-size: 12px; color: #666; margin-top: 2px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .recent-location { font-size: 11px; color: #999; margin-top: 2px; }
        .recent-footer { text-align: center; margin-top: 24px; }
        .see-all-link { font-size: 13px; font-weight: 700; color: #0a0a0a; text-decoration: none; border-bottom: 2px solid #f4a300; padding-bottom: 2px; }
      `}</style>
    </div>
  )
}
