'use client'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function BrowseGrid({ profiles }) {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [lookingForFilter, setLookingForFilter] = useState('all')

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) setQuery(q)
  }, [searchParams])

  const lookingForTags = useMemo(() => {
    const counts = {}
    profiles.forEach(p => (p.looking_for || []).forEach(tag => {
      counts[tag] = (counts[tag] || 0) + 1
    }))
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([tag, count]) => ({ tag, count }))
  }, [profiles])

  const stages = [
    { value: 'idea', label: 'Idea' },
    { value: 'mvp', label: 'MVP' },
    { value: 'early-revenue', label: 'Early Revenue' },
    { value: 'scaling', label: 'Scaling' },
  ]

  const filtered = profiles.filter(p => {
    if (stageFilter !== 'all' && p.stage !== stageFilter) return false
    if (lookingForFilter !== 'all' && !(p.looking_for || []).includes(lookingForFilter)) return false
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      const haystack = [
        p.full_name, p.headline, p.bio, p.location,
        ...(p.skills || []), ...(p.looking_for || []), ...(p.industries || []),
      ].filter(Boolean).join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search by name, skill, or what you're looking for..."
        className="browse-search"
      />

      <div className="filter-row">
        <button className={`filter-chip ${stageFilter === 'all' ? 'active' : ''}`} onClick={() => setStageFilter('all')}>All Stages</button>
        {stages.map(s => (
          <button key={s.value} className={`filter-chip ${stageFilter === s.value ? 'active' : ''}`} onClick={() => setStageFilter(s.value)}>{s.label}</button>
        ))}
      </div>

      {lookingForTags.length > 0 && (
        <div className="filter-row">
          <button className={`filter-chip tag ${lookingForFilter === 'all' ? 'active' : ''}`} onClick={() => setLookingForFilter('all')}>Any Role</button>
          {lookingForTags.map(({ tag, count }) => (
            <button key={tag} className={`filter-chip tag ${lookingForFilter === tag ? 'active' : ''}`} onClick={() => setLookingForFilter(tag)}>
              {tag} ({count})
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔍</div>
          <p>No founders match right now — try a different search or filter.</p>
        </div>
      ) : (
        <div className="founder-grid">
          {filtered.map(p => (
            <Link key={p.id} href={`/founder/${p.id}`} className="founder-card">
              <div className="founder-card-top">
                <div className="founder-avatar">
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt={p.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : '👤'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="founder-name">{p.full_name}</div>
                  {p.location && <div className="founder-location">{p.location}</div>}
                </div>
              </div>
              <div className="founder-headline">{p.headline}</div>
              {(p.looking_for || []).length > 0 && (
                <div className="founder-tags">
                  {p.looking_for.slice(0, 3).map((tag, i) => (
                    <span key={i} className="founder-tag">{tag}</span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      <style jsx>{`
        .browse-search {
          width: 100%;
          padding: 13px 16px;
          border-radius: 10px;
          border: 1px solid #e0ded8;
          font-size: 14px;
          box-sizing: border-box;
          margin-bottom: 14px;
          background: white;
        }
        .filter-row {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          margin-bottom: 10px;
          scrollbar-width: none;
        }
        .filter-row::-webkit-scrollbar { display: none; }
        .filter-chip {
          flex-shrink: 0;
          background: white;
          border: 1px solid #e4e4e1;
          border-radius: 999px;
          padding: 7px 14px;
          font-size: 12.5px;
          font-weight: 600;
          color: #55554f;
          white-space: nowrap;
        }
        .filter-chip.active {
          background: #0a0a0a;
          border-color: #0a0a0a;
          color: #f4a300;
        }
        .founder-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-top: 16px;
        }
        @media (min-width: 640px) {
          .founder-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 960px) {
          .founder-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .founder-card {
          display: block;
          background: white;
          border: 1px solid #ececea;
          border-radius: 14px;
          padding: 16px;
          text-decoration: none;
          transition: box-shadow 0.15s ease, transform 0.15s ease;
        }
        .founder-card:hover {
          box-shadow: 0 6px 18px rgba(10,10,10,0.08);
          transform: translateY(-1px);
        }
        .founder-card-top {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }
        .founder-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #f6f6f4;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          overflow: hidden;
        }
        .founder-name {
          font-size: 15px;
          font-weight: 700;
          color: #0a0a0a;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .founder-location {
          font-size: 12px;
          color: #999;
          margin-top: 2px;
        }
        .founder-headline {
          font-size: 13px;
          color: #444;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 38px;
        }
        .founder-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 10px;
        }
        .founder-tag {
          font-size: 10.5px;
          font-weight: 600;
          color: #a06c00;
          background: #fff3d6;
          padding: 3px 9px;
          border-radius: 6px;
        }
      `}</style>
    </div>
  )
}
