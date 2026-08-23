'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import { sc } from '@/lib/memberTheme'
import AppSidebar from '@/components/AppSidebar'
import AppBottomNav from '@/components/AppBottomNav'

function timeLabel(iso) {
  const d = new Date(iso)
  return d.toLocaleString(undefined, { hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' })
}

function Avatar({ profile, size = 40 }) {
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

export default function MessageThreadPage() {
  const { userId: otherId } = useParams()
  const [myUserId, setMyUserId] = useState(null)
  const [myPremium, setMyPremium] = useState(false)
  const [otherProfile, setOtherProfile] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  const loadThread = useCallback(async (uid) => {
    try {
      const rows = await supabaseFetch(
        `messages?select=*&or=(and(sender_id.eq.${uid},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${uid}))&order=created_at.asc`
      )
      setMessages(rows || [])

      const unreadIds = (rows || []).filter(m => m.recipient_id === uid && !m.read).map(m => m.id)
      if (unreadIds.length > 0) {
        const inList = unreadIds.map(id => `"${id}"`).join(',')
        await supabaseFetch(`messages?id=in.(${inList})`, {
          method: 'PATCH',
          body: JSON.stringify({ read: true }),
        })
      }
    } catch (e) {
      console.error(e)
    }
  }, [otherId])

  useEffect(() => {
    const session = getSession()
    const uid = session?.user?.id || null
    setMyUserId(uid)
    if (!uid || !otherId) { setLoading(false); return }

    async function init() {
      setLoading(true)
      try {
        const rows = await supabaseFetch(`member_profiles?select=user_id,display_name,photo_url,location&user_id=eq.${otherId}`)
        setOtherProfile(rows?.[0] || null)
      } catch (e) { console.error(e) }
      try {
        const mine = await supabaseFetch(`member_profiles?select=is_premium&user_id=eq.${uid}`)
        setMyPremium(!!mine?.[0]?.is_premium)
      } catch (e) { console.error(e) }
      await loadThread(uid)
      setLoading(false)
    }
    init()

    const interval = setInterval(() => loadThread(uid), 15000)
    return () => clearInterval(interval)
  }, [otherId, loadThread])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const myOutboundCount = messages.filter(m => m.sender_id === myUserId).length
  const needsPremiumToReply = myOutboundCount >= 1 && !myPremium

  const handleSend = async () => {
    const content = draft.trim()
    if (!content) return
    if (!myUserId) { setError('Please log in to send messages.'); return }
    if (needsPremiumToReply) { setError('Replying is a Premium feature — upgrade from My Profile to keep the conversation going.'); return }
    setError('')
    setSending(true)
    try {
      await supabaseFetch('messages', {
        method: 'POST',
        body: JSON.stringify({ sender_id: myUserId, recipient_id: otherId, content }),
      })
      setDraft('')
      supabaseFetch('notifications', {
        method: 'POST',
        body: JSON.stringify({ recipient_id: otherId, actor_id: myUserId, type: 'message' }),
      }).catch(e => console.error(e))
      await loadThread(myUserId)
    } catch (e) {
      console.error(e)
      setError('Could not send message, please try again.')
    }
    setSending(false)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: sc.bg }}>
      <AppSidebar active="messages" />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div className="msg-thread-wrap" style={{ maxWidth: '640px', width: '100%', margin: '0 auto', padding: 'clamp(14px,2vw,24px)', display: 'flex', flexDirection: 'column', minHeight: '100vh', boxSizing: 'border-box' }}>
          <Link href="/messages" style={{ fontSize: '13px', color: sc.textSoft, textDecoration: 'none', display: 'inline-block', marginBottom: '12px' }}>
            ← Back to Messages
          </Link>

          <Link href={`/members/${otherId}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Avatar profile={otherProfile} size={38} />
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: sc.text }}>{otherProfile?.display_name || 'Cot Lever member'}</div>
              {otherProfile?.location && <div style={{ fontSize: '12px', color: sc.textSoft }}>{otherProfile.location}</div>}
            </div>
          </Link>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', paddingBottom: '12px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: sc.textSoft, fontSize: '13.5px' }}>Loading…</div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: sc.textSoft, fontSize: '13.5px' }}>
                No messages yet — say hello.
              </div>
            ) : (
              messages.map(m => {
                const isMine = m.sender_id === myUserId
                return (
                  <div key={m.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '78%' }}>
                      <div style={{
                        background: isMine ? theme.brass : sc.cardBg, color: isMine ? '#FFFFFF' : sc.text,
                        borderRadius: '14px', padding: '9px 13px', fontSize: '13.5px', lineHeight: '1.5',
                        whiteSpace: 'pre-wrap', boxShadow: isMine ? 'none' : sc.shadow,
                      }}>{m.content}</div>
                      <div style={{ fontSize: '10.5px', color: sc.textFaint, marginTop: '3px', textAlign: isMine ? 'right' : 'left' }}>
                        {timeLabel(m.created_at)}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          {error && (
            <div style={{ marginBottom: '8px', fontSize: '12.5px', color: theme.brass }}>{error}</div>
          )}

          {needsPremiumToReply ? (
            <Link href="/account" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '13px 16px', borderRadius: '999px', background: sc.chipBg,
              fontSize: '13.5px', color: sc.textSoft, textDecoration: 'none', marginTop: '4px',
            }}>
              🔒 Replying is a <b style={{ color: theme.brass }}>Premium</b> feature — tap to upgrade
            </Link>
          ) : (
          <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: `1px solid ${sc.line}` }}>
            <input
              type="text"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="Write a message…"
              style={{
                flex: 1, boxSizing: 'border-box', border: `1px solid ${sc.line}`, borderRadius: '999px',
                padding: '10px 16px', fontSize: '14px', fontFamily: theme.fontBody, color: sc.text, background: sc.cardBg,
              }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !draft.trim()}
              style={{
                background: (sending || !draft.trim()) ? '#E5E7EB' : theme.brass,
                color: (sending || !draft.trim()) ? '#6B7280' : '#FFFFFF',
                border: 'none', borderRadius: '999px', padding: '10px 20px', fontSize: '13.5px', fontWeight: '700',
                cursor: (sending || !draft.trim()) ? 'default' : 'pointer', flexShrink: 0,
              }}
            >Send</button>
          </div>
          )}
        </div>
      </div>

      <AppBottomNav active="messages" />

      <style jsx>{`
        @media (max-width: 860px) {
          .msg-thread-wrap {
            min-height: calc(100vh - 78px - env(safe-area-inset-bottom));
            padding-bottom: calc(14px + 78px + env(safe-area-inset-bottom)) !important;
          }
        }
      `}</style>
    </div>
  )
}
