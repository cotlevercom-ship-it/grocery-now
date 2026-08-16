'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch, uploadImage } from '@/lib/supabase'
import { theme } from '@/lib/theme'

const COMMITMENT_OPTIONS = ['Full-time', 'Part-time', 'Still exploring']
const LOOKING_FOR_OPTIONS = ['Technical co-founder', 'Business co-founder', 'Marketing co-founder', 'Any co-founder']

export default function MemberProfileFormPage() {
  const router = useRouter()
  const [session, setSession] = useState(undefined)
  const [form, setForm] = useState({
    display_name: '', role_title: '', skills: '', experience: '',
    looking_for: '', commitment: '', bio: '', location: '', contact_email: '',
  })
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [existingPhotoUrl, setExistingPhotoUrl] = useState('')
  const [approvalStatus, setApprovalStatus] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function init() {
      const s = getSession()
      setSession(s)
      if (!s?.user?.id) { setLoaded(true); return }
      try {
        const rows = await supabaseFetch(`member_profiles?select=*&user_id=eq.${s.user.id}`)
        const p = rows?.[0]
        if (p) {
          setForm({
            display_name: p.display_name || '', role_title: p.role_title || '',
            skills: (p.skills || []).join(', '), experience: p.experience || '',
            looking_for: p.looking_for || '', commitment: p.commitment || '',
            bio: p.bio || '', location: p.location || '',
            contact_email: p.contact_email || s.user.email || '',
          })
          setExistingPhotoUrl(p.photo_url || '')
          setApprovalStatus(p.approval_status || null)
        } else {
          setForm(prev => ({ ...prev, contact_email: s.user.email || '' }))
        }
      } catch (e) { console.error(e) }
      setLoaded(true)
    }
    init()
  }, [])

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaved(false)
    if (!form.display_name.trim()) { setError('Enter your name'); return }
    if (!form.contact_email.trim()) { setError('Provide a contact email'); return }

    setSubmitting(true)
    try {
      let photo_url = existingPhotoUrl || null
      if (photoFile) {
        setUploading(true)
        try {
          photo_url = await uploadImage(photoFile, 'profiles')
        } catch (e) { console.error(e) }
        setUploading(false)
      }

      const payload = {
        user_id: session.user.id,
        display_name: form.display_name.trim(),
        role_title: form.role_title.trim() || null,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        experience: form.experience.trim() || null,
        looking_for: form.looking_for || null,
        commitment: form.commitment || null,
        bio: form.bio.trim() || null,
        location: form.location.trim() || null,
        contact_email: form.contact_email.trim(),
        photo_url,
        updated_at: new Date().toISOString(),
      }
      // Resubmit a previously-rejected profile for review; leave approved/pending profiles as-is
      // (edits to an already-approved profile stay live without forcing re-review).
      if (approvalStatus === 'rejected') payload.approval_status = 'pending'

      const rows = await supabaseFetch('member_profiles', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(payload),
      })
      setApprovalStatus(rows?.[0]?.approval_status || 'pending')
      setSaved(true)
      setExistingPhotoUrl(photo_url || '')
      setPhotoFile(null)
    } catch (e) {
      console.error(e)
      setError('Could not save your profile')
    }
    setSubmitting(false)
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: '8px',
    border: `1px solid ${theme.line}`, fontSize: '14.5px', boxSizing: 'border-box',
    fontFamily: theme.fontBody, background: theme.surface, color: theme.ink,
  }
  const labelStyle = { fontSize: '12.5px', color: theme.inkSoft, display: 'block', marginBottom: '6px', fontWeight: '600' }

  if (session === undefined || !loaded) return null

  if (session === null) {
    return (
      <div style={{ background: theme.paper, minHeight: '60vh', padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: theme.inkSoft, marginBottom: '18px', fontSize: '15px' }}>Log in to create your co-founder profile</p>
        <Link href="/login" style={{
          display: 'inline-block', background: theme.brass, color: 'white',
          borderRadius: '8px', padding: '12px 24px', fontSize: '14.5px', fontWeight: '600', textDecoration: 'none'
        }}>Log In</Link>
      </div>
    )
  }

  const displayedPhoto = photoPreview || existingPhotoUrl

  return (
    <div style={{ background: theme.paper, minHeight: '70vh' }}>
      <div style={{ maxWidth: '620px', margin: '0 auto', padding: 'clamp(20px,4vw,48px) clamp(16px,3vw,24px)' }}>
        <Link href="/members" style={{ fontSize: '13px', color: theme.inkSoft, textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>← Browse co-founders</Link>

        <div style={{
          fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
          color: theme.brassDark, marginBottom: '10px', fontWeight: '600'
        }}>Co-founder Profile</div>
        <h1 style={{ fontFamily: theme.fontDisplay, fontSize: 'clamp(22px,2.8vw,30px)', fontWeight: '600', color: theme.ink, marginBottom: '8px' }}>
          {existingPhotoUrl || form.display_name ? 'Edit Your Profile' : 'Create Your Profile'}
        </h1>
        <p style={{ fontSize: '14px', color: theme.inkSoft, marginBottom: '28px' }}>
          This is what other founders see when they browse for a co-founder.
        </p>

        {error && (
          <div style={{ marginBottom: '16px', padding: '11px 14px', background: theme.dangerSoft, color: theme.danger, borderRadius: '8px', fontSize: '13.5px' }}>
            {error}
          </div>
        )}
        {saved && (
          <div style={{ marginBottom: '16px', padding: '11px 14px', background: theme.signalSoft, color: theme.signal, borderRadius: '8px', fontSize: '13.5px' }}>
            {approvalStatus === 'approved'
              ? '✓ Profile saved — visible to other founders now.'
              : '✓ Profile saved — pending review. It\'ll appear in the directory once approved.'}
          </div>
        )}
        {!saved && approvalStatus === 'pending' && (
          <div style={{ marginBottom: '16px', padding: '11px 14px', background: theme.surface, border: `1px solid ${theme.line}`, color: theme.inkSoft, borderRadius: '8px', fontSize: '13.5px' }}>
            ⏳ Your profile is pending review and not yet visible in the directory.
          </div>
        )}
        {!saved && approvalStatus === 'rejected' && (
          <div style={{ marginBottom: '16px', padding: '11px 14px', background: theme.dangerSoft, color: theme.danger, borderRadius: '8px', fontSize: '13.5px' }}>
            Your profile wasn't approved. You can edit and resubmit it below.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: theme.surface, borderRadius: '12px', border: `1px solid ${theme.line}`, padding: 'clamp(20px,3vw,28px)' }}>
          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Photo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '84px', height: '84px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                background: theme.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {displayedPhoto ? (
                  <img src={displayedPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontFamily: theme.fontDisplay, fontSize: '28px', fontWeight: '600', color: theme.paper }}>
                    {(form.display_name || '?').trim().charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <label style={{
                display: 'inline-block', background: theme.paper, color: theme.ink, border: `1px solid ${theme.line}`,
                borderRadius: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
              }}>
                {displayedPhoto ? 'Change photo' : 'Upload photo'}
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Your Name *</label>
            <input style={inputStyle} value={form.display_name} onChange={e => handleChange('display_name', e.target.value)} placeholder="Full name" />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Current Role</label>
            <input style={inputStyle} value={form.role_title} onChange={e => handleChange('role_title', e.target.value)} placeholder="e.g. Software Engineer at X, or Full-time founder" />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Skills (comma separated)</label>
            <input style={inputStyle} value={form.skills} onChange={e => handleChange('skills', e.target.value)} placeholder="e.g. Marketing, Backend Dev, Sales" />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Experience</label>
            <input style={inputStyle} value={form.experience} onChange={e => handleChange('experience', e.target.value)} placeholder="e.g. 5 years in fintech product management" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
            <div>
              <label style={labelStyle}>Looking For</label>
              <select style={inputStyle} value={form.looking_for} onChange={e => handleChange('looking_for', e.target.value)}>
                <option value="">Select</option>
                {LOOKING_FOR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Commitment</label>
              <select style={inputStyle} value={form.commitment} onChange={e => handleChange('commitment', e.target.value)}>
                <option value="">Select</option>
                {COMMITMENT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Bio / Pitch</label>
            <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} value={form.bio} onChange={e => handleChange('bio', e.target.value)} placeholder="A couple lines about yourself and what you're building" />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Location</label>
            <input style={inputStyle} value={form.location} onChange={e => handleChange('location', e.target.value)} placeholder="Dhaka" />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Contact Email *</label>
            <input style={inputStyle} value={form.contact_email} onChange={e => handleChange('contact_email', e.target.value)} placeholder="you@example.com" />
          </div>

          <button type="submit" disabled={submitting} style={{
            width: '100%', background: submitting ? '#B8B2A0' : theme.brass, color: 'white',
            borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: '600', border: 'none', fontFamily: theme.fontBody
          }}>
            {uploading ? 'Uploading photo...' : submitting ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
