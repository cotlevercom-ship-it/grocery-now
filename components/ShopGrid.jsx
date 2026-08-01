'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ShopGrid({ shops, departments }) {
  const [selectedDept, setSelectedDept] = useState('all')

  const deptCounts = departments.map(d => ({
    ...d,
    count: shops.filter(s => s.department_id === d.id).length,
  })).filter(d => d.count > 0)

  const filteredShops = selectedDept === 'all'
    ? shops
    : shops.filter(s => s.department_id === selectedDept)

  return (
    <>
      {deptCounts.length > 0 && (
        <div className="dept-row">
          <button
            className={`dept-chip ${selectedDept === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedDept('all')}
          >
            All ({shops.length})
          </button>
          {deptCounts.map(d => (
            <button
              key={d.id}
              className={`dept-chip ${selectedDept === d.id ? 'active' : ''}`}
              onClick={() => setSelectedDept(d.id)}
            >
              <span style={{ marginRight: '5px' }}>{d.icon}</span>
              {d.name} ({d.count})
            </button>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h2 className="shop-heading" style={{ fontWeight: '700', color: '#163a2c', margin: 0 }}>
          All Shops
        </h2>
        <span style={{
          fontSize: '12px', color: '#2d6a4f', background: '#f5f5f5',
          padding: '4px 12px', borderRadius: '20px', fontWeight: '500'
        }}>
          {filteredShops.length} shops
        </span>
      </div>

      {filteredShops.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏪</div>
          <p>No shops in this department yet</p>
        </div>
      ) : (
        <div className="shop-grid">
          {filteredShops.map((shop) => (
            <Link key={shop.id} href={`/shops/${shop.id}`} className="shop-card">
              <div style={{ position: 'relative' }}>
                <img
                  src={shop.image_url || '/placeholder-shop.png'}
                  alt={shop.name}
                  className="shop-image"
                  style={{ width: '100%', objectFit: 'cover', display: 'block' }}
                />
                {shop.is_featured && (
                  <div style={{
                    position: 'absolute', top: '8px', left: '8px',
                    background: '#f4a300', color: '#1a1a1a',
                    fontSize: '10px', fontWeight: '700', padding: '3px 9px',
                    borderRadius: '6px'
                  }}>Featured</div>
                )}
                <div style={{
                  position: 'absolute', bottom: '8px', right: '8px',
                  background: 'rgba(255,255,255,0.92)', borderRadius: '6px',
                  padding: '3px 8px', fontSize: '11px', fontWeight: '600', color: '#1a1a1a'
                }}>
                  ⭐ {shop.rating || 'New'}
                </div>
              </div>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                  {shop.name}
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                  {shop.category}
                </div>
                <div style={{
                  fontSize: '12px', color: '#2d6a4f', marginTop: '8px',
                  fontWeight: '500'
                }}>
                  🚴 {shop.delivery_time_min}-{shop.delivery_time_max} min
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style jsx>{`
        .dept-row {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          margin-bottom: 20px;
          scrollbar-width: none;
        }
        .dept-row::-webkit-scrollbar { display: none; }
        .dept-chip {
          flex-shrink: 0;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 999px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          color: #444;
          white-space: nowrap;
        }
        .dept-chip.active {
          background: #0a0a0a;
          border-color: #0a0a0a;
          color: white;
        }
      `}</style>
    </>
  )
}
