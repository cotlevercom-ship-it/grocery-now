'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, supabaseFetch, signOut, uploadImage } from '@/lib/supabase'
import { accountLightTheme as theme } from '@/lib/accountLightTheme'
import { IconUser, IconMail } from '@/components/ResumeIcons'

const accent = '#2563EB'

function ZigzagEdge({ fill }) {
  return (
    <svg viewBox="0 0 320 14" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '14px' }}>
      <path
        d="M0,0 L20,14 L40,0 L60,14 L80,0 L100,14 L120,0 L140,14 L160,0 L180,14 L200,0 L220,14 L240,0 L260,14 L280,0 L300,14 L320,0 L320,14 L0,14 Z"
        fill={fill}
      />
    </svg>
  )
}

function isFilled(v) {
  if (v === null || v === undefined) return false
  return String(v).trim().length > 0
}

function SectionLabel({ icon, children }) {
  return (
    <div style={{ margin: '0 0 16px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '9px',
        fontSize: '12px', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase',
        color: '#111827',
      }}>
        {icon && <span style={{ color: accent, display: 'flex' }}>{icon}</span>}
        {children}
      </div>
      <div style={{ height: '1px', background: '#E5E7EB', marginTop: '9px' }} />
    </div>
  )
}

const sectionBoxStyle = {
  background: '#FFFFFF', borderRadius: '14px', border: '1px solid #ECEDF0',
  boxShadow: '0 1px 2px rgba(16,24,40,0.04), 0 4px 14px rgba(16,24,40,0.05)',
  padding: '20px 20px 24px', marginTop: '16px',
}

function FieldLabel({ children }) {
  return <label style={{ fontSize: '11px', color: theme.inkSoft, display: 'block', marginBottom: '6px', letterSpacing: '0.03em' }}>{children}</label>
}

