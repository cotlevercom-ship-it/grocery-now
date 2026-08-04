'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomeTabs({ productsSlot, shopsSlot }) {
  const [tab, setTab] = useState('products')
  const router = useRouter()

  return (
    <div style={{ background: '#f5f5f5' }}>
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e5e5e5' }}>
          <button
            onClick={() => setTab('products')}
            style={{
              background: 'none', border: 'none', padding: '10px 4px', marginRight: '20px',
              fontSize: '15px', fontWeight: '800', cursor: 'pointer',
              color: tab === 'products' ? '#0a0a0a' : '#999',
              borderBottom: tab === 'products' ? '2px solid #f4a300' : '2px solid transparent',
            }}
          >Products</button>
          <button
            onClick={() => setTab('shops')}
            style={{
              background: 'none', border: 'none', padding: '10px 4px', marginRight: '20px',
              fontSize: '15px', fontWeight: '800', cursor: 'pointer',
              color: tab === 'shops' ? '#0a0a0a' : '#999',
              borderBottom: tab === 'shops' ? '2px solid #f4a300' : '2px solid transparent',
            }}
          >Shops</button>
          <button
            onClick={() => router.push('/ship')}
            style={{
              background: 'none', border: 'none', padding: '10px 4px',
              fontSize: '15px', fontWeight: '800', cursor: 'pointer',
              color: '#999',
              borderBottom: '2px solid transparent',
            }}
          >Ship Parcel</button>
        </div>
      </div>

      <div style={{ display: tab === 'products' ? 'block' : 'none' }}>{productsSlot}</div>
      <div style={{ display: tab === 'shops' ? 'block' : 'none' }}>{shopsSlot}</div>
    </div>
  )
}
