'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch, getSession } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import VerifiedBadge from '@/components/VerifiedBadge'

const DOC_TYPES = [
  { value: 'nid', label: 'National ID (NID)' },
  { value: 'passport', label: 'Passport' },
  { value: 'trade_license', label: 'Trade License' },
  { value: 'birth_certificate', label: 'Birth Certificate' },
  { value: 'other', label: 'Other' },
]

export default function VerificationSection() {
  const session = getSession()
  const myUserId = session?.user?.id || null

  const [isVerified, setIsVerified] = useState(false)
  const [request, setRequest] = useState(null) // latest verification_requests row, or null
  const [loading, setLoading] = useState(true)
  const [docType, setDocType] = useState('nid')
  const [docNumber, setDocNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      if (!myUserId) { setLoading(false); return }
      try {
        const [profileRows, reqRows] = await Promise.all([
          supabaseFetch(`member_profiles?select=verified&user_id=eq.${myUserId}`),
          supabaseFetch(`verification_requests?select=*&user_id=eq.${myUserId}&order=created_at.desc&limit=1`),
        ])
        setIsVerified(!!profileRows?.[0]?.verified)
        setRequest(reqRows?.[0] || null)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [myUserId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!docNumber.trim()) { setError('Enter your document number'); return }

    setSubmitting(true)
    try {
      const rows = await supabaseFetch('verification_requests', {
        method: 'POST',
        body: JSON.stringify({
          user_id: myUserId,
          doc_type: docType,
          doc_number: docNumber.trim(),
        }),
      })
      setRequest(rows?.[0] || null)
      setDocNumber('')
    } catch (e) {
      console.error(e)
      setError('Could not submit — try again')
    }
    setSubmitting(false)
  }

  if (!myUserId || loading) return null

  const labelStyle = { fontSize: '12.5px', color: theme.inkSoft, display: 'block', marginBottom: '6px', fontWeight: '600' }
  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: '8px',
    border: `1px solid ${theme.line}`, fontSize: '14.5px', boxSizing: 'border-box',
    fontFamily: theme.fontBody, background: theme.paper, color: theme.ink,
  }

  return (
    <div style={{
      marginTop: '22px', background: theme.surface, borderRadius: '12px',
      border: `1px solid ${theme.line}`, padding: 'clamp(20px,3vw,28px)',
    }}>
      <div style={{
        fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
        color: theme.brassDark, marginBottom: '10px', fontWeight: '600'
      }}>Verification</div>

      {isVerified ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.signal, fontSize: '14.5px', fontWeight: '600' }}>
          <VerifiedBadge size={18} /> You&apos;re verified — the badge shows on your profile.
        </div>
      ) : request?.status === 'pending' ? (
        <div style={{ fontSize: '13.5px', color: theme.inkSoft }}>
          ⏳ Your verification request is pending review by our team.
        </div>
      ) : (
        <>
          <p style={{ fontSize: '13.5px', color: theme.inkSoft, marginBottom: '18px', lineHeight: '1.6' }}>
            Apply for the verified badge by submitting a valid document type and number. Our team reviews it and grants the badge — this has nothing to do with your subscription.
          </p>
          {request?.status === 'rejected' && (
            <div style={{ marginBottom: '16px', padding: '11px 14px', background: theme.dangerSoft, color: theme.danger, borderRadius: '8px', fontSize: '13.5px' }}>
              Your last request wasn&apos;t approved{request.admin_note ? `: ${request.admin_note}` : '.'} You can submit again below.
            </div>
          )}
          {error && (
            <div style={{ marginBottom: '16px', padding: '11px 14px', background: theme.dangerSoft, color: theme.danger, borderRadius: '8px', fontSize: '13.5px' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
              <div>
                <label style={labelStyle}>Document Type</label>
                <select style={inputStyle} value={docType} onChange={e => setDocType(e.target.value)}>
                  {DOC_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Document Number</label>
                <input style={inputStyle} value={docNumber} onChange={e => setDocNumber(e.target.value)} placeholder="e.g. 1990123456789" />
              </div>
            </div>
            <button type="submit" disabled={submitting} style={{
              width: '100%', background: submitting ? '#B8B2A0' : theme.signal, color: 'white',
              borderRadius: '8px', padding: '13px', fontSize: '14.5px', fontWeight: '600', border: 'none', fontFamily: theme.fontBody
            }}>
              {submitting ? 'Submitting...' : 'Apply for Verification'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