export default function AccountPage() {
  const router = useRouter()
  const [loaded, setLoaded] = useState(false)
  const nameInputRef = useRef(null)
  const [editingName, setEditingName] = useState(false)
  const [userId, setUserId] = useState(null)
  const [fullName, setFullName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    display_name: '', contact_email: '', linkedin_url: '',
    phone: '', location: '', bio: '',
  })
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [existingPhotoUrl, setExistingPhotoUrl] = useState('')

  const [premiumStatus, setPremiumStatus] = useState('none') // 'none' | 'pending' | 'active'
  const [bkashNumber, setBkashNumber] = useState('')
  const [txnNote, setTxnNote] = useState('')
  const [requestingPremium, setRequestingPremium] = useState(false)
  const [premiumError, setPremiumError] = useState('')

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleLogout = () => {
    signOut()
    router.push('/')
  }

  useEffect(() => {
    async function init() {
      const session = getSession()
      if (!session?.user?.id) {
        router.replace('/login?next=/account')
        return
      }
      setUserId(session.user.id)

      try {
        const profiles = await supabaseFetch(`user_profiles?select=full_name,phone&id=eq.${session.user.id}`)
        const up = profiles?.[0]
        setFullName(up?.full_name || '')
        setForm(prev => ({ ...prev, phone: up?.phone || '' }))
      } catch (e) { console.error(e) }

      try {
        const rows = await supabaseFetch(`member_profiles?select=*&user_id=eq.${session.user.id}`)
        const p = rows?.[0]
        if (p) {
          setForm(prev => ({
            ...prev,
            display_name: p.display_name || '',
            contact_email: p.contact_email || session.user.email || '',
            linkedin_url: p.linkedin_url || '',
            bio: p.bio || '',
            location: p.location || '',
          }))
          setExistingPhotoUrl(p.photo_url || '')
          setPremiumStatus(p.premium_status || 'none')
        } else {
          setForm(prev => ({ ...prev, contact_email: session.user.email || '' }))
        }
      } catch (e) { console.error(e) }

      try {
        const settings = await supabaseFetch(`app_settings?select=key,value&key=eq.bkash_payment_number`)
        setBkashNumber(settings?.[0]?.value || '')
      } catch (e) { console.error(e) }

      setLoaded(true)
    }
    init()
  }, [router])

  const handleSubmit = async () => {
    setError('')
    setSaved(false)
    if (!form.display_name.trim()) { setError('Enter your name (top of the page)'); return }
    if (!form.contact_email.trim()) { setError('Provide a contact email'); return }

    setSubmitting(true)
    try {
      let photo_url = existingPhotoUrl || null
      if (photoFile) {
        setUploading(true)
        try { photo_url = await uploadImage(photoFile, 'profiles') } catch (e) { console.error(e) }
        setUploading(false)
      }

      await Promise.all([
        supabaseFetch(`user_profiles?id=eq.${userId}`, {
          method: 'PATCH',
          body: JSON.stringify({ phone: form.phone.trim() || null }),
        }),
        supabaseFetch('member_profiles', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify({
            user_id: userId,
            display_name: form.display_name.trim(),
            contact_email: form.contact_email.trim(),
            linkedin_url: form.linkedin_url.trim() || null,
            bio: form.bio.trim() || null,
            location: form.location.trim() || null,
            photo_url,
            updated_at: new Date().toISOString(),
          }),
        }),
      ])
      setSaved(true)
      setExistingPhotoUrl(photo_url || '')
      setPhotoFile(null)
      window.dispatchEvent(new Event('member-profile-updated'))
    } catch (err) {
      console.error(err)
      setError('Failed to save, please try again')
    }
    setSubmitting(false)
  }

  const handleRequestPremium = async () => {
    setPremiumError('')
    setRequestingPremium(true)
    try {
      await supabaseFetch('member_profiles', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify({
          user_id: userId,
          premium_status: 'pending',
          premium_requested_at: new Date().toISOString(),
          premium_transaction_note: txnNote.trim() || null,
        }),
      })
      setPremiumStatus('pending')
    } catch (e) {
      console.error(e)
      setPremiumError('Could not submit your request, please try again.')
    }
    setRequestingPremium(false)
  }

  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', background: theme.paper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: theme.inkSoft, fontSize: '14px' }}>Loading...</div>
      </div>
    )
  }

  const initial = (form.display_name || fullName || '?').trim().charAt(0).toUpperCase()
  const displayedPhoto = photoPreview || existingPhotoUrl

  const allFields = [
    existingPhotoUrl || photoPreview, form.display_name, form.contact_email,
    form.phone, form.linkedin_url, form.location, form.bio,
  ]
  const totalFields = allFields.length
  const totalFilled = allFields.filter(isFilled).length
  const completionPct = Math.round((totalFilled / totalFields) * 100)

  const saveButtonLabel = () => {
    if (uploading) return 'Uploading photo...'
    if (submitting) return 'Saving...'
    return 'Save'
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.paper, paddingBottom: '48px' }}>
      <div style={{ background: `linear-gradient(155deg, ${theme.paper} 0%, ${theme.surface} 60%, ${theme.lineSoft} 100%)` }}>
        <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: '24px 18px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label style={{ position: 'relative', display: 'block', cursor: 'pointer', flexShrink: 0 }}>
              <div style={{
                width: '68px', height: '68px', borderRadius: '50%', background: accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                fontSize: '26px', fontWeight: '700', color: '#FFFFFF',
                border: '3px solid rgba(255,255,255,0.6)'
              }}>
                {displayedPhoto ? (
                  <img src={displayedPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : initial}
              </div>
              <span style={{
                position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', borderRadius: '50%',
                background: theme.paper, border: `2px solid ${theme.surface}`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '9px',
              }}>✏️</span>
              <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
            </label>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {editingName ? (
                  <input
                    ref={nameInputRef}
                    type="text" value={form.display_name} onChange={e => handleChange('display_name', e.target.value)}
                    onBlur={() => setEditingName(false)}
                    placeholder="Full name"
                    style={{
                      color: theme.ink, fontSize: '21px', fontWeight: '700', background: 'transparent',
                      border: 'none', borderBottom: `1px solid ${accent}`, outline: 'none', minWidth: 0, flex: 1,
                      fontFamily: 'inherit', padding: '0 0 2px',
                    }}
                  />
                ) : (
                  <div style={{
                    color: theme.ink, fontSize: '21px', fontWeight: '700', overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {form.display_name || 'Add your name'}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => { setEditingName(true); setTimeout(() => nameInputRef.current?.focus(), 0) }}
                  aria-label="Edit name"
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px',
                    borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.14)', color: theme.ink,
                    fontSize: '11px', cursor: 'pointer', flexShrink: 0,
                  }}
                >✏️</button>
              </div>
              {form.location && (
                <div style={{ fontSize: '13.5px', fontWeight: '600', color: accent, marginTop: '2px' }}>{form.location}</div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: '700', color: theme.inkSoft, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Profile Completion</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: accent }}>{completionPct}%</span>
            </div>
            <div style={{ width: '100%', height: '7px', borderRadius: '20px', background: 'rgba(255,255,255,0.18)', overflow: 'hidden' }}>
              <div style={{ width: `${completionPct}%`, height: '100%', borderRadius: '20px', background: accent, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </div>
        <ZigzagEdge fill={theme.paper} />
      </div>

      <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: '4px 16px 0' }}>

        <div style={sectionBoxStyle}>
          <SectionLabel icon={<IconMail />}>Contact & Basic Info</SectionLabel>

          <div style={{ marginBottom: '24px' }}>
            <FieldLabel>Contact Email *</FieldLabel>
            <input type="email" value={form.contact_email} onChange={e => handleChange('contact_email', e.target.value)} placeholder="you@example.com" className="ledger-input" />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <FieldLabel>Mobile Number</FieldLabel>
            <input type="tel" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="01XXXXXXXXX" className="ledger-input" style={{ fontFamily: theme.fontMono }} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <FieldLabel>Location</FieldLabel>
            <input type="text" value={form.location} onChange={e => handleChange('location', e.target.value)} placeholder="Dhaka" className="ledger-input" />
          </div>

          <div>
            <FieldLabel>LinkedIn Link</FieldLabel>
            <input type="text" value={form.linkedin_url} onChange={e => handleChange('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/yourname" className="ledger-input" />
          </div>
        </div>

        <div style={sectionBoxStyle}>
          <SectionLabel icon={<IconUser />}>About Me</SectionLabel>
          <div>
            <FieldLabel>Bio</FieldLabel>
            <textarea rows={4} value={form.bio} onChange={e => handleChange('bio', e.target.value)} placeholder="A short intro about yourself" className="ledger-input" style={{ resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
        </div>

        <div style={sectionBoxStyle}>
          <SectionLabel icon={<span>⭐</span>}>Premium Membership</SectionLabel>

          {premiumStatus === 'active' ? (
            <div style={{ padding: '12px 14px', background: theme.signalSoft, borderRadius: '8px', borderLeft: `3px solid ${theme.signal}` }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: theme.signal }}>✓ You&apos;re a Premium Member</div>
              <div style={{ fontSize: '12.5px', color: theme.inkSoft, marginTop: '4px' }}>
                You can reply to messages, comment on posts, and view full member profiles.
              </div>
            </div>
          ) : premiumStatus === 'pending' ? (
            <div style={{ padding: '12px 14px', background: theme.lineSoft, borderRadius: '8px', borderLeft: `3px solid ${accent}` }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: theme.ink }}>Request submitted</div>
              <div style={{ fontSize: '12.5px', color: theme.inkSoft, marginTop: '4px' }}>
                Your payment is under review. We&apos;ll activate Premium once it&apos;s confirmed.
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '13px', color: theme.inkSoft, lineHeight: '1.6', marginBottom: '14px' }}>
                Premium unlocks: replying in message threads, commenting on feed posts, and viewing other members&apos; full profiles.
              </div>
              {bkashNumber && (
                <div style={{ padding: '12px 14px', background: theme.lineSoft, borderRadius: '8px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '11.5px', color: theme.inkSoft, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Send bKash payment to</div>
                  <div style={{ fontSize: '17px', fontWeight: '700', color: theme.ink, fontFamily: theme.fontMono, marginTop: '3px' }}>{bkashNumber}</div>
                </div>
              )}
              <div style={{ marginBottom: '14px' }}>
                <FieldLabel>bKash Transaction ID (optional)</FieldLabel>
                <input type="text" value={txnNote} onChange={e => setTxnNote(e.target.value)} placeholder="e.g. 8N7A6XYZ12" className="ledger-input" />
              </div>
              <button
                type="button"
                onClick={handleRequestPremium}
                disabled={requestingPremium}
                style={{
                  display: 'block', width: '100%', background: requestingPremium ? theme.line : accent,
                  color: '#FFFFFF', padding: '12px', borderRadius: '8px', fontSize: '13.5px', fontWeight: '700',
                  border: 'none', cursor: requestingPremium ? 'default' : 'pointer',
                }}
              >{requestingPremium ? 'Submitting...' : "I've Paid — Request Activation"}</button>
              {premiumError && (
                <div style={{ marginTop: '10px', padding: '9px 12px', background: theme.dangerSoft, color: theme.danger, borderRadius: '4px', fontSize: '12.5px', borderLeft: `3px solid ${theme.danger}` }}>{premiumError}</div>
              )}
            </>
          )}
        </div>

        <div style={{ marginTop: '20px' }}>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              display: 'block', width: '100%', background: submitting ? theme.line : accent,
              color: '#FFFFFF', padding: '13px', borderRadius: '8px', fontSize: '14px', fontWeight: '700',
              border: 'none', letterSpacing: '0.02em', cursor: submitting ? 'default' : 'pointer',
            }}
          >{saveButtonLabel()}</button>
          {error && (
            <div style={{ marginTop: '10px', padding: '9px 12px', background: theme.dangerSoft, color: theme.danger, borderRadius: '4px', fontSize: '12.5px', borderLeft: `3px solid ${theme.danger}` }}>{error}</div>
          )}
          {saved && (
            <div style={{ marginTop: '10px', padding: '9px 12px', background: theme.signalSoft, color: theme.signal, borderRadius: '4px', fontSize: '12.5px', borderLeft: `3px solid ${theme.signal}` }}>✓ Saved</div>
          )}
        </div>

        <button onClick={handleLogout} style={{
          display: 'block', width: '100%', textAlign: 'center', background: 'transparent',
          color: theme.danger, padding: '13px', borderRadius: '4px', fontSize: '13.5px',
          fontWeight: '700', border: `1.5px dashed ${theme.danger}`, cursor: 'pointer',
          letterSpacing: '0.02em', marginTop: '18px'
        }}>Log Out</button>
      </div>

      <style jsx global>{`
        .ledger-input {
          width: 100%;
          padding: 2px 2px 8px;
          border: none;
          border-bottom: 1.5px solid ${theme.line};
          font-size: 15px;
          background: transparent;
          box-sizing: border-box;
          transition: border-color 0.15s;
          color: ${theme.ink};
          font-family: inherit;
        }
        .ledger-input:focus { outline: none; border-bottom: 1.5px solid ${accent}; }
        .ledger-input::placeholder { color: ${theme.inkSoft}; }
      `}</style>
    </div>
  )
}
