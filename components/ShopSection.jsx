'use client'
import { useState } from 'react'

const dummyShops = [
  { id: 1, name: 'Kutush Pet Shop (Uttara)', time: '45 min', fee: 74, image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400', ad: true },
  { id: 2, name: 'Faiza Enterprise', time: '50 min', fee: 74, image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400', ad: true },
  { id: 3, name: 'Blink & Buy Supermarket', time: '30 min', fee: 74, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400', ad: true },
  { id: 4, name: 'Brothers Enterprise (Uttara)', time: '50 min', fee: 74, image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400', ad: true },
  { id: 5, name: 'City Mart', time: '40 min', fee: 65, image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400', ad: false },
  { id: 6, name: 'Fresh Corner', time: '35 min', fee: 70, image: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=400', ad: false },
  { id: 7, name: 'Meat & More', time: '55 min', fee: 80, image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400', ad: true },
  { id: 8, name: 'The Grocery Supermart', time: '45 min', fee: 74, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400', ad: true },
]

export default function ShopSection() {
  const [favorites, setFavorites] = useState({})

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div style={{ padding: '20px 16px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a', marginBottom: '16px' }}>
        Shop by store
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '16px'
      }}>
        {dummyShops.map((shop) => (
          <div key={shop.id} style={{ cursor: 'pointer' }}>
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', marginBottom: '8px' }}>
              <img
                src={shop.image}
                alt={shop.name}
                style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }}
              />
              <button
                onClick={() => toggleFavorite(shop.id)}
                style={{
                  position: 'absolute', top: '8px', right: '8px',
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'white', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }}
              >
                {favorites[shop.id] ? '❤️' : '🤍'}
              </button>
              {shop.ad && (
                <div style={{
                  position: 'absolute', bottom: '8px', right: '8px',
                  background: 'rgba(0,0,0,0.65)', color: 'white',
                  fontSize: '10px', padding: '2px 6px', borderRadius: '4px'
                }}>
                  Ad
                </div>
              )}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '2px' }}>
              {shop.name}
            </div>
            <div style={{ fontSize: '12px', color: '#777', marginBottom: '2px' }}>
              From {shop.time}
            </div>
            <div style={{ fontSize: '12px', color: '#777', display: 'flex', alignItems: 'center', gap: '4px' }}>
              🛵 Tk{shop.fee}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
