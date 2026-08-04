'use client'

import { useState, useEffect, useRef } from 'react'

export default function BannerCarousel({ banners }) {
  const [index, setIndex] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!banners || banners.length <= 1) return
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(timerRef.current)
  }, [banners.length])

  if (!banners || banners.length === 0) return null

  return (
    <div>
      <div className="banner-box" style={{
        position: 'relative', width: '100%', aspectRatio: '2.6 / 1',
        overflow: 'hidden', background: '#f5f5f5',
      }}>
        <div style={{
          display: 'flex', width: `${banners.length * 100}%`, height: '100%',
          transform: `translateX(-${(index * 100) / banners.length}%)`,
          transition: 'transform 0.5s ease',
        }}>
          {banners.map((banner) => {
            const img = (
              <img
                src={banner.image_url}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            )
            return banner.link_url ? (
              <a key={banner.id} href={banner.link_url} style={{ width: `${100 / banners.length}%`, flexShrink: 0 }}>
                {img}
              </a>
            ) : (
              <div key={banner.id} style={{ width: `${100 / banners.length}%`, flexShrink: 0 }}>
                {img}
              </div>
            )
          })}
        </div>

        {banners.length > 1 && (
          <div style={{
            position: 'absolute', bottom: '10px', left: 0, right: 0,
            display: 'flex', justifyContent: 'center', gap: '6px',
          }}>
            {banners.map((b, i) => (
              <div
                key={b.id}
                onClick={() => setIndex(i)}
                style={{
                  width: i === index ? '16px' : '6px', height: '6px', borderRadius: '3px',
                  background: i === index ? '#f4a300' : 'rgba(255,255,255,0.65)',
                  cursor: 'pointer', transition: 'width 0.3s ease',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
