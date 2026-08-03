'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomeSearch() {
  const [q, setQ] = useState('')
  const router = useRouter()

  const submit = (e) => {
    e.preventDefault()
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <div style={{ background: '#0a0a0a', padding: '18px 16px 22px' }}>
      <form onSubmit={submit} style={{
        maxWidth: '760px', margin: '0 auto', display: 'flex',
        borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.25)'
      }}>
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search products, e.g. rice, shampoo bottle, snacks..."
          style={{
            flex: 1, border: 'none', outline: 'none', padding: '13px 16px',
            fontSize: '14px', background: 'white', color: '#1a1a1a'
          }}
        />
        <button type="submit" style={{
          background: '#f4a300', color: '#0a0a0a', border: 'none',
          padding: '0 22px', fontSize: '14px', fontWeight: '700', cursor: 'pointer'
        }}>
          Search
        </button>
      </form>
      <div style={{
        maxWidth: '760px', margin: '10px auto 0', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px'
      }}>
        <span style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.5)' }}>
          Search across all merchants on Cot Lever
        </span>
        <a href="/ship" style={{
          fontSize: '11.5px', color: '#f4a300', textDecoration: 'none', fontWeight: '600'
        }}>
          🌍 Deliver to your country →
        </a>
      </div>
    </div>
  )
}
