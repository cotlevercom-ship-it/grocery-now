'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabaseFetch, getSession } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import { sc } from '@/lib/memberTheme'
import AppSidebar from '@/components/AppSidebar'
import AppBottomNav from '@/components/AppBottomNav'

const STAGE_LABELS = {
  idea: 'Idea stage',
  mvp: 'MVP / Pre-launch',
  early_revenue: 'Early revenue',
  growth: 'Growth stage',
}

function SearchIcon({ size = 15, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  )
}

function BusinessCard({ biz }) {
  return (
    <Link href={`/businesses/${biz.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: sc.cardBg, borderRadius: '14px', boxShadow: sc.shadow, padding: '18px',
        display: 'flex', flexDirection: 'column', gap: '10px', height: '100%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0,
            background: theme.brass, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {biz.photo_url ? (
              <img src={biz.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontFamily: theme.fontDisplay, fontSize: '18px', fontWeight: '600', color: '#FFFFFF' }}>
                {(biz.name || '?').trim().charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: theme.fontDisplay, fontSize: '16px', fontWeight: '700', color: sc.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {biz.name}
            </div>
            {biz.industry && <div style={{ fontSize: '12.5px', color: sc.textSoft }}>{biz.industry}</div>}
          </div>
        </div>

        {biz.description && (
          <div style={{ fontSize: '13px', color: sc.textSoft, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {biz.description}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: 'auto', paddingTop: '4px' }}>
          {biz.stage && (
            <span style={{ fontSize: '11px', fontWeight: '600', padding: '4px 9px', borderRadius: '999px', background: sc.chipBg, color: sc.chipText }}>
              {STAGE_LABELS[biz.stage] || biz.stage}
            </span>
          )}
          {biz.equity_percent && (
            <span style={{ fontSize: '11px', fontWeight: '600', padding: '4px 9px', borderRadius: '999px', background: sc.industryChipBg, color: sc.industryChipText }}>
              {biz.equity_percent}% equity
            </span>
          )}
          {biz.funding_needed && (
            <span style={{ fontSize: '11px', fontWeight: '600', padding: '4px 9px', borderRadius: '999px', background: sc.chipBg, color: sc.chipText }}>
              Needs {biz.funding_needed}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function BusinessesPage() {
  const router = useRouter()
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [myBusinessId, setMyBusinessId] = useState(undefined) // undefined = unknown yet, null = none

  const load = useCallback(async (uid) => {
    setLoading(true)
    try {
      const [biz, mine] = await Promise.all([
        supabaseFetch('businesses?select=id,name,industry,description,stage,equity_percent,funding_needed,photo_url,owner_id&is_active=eq.true&order=created_at.desc'),
        uid ? supabaseFetch(`businesses?select=id&owner_id=eq.${uid}&order=created_at.desc&limit=1`) : Promise.resolve([]),
      ])
      setRows(biz || [])
      setMyBusinessId(mine?.[0]?.id || null)
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [])

  useEffect(() => {
    const session = getSession()
    const uid = session?.user?.id
    if (!uid) { router.replace('/login?next=/businesses'); return }
    setUserId(uid)
    load(uid)
  }, [router, load])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return rows
    return rows.filter(b =>
      (b.name || '').toLowerCase().includes(term) ||
      (b.industry || '').toLowerCase().includes(term) ||
      (b.description || '').toLowerCase().includes(term)
    )
  }, [rows, q])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: sc.bg }}>
      <AppSidebar active="businesses" />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: 'clamp(20px,3vw,32px) clamp(16px,3vw,24px) 90px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontFamily: theme.fontDisplay, fontWeight: '700', fontSize: '24px', color: sc.text, marginBottom: '4px' }}>Businesses</h1>
              <p style={{ fontSize: '13.5px', color: sc.textSoft }}>Browse businesses looking for investors, and connect directly.</p>
            </div>
            <Link href={myBusinessId ? `/businesses/${myBusinessId}` : '/businesses/new'} style={{ textDecoration: 'none' }}>
              <button type="button" style={{
                padding: '10px 16px', borderRadius: '9px', border: 'none', background: theme.brass, color: '#FFFFFF',
                fontSize: '13.5px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
                {myBusinessId ? 'My Business' : '+ Add Business'}
              </button>
            </Link>
          </div>

          <div style={{ position: 'relative', margin: '18px 0' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: sc.textFaint }}>
              <SearchIcon />
            </span>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search by name, industry…"
              style={{
                width: '100%', padding: '12px 14px 12px 40px', borderRadius: '10px', border: `1px solid ${sc.line}`,
                background: sc.cardBg, fontSize: '14px', color: sc.text, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: sc.textSoft, fontSize: '13.5px' }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: sc.textSoft, fontSize: '13.5px' }}>
              No businesses found yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
              {filtered.map(b => <BusinessCard key={b.id} biz={b} />)}
            </div>
          )}
        </div>
      </div>

      <AppBottomNav active="businesses" />
    </div>
  )
}
