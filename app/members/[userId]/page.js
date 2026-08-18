'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabaseFetch, getSession } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import VerifiedBadge from '@/components/VerifiedBadge'

function ConnectSection({ member }) {
  const session = getSession()
  const myUserId = session?.user?.id || null
  const [status, setStatus] = useState('checking') // checking | self | not_sent | sending | sent | error
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!myUserId) { setStatus('not_sent'); return }
    if (myUserId === member.user_id) { setStatus('self'); return }

    supabaseFetch(`connection_requests?select=id&from_user_id=eq.${myUserId}&to_user_id=eq.${member.user_id}&limit=1`)
      .then(rows => setStatus(rows && rows.length > 0 ? 'sent' : 'not_sent'))
      .catch(() => setStatus('not_sent'))
  }, [myUserId, member.user_id])

  async function sendRequest() {
    setStatus('sending')
    try {
      const rows = await supabaseFetch('connection_requests', {
        method: 'POST',
        body: JSON.stringify({
          from_user_id: myUserId,
          to_user_id: member.user_id,
          message: message.trim() || null,
        }),
      })
      const requestId = rows?.[0]?.id
      if (requestId) {
        // Best-effort — the request row is already saved even if the email fails.
        fetch('/api/connect/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestId }),
        }).catch(() => {})
      }
      setStatus('sent')
      setShowForm(false)
    } catch (e) {
      console.error(e)
      setStatus('error')
    }
  }

  if (status === 'checking' || status === 'self') return null

  return (
    <div style={{ borderTop: `1px solid ${theme.line}`, marginTop: '22px', paddingTop: '20px' }}>
      {status === 'sent' && (
        <div style={{
          textAlign: 'center', fontSize: '13.5px', fontWeight: '600', color: theme.brassDark,
          background: theme.paper, border: `1px solid ${theme.line}`, borderRadius: '8px', padding: '12px',
        }}>Request sent — they'll be notified by email.</div>
      )}

      {(status === 'not_sent' || status === 'sending' || status === 'error') && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          disabled={status === 'sending'}
          style={{
            width: '100%', background: theme.signal, color: '#fff', border: 'none', borderRadius: '8px',
            padding: '12px', fontSize: '14.5px', fontWeight: '700', cursor: 'pointer',
          }}
        >Request to Connect</button>
      )}

      {(status === 'not_sent' || status === 'sending' || status === 'error') && showForm && (
        <div>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Add a short note (optional)…"
            rows={3}
            style={{
              width: '100%', boxSizing: 'border-box', resize: 'vertical', marginBottom: '10px',
              background: theme.paper, border: `1px solid ${theme.line}`, borderRadius: '8px',
              padding: '10px 12px', fontSize: '14px', color: theme.ink, fontFamily: 'inherit',
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={sendRequest}
              disabled={status === 'sending'}
              style={{
                flex: 1, background: theme.signal, color: '#fff', border: 'none', borderRadius: '8px',
                padding: '11px', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                opacity: status === 'sending' ? 0.7 : 1,
              }}
            >{status === 'sending' ? 'Sending…' : 'Send Request'}</button>
            <button
              onClick={() => setShowForm(false)}
              disabled={status === 'sending'}
              style={{
                background: theme.paper, color: theme.inkSoft, border: `1px solid ${theme.line}`, borderRadius: '8px',
                padding: '11px 16px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              }}
            >Cancel</button>
          </div>
          {status === 'error' && (
            <p style={{ color: theme.signal, fontSize: '12.5px', marginTop: '8px' }}>Something went wrong — try again.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function MemberDetailPage() {
  const { userId } = useParams()
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await supabaseFetch(`member_profiles?select=*&user_id=eq.${userId}&is_discoverable=eq.true`)
        setMember(data?.[0] || null)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    if (userId) load()
  }, [userId])

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: theme.inkSoft }}>Loading…</div>

  if (!member) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: theme.inkSoft }}>
        Profile not found. <Link href="/members" style={{ color: theme.brassDark, fontWeight: '600' }}>Back to co-founders</Link>
      </div>
    )
  }

  const initial = (member.display_name || '?').trim().charAt(0).toUpperCase()

  return (
    <div style={{ background: theme.paper, minHeight: '70vh' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'clamp(20px,4vw,48px) clamp(16px,3vw,24px)' }}>
        <Link href="/members" style={{ fontSize: '13px', color: theme.inkSoft, textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>← Browse co-founders</Link>

        <div style={{ background: theme.surface, borderRadius: '12px', border: `1px solid ${theme.line}`, padding: 'clamp(24px,3.5vw,36px)' }}>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              width: '120px', height: '120px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
              background: theme.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px'
            }}>
              {member.photo_url ? (
                <img src={member.photo_url} alt={member.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontFamily: theme.fontDisplay, fontSize: '42px', fontWeight: '600', color: theme.paper }}>{initial}</span>
              )}
            </div>
            <h1 style={{
              fontFamily: theme.fontDisplay, fontSize: 'clamp(22px,2.8vw,28px)', fontWeight: '600', color: theme.ink,
              display: 'flex', alignItems: 'center', gap: '7px',
            }}>
              {member.display_name}
              {member.verified && <VerifiedBadge size={19} />}
            </h1>
            <div style={{ fontSize: '14px', color: theme.inkSoft, marginTop: '4px' }}>
              {member.role_title || 'Role not specified'}{member.location ? ` · ${member.location}` : ''}
            </div>
          </div>

          {(member.looking_for || member.commitment || member.interested_industry) && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '22px' }}>
              {member.looking_for && (
                <span style={{
                  fontSize: '11.5px', fontWeight: '600', padding: '5px 11px', borderRadius: '20px',
                  background: theme.signalSoft, color: theme.signal
                }}>Looking for: {member.looking_for}</span>
              )}
              {member.commitment && (
                <span style={{
                  fontSize: '11.5px', fontWeight: '600', padding: '5px 11px', borderRadius: '20px',
                  background: theme.paper, border: `1px solid ${theme.line}`, color: theme.inkSoft
                }}>{member.commitment}</span>
              )}
              {member.interested_industry && (
                <span style={{
                  fontSize: '11.5px', fontWeight: '600', padding: '5px 11px', borderRadius: '20px',
                  background: theme.paper, border: `1px solid ${theme.line}`, color: theme.inkSoft
                }}>Interested in: {member.interested_industry}</span>
              )}
            </div>
          )}

          {member.bio && (
            <p style={{ fontSize: '15px', color: theme.ink, lineHeight: '1.7', marginBottom: '22px' }}>
              {member.bio}
            </p>
          )}

          {member.experience && (
            <div style={{ marginBottom: '22px' }}>
              <div style={{
                fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
                color: theme.brassDark, marginBottom: '8px', fontWeight: '600'
              }}>Experience</div>
              <p style={{ fontSize: '14px', color: theme.ink, lineHeight: '1.6' }}>{member.experience}</p>
            </div>
          )}

          {(member.industry || member.years_experience || member.founder_type || member.education) && (
            <div style={{ marginBottom: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {member.industry && (
                <div style={{ fontSize: '14px', color: theme.ink }}>
                  <span style={{ color: theme.inkSoft }}>Industry: </span>{member.industry}
                </div>
              )}
              {member.years_experience && (
                <div style={{ fontSize: '14px', color: theme.ink }}>
                  <span style={{ color: theme.inkSoft }}>Experience: </span>{member.years_experience}
                </div>
              )}
              {member.founder_type && (
                <div style={{ fontSize: '14px', color: theme.ink }}>
                  <span style={{ color: theme.inkSoft }}>Founder type: </span>{member.founder_type === 'serial' ? 'Serial founder' : 'First-time founder'}
                </div>
              )}
              {member.education && (
                <div style={{ fontSize: '14px', color: theme.ink }}>
                  <span style={{ color: theme.inkSoft }}>Education: </span>{member.education}
                </div>
              )}
            </div>
          )}

          {(member.skills || []).length > 0 && (
            <div style={{ marginBottom: '22px' }}>
              <div style={{
                fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
                color: theme.brassDark, marginBottom: '10px', fontWeight: '600'
              }}>Skills</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {member.skills.map(s => (
                  <span key={s} style={{
                    fontSize: '11.5px', fontWeight: '600', padding: '4px 10px', borderRadius: '5px',
                    background: theme.paper, border: `1px solid ${theme.line}`, color: theme.inkSoft
                  }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {member.contact_email && (
            <div style={{ borderTop: `1px solid ${theme.line}`, paddingTop: '20px' }}>
              <div style={{
                fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
                color: theme.brassDark, marginBottom: '10px', fontWeight: '600'
              }}>Contact</div>
              <a href={`mailto:${member.contact_email}`} style={{ fontSize: '14.5px', color: theme.ink, fontWeight: '600', textDecoration: 'none' }}>
                {member.contact_email}
              </a>
              {member.linkedin_url && (
                <div style={{ marginTop: '8px' }}>
                  <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13.5px', color: theme.brassDark, fontWeight: '600', textDecoration: 'none' }}>
                    LinkedIn / Portfolio ↗
                  </a>
                </div>
              )}
            </div>
          )}

          <ConnectSection member={member} />
        </div>
      </div>
    </div>
  )
}
