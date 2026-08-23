'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import { sc } from '@/lib/memberTheme'
import AppSidebar from '@/components/AppSidebar'
import AppBottomNav from '@/components/AppBottomNav'
import VerifiedBadge from '@/components/VerifiedBadge'

function Avatar({ profile, size = 46 }) {
  const initial = (profile?.display_name || '?').trim().charAt(0).toUpperCase()
  return (
    <div style={{
      width: `${size}px`, height: `${size}px`, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      background: theme.brass, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {profile?.photo_url ? (
        <img src={profile.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ fontFamily: theme.fontDisplay, fontSize: `${Math.round(size * 0.4)}px`, fontWeight: '600', color: '#FFFFFF' }}>{initial}</span>
      )}
    </div>
  )
}

export default function BookmarksPage() {
  const router = useRouter()
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState([])
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async (uid) => {
    setLoading(true)
    try {
      const marks = await supabaseFetch(`bookmarks?select=id,bookmarked_user_id,created_at&user_id=eq.${uid}&order=created_at.desc`)
      const otherIds = (marks || []).map(m => m.bookmarked_user_id)
      let profilesById = {}
      if (otherIds.length > 0) {
        const inList = [...new Set(otherIds)].map(id => `"${id}"`).join(',')
        const profiles = await supabaseFetch(`member_profiles?select=user_id,display_name,photo_url,role_title,location,verified&user_id=in.(${inList})`)
        profilesById = Object.fromEntries((profiles || []).map(p => [p.user_id, p]))
      }
      setRows((marks || []).map(m => ({ id: m.id, profile: profilesById[m.bookmarked_user_id] || { user_id: m.bookmarked_user_id } })))
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [])

  useEffect(() => {
    const session = getSession()
    const uid = session?.user?.id
    if (!uid) { router.replace('/login?next=/bookmarks'); return }
    setUserId(uid)
    load(uid)
  }, [router, load])

  const removeBookmark = async (id) => {
    setBusyId(id)
    try {
      await supabaseFetch(`bookmarks?id=eq.${id}`, { method: 'DELETE' })
      setRows(prev => prev.filter(r => r.id !== id))
    } catch (e) { console.error(e) }
    setBusyId(null)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: sc.bg }}>
      <AppSidebar active="bookmarks" />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'clamp(20px,3vw,32px) clamp(16px,3vw,24px) 70px' }}>
          <h1 style={{ fontFamily: theme.fontDisplay, fontWeight: '700', fontSize: '24px', color: sc.text, marginBottom: '4px' }}>Bookmarks</h1>
          <p style={{ fontSize: '13.5px', color: sc.textSoft, marginBottom: '20px' }}>
            {loading ? 'Loading…' : `${rows.length} saved profile${rows.length === 1 ? '' : 's'}.`}
          </p>

          {loading ? null : rows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: sc.textSoft, fontSize: '13.5px' }}>
              No bookmarks yet. Tap the 📑 icon on a member&apos;s profile to save it here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {rows.map(r => (
                <div key={r.id} style={{
                  background: sc.cardBg, borderRadius: '12px', boxShadow: sc.shadow, padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                  <Link href={`/members/${r.profile.user_id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0, textDecoration: 'none' }}>
                    <Avatar profile={r.profile} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14.5px', fontWeight: '700', color: sc.text }}>
                        {r.profile.display_name || 'Cot Lever member'}
                        {r.profile.verified && <VerifiedBadge size={13} />}
                      </div>
                      <div style={{ fontSize: '12px', color: sc.textSoft }}>{[r.profile.role_title, r.profile.location].filter(Boolean).join(' · ')}</div>
                    </div>
                  </Link>
                  <button type="button" onClick={() => removeBookmark(r.id)} disabled={busyId === r.id} style={{
                    background: 'transparent', color: sc.textSoft, border: `1px solid ${sc.line}`, borderRadius: '8px',
                    padding: '8px 14px', fontSize: '12.5px', fontWeight: '700', cursor: busyId === r.id ? 'default' : 'pointer', flexShrink: 0,
                  }}>Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AppBottomNav active="bookmarks" />

      <style jsx global>{`
        @media (max-width: 860px) {
          body { padding-bottom: 62px; }
        }
      `}</style>
    </div>
  )
}
