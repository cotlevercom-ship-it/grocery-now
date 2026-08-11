'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, active: 0, featured: 0, recent: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const profiles = await supabaseFetch(
          `founder_profiles?select=id,full_name,headline,location,is_active,is_featured,created_at&order=created_at.desc`
        )
        const total = profiles?.length || 0
        const active = (profiles || []).filter(p => p.is_active).length
        const featured = (profiles || []).filter(p => p.is_featured).length
        setStats({ total, active, featured, recent: (profiles || []).slice(0, 8) })
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [])

  const cardStyle = {
    background: 'white', borderRadius: '12px', border: '1px solid #e0e0e0',
    padding: '20px', flex: '1 1 160px', minWidth: '140px'
  }

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '4px' }}>Dashboard</h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>
        Overview of founder profiles on Cot Lever.
      </p>

      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '28px' }}>
        <div style={cardStyle}>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0a0a0a' }}>{loading ? '—' : stats.total}</div>
          <div style={{ fontSize: '12.5px', color: '#888', marginTop: '4px' }}>Total Profiles</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#2d6a4f' }}>{loading ? '—' : stats.active}</div>
          <div style={{ fontSize: '12.5px', color: '#888', marginTop: '4px' }}>Active</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#f4a300' }}>{loading ? '—' : stats.featured}</div>
          <div style={{ fontSize: '12.5px', color: '#888', marginTop: '4px' }}>Featured</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#163a2c' }}>Recent Founders</div>
        <Link href="/admin/founders" style={{ fontSize: '13px', color: '#2d6a4f', fontWeight: '600', textDecoration: 'none' }}>
          Manage all →
        </Link>
      </div>

      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>Loading...</div>
      ) : stats.recent.length === 0 ? (
        <div style={{ color: '#999', fontSize: '13px' }}>No founder profiles yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '680px' }}>
          {stats.recent.map(p => (
            <div key={p.id} style={{
              background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
              padding: '12px 16px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', gap: '10px', opacity: p.is_active ? 1 : 0.55
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#163a2c' }}>{p.full_name}</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.headline}{p.location ? ` · ${p.location}` : ''}
                </div>
              </div>
              {!p.is_active && <span style={{ fontSize: '11px', color: '#c62828', fontWeight: '600', flexShrink: 0 }}>Inactive</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
