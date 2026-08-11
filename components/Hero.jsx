import { supabaseFetch } from '@/lib/supabase'
import BannerCarousel from './BannerCarousel'

export default async function Hero() {
  let banners = []
  try {
    banners = await supabaseFetch('banners?select=*&is_active=eq.true&order=sort_order')
  } catch (e) {
    console.error(e)
  }

  return (
    <div className="hero-wrap">
      {banners && banners.length > 0 ? (
        <BannerCarousel banners={banners} />
      ) : (
        <div className="hero-fallback">
          <span className="hero-fallback-eyebrow">Cot Lever Marketplace</span>
          <h1>Find it. Message the seller. Done.</h1>
          <p>Browse listings from merchants across the country — no checkout, just a direct message.</p>
        </div>
      )}
      <style>{`
        .hero-wrap { background: #0a0a0a; }
        .hero-fallback {
          padding: clamp(36px, 6vw, 64px) clamp(20px, 4vw, 56px);
          color: #faf7f0;
          max-width: 640px;
        }
        .hero-fallback-eyebrow {
          display: inline-block;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #f4a300;
          margin-bottom: 10px;
        }
        .hero-fallback h1 {
          font-size: clamp(24px, 3.4vw, 38px);
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 10px;
        }
        .hero-fallback p {
          font-size: clamp(13px, 1.1vw, 15px);
          color: rgba(250,247,240,0.7);
          line-height: 1.5;
        }
      `}</style>
    </div>
  )
}
