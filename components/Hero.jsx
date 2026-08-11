'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getSession, supabaseFetch } from '@/lib/supabase'

export default function Hero() {
  const [checking, setChecking] = useState(true)
  const [primaryHref, setPrimaryHref] = useState('/login?next=/profile/create')
  const [primaryLabel, setPrimaryLabel] = useState('Sign Up')
  const [photos, setPhotos] = useState([])

  useEffect(() => {
    async function init() {
      try {
        const rows = await supabaseFetch(
          `founder_profiles?select=image_url&is_active=eq.true&image_url=not.is.null&order=is_featured.desc,created_at.desc&limit=4`
        )
        setPhotos((rows || []).map(r => r.image_url))
      } catch (e) {
        console.error(e)
      }

      const session = getSession()
      if (!session?.user) {
        setChecking(false)
        return
      }
      try {
        const rows = await supabaseFetch(`founder_profiles?select=id&owner_id=eq.${session.user.id}`)
        if (rows && rows.length > 0) {
          setPrimaryHref('/browse')
          setPrimaryLabel('Browse Founders')
        } else {
          setPrimaryHref('/profile/create')
          setPrimaryLabel('Create Your Profile')
        }
      } catch (e) {
        console.error(e)
      }
      setChecking(false)
    }
    init()
  }, [])

  return (
    <div className="hero-wrap">
      <div className="hero-inner">
        <div className="hero-copy">
          <h1>
            <span className="gold">Cot Lever</span> Co-Founder Matching
          </h1>
          <p>Where founders in Bangladesh go to meet the person who'll build the next thing with them.</p>

          <div className="hero-cta">
            <Link href={checking ? '#' : primaryHref} className="btn-primary">{checking ? '...' : primaryLabel}</Link>
            <Link href="/browse" className="btn-secondary">Browse Founders</Link>
          </div>
        </div>

        <div className="hero-photos">
          <div className="photo-grid">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="photo-circle">
                {photos[i] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photos[i]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '24px', opacity: 0.3 }}>👤</span>
                )}
              </div>
            ))}
          </div>
          <p className="photo-caption">Real founders building on Cot Lever</p>
        </div>
      </div>

      <style jsx>{`
        .hero-wrap {
          background: #f7f6f2;
          padding: 60px 20px 50px;
        }
        .hero-inner {
          max-width: 1080px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        .hero-copy h1 {
          font-size: clamp(28px, 4.6vw, 44px);
          font-weight: 800;
          line-height: 1.15;
          color: #0a0a0a;
          margin: 0 0 16px;
        }
        .gold { color: #f4a300; }
        .hero-copy p {
          font-size: 15px;
          line-height: 1.6;
          color: #666;
          max-width: 440px;
          margin: 0 0 26px;
        }
        .hero-cta {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .btn-primary {
          background: #f4a300;
          color: #0a0a0a;
          padding: 13px 26px;
          border-radius: 10px;
          font-size: 14.5px;
          font-weight: 800;
          text-decoration: none;
        }
        .btn-secondary {
          background: white;
          color: #0a0a0a;
          border: 1.5px solid #0a0a0a;
          padding: 12px 26px;
          border-radius: 10px;
          font-size: 14.5px;
          font-weight: 700;
          text-decoration: none;
        }
        .hero-photos {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .photo-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          width: 220px;
        }
        .photo-circle {
          aspect-ratio: 1;
          border-radius: 50%;
          background: #e6e4dc;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .photo-caption {
          margin-top: 14px;
          font-size: 12px;
          font-style: italic;
          color: #999;
          text-align: center;
        }

        @media (min-width: 860px) {
          .hero-inner {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 60px;
          }
          .hero-copy { flex: 1; max-width: 560px; }
          .hero-photos { flex-shrink: 0; }
        }
      `}</style>
    </div>
  )
}
