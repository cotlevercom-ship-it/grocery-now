'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'

export default function ShopSection() {
  const [favorites, setFavorites] = useState({})
  const [selectedArea, setSelectedArea] = useState(null)
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let area = null
    try {
      const saved = localStorage.getItem('selectedArea')
      if (saved) area = JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }
    setSelectedArea(area)

    if (!area?.id) {
      setLoading(false)
      return
    }

    async function loadShops() {
      setLoading(true)
      try {
        const data = await supabaseFetch(
          `shops?select=*&area_id=eq.${area.id}&is_active=eq.true&order=is_featured.desc,name&limit=8`
        )
        setShops(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadShops()
  }, [])

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div style={{ padding: '20px 16px' }}>
      <h2 className="shop-heading" style={{ fontWeight: '700', color: '#1a1a1a', marginBottom: '16px' }}>
        Shop by store
      </h2>

      {!selectedArea?.id ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#999', fontSize: '13px' }}>
          দোকান দেখতে প্রথমে আপনার এলাকা নির্বাচন করুন 📍
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#999', fontSize: '13px' }}>
          লোড হচ্ছে...
        </div>
      ) : shops.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#999', fontSize: '13px' }}>
          এই এলাকায় এখনো কোনো দোকান নেই
        </div>
      ) : (
        <div className="shop-grid">
          {shops.map((shop) => (
            <Link key={shop.id} href={`/shops/${shop.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ cursor: 'pointer' }}>
                <div style={{
                  position: 'relative', borderRadius: '12px', overflow: 'hidden', marginBottom: '8px',
                  background: '#f1f8e9', aspectRatio: '4 / 3',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px'
                }}>
                  🛒
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      toggleFavorite(shop.id)
                    }}
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
                  {shop.is_featured && (
                    <div style={{
                      position: 'absolute', bottom: '8px', right: '8px',
                      background: 'rgba(0,0,0,0.65)', color: 'white',
                      fontSize: '10px', padding: '2px 6px', borderRadius: '4px'
                    }}>
                      ফিচার্ড
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '2px' }}>
                  {shop.name}
                </div>
                <div style={{ fontSize: '12px', color: '#777', marginBottom: '2px' }}>
                  {shop.delivery_time_min}-{shop.delivery_time_max} মি.
                </div>
                <div style={{ fontSize: '12px', color: '#777', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  🛵 {shop.delivery_charge === 0 ? 'ফ্রি' : `৳${shop.delivery_charge}`}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
