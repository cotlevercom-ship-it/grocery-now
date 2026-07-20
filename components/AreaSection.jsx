'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AreaSection({ areas }) {
  const router = useRouter()
  const [selected, setSelected] = useState(null)

  function handleSelect(area) {
    setSelected(area.id)
    router.push(`/shops?area=${area.id}&name=${encodeURIComponent(area.name)}`)
  }

  return (
    <div style={{ padding: '16px 16px 4px' }}>
      <p style={{
        fontSize: '13px',
        color: '#6b6b6b',
        fontWeight: '600',
        margin: '0 0 10px'
      }}>
        এলাকা বেছে নিন
      </p>

      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px',
        scrollbarWidth: 'none'
      }}>
        {areas.map((area) => {
          const isSelected = selected === area.id
          return (
            <button
              key={area.id}
              onClick={() => handleSelect(area)}
              style={{
                flexShrink: 0,
                padding: '7px 14px',
                borderRadius: '20px',
                border: isSelected ? '1.5px solid #163a2c' : '1.5px solid #e0ddd3',
                background: isSelected ? '#163a2c' : '#fff',
                color: isSelected ? '#fff' : '#333',
                fontSize: '13px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
            >
              {area.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
