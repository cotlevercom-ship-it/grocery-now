'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch, uploadImage } from '@/lib/supabase'
import { accountLightTheme as theme } from '@/lib/accountLightTheme'
import { INDUSTRY_OPTIONS, STARTUP_STAGE_OPTIONS } from '@/lib/memberOptions'
import VerificationSection from '@/components/VerificationSection'

const COMMITMENT_OPTIONS = ['Full-time', 'Part-time', 'Still exploring']
const LOOKING_FOR_OPTIONS = ['Technical co-founder', 'Business co-founder', 'Marketing co-founder', 'Any co-founder']
const YEARS_EXPERIENCE_OPTIONS = ['0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years']
const FOUNDER_TYPE_OPTIONS = [
  { value: 'first_time', label: 'First-time founder' },
  { value: 'serial', label: 'Serial founder' },
]

function ChipPicker({ options, selected, onToggle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
      {options.map(o => {
        const isSel = selected.includes(o)
        return (
          <button
            key={o} type="button" onClick={() => onToggle(o)}
            style={{
              fontSize: '12.5px', fontWeight: '600', padding: '7px 13px', borderRadius: '20px',
              cursor: 'pointer', fontFamily: theme.fontBody,
              background: isSel ? theme.brass : theme.lineSoft,
              color: isSel ? '#FFFFFF' : theme.ink,
              border: 'none',
            }}
          >{o}</button>
        )
      })}
    </div>
  )
}

export default function CofounderProfilePage() {
  const router = useRouter()
  const [session, setSession] = useState(undefined)
  const [form, setForm] = useState({
    display_name: '', bio: '', contact_email: '', linkedin_url: '',
    industry: '', years_experience: '', founder_type: '', education: '',
    looking_for: '', commitment: '', startup_stage: '', interested_industry: [],
  })
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [existingPhotoUrl, setExistingPhotoUrl] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function init() {
      const s = getSession()
      if (!s?.user?.id) {
        router.replace('/login?next=/account/profile')
        return
      }
      setSession(s)
      try {
        const rows = await supabaseFetch(`member_profiles?select=*&user_id=eq.${s.user.id}`)
        const p = rows?.[0]
        if (p) {
          setForm({
            display_name: p.display_name || '', bio: p.bio || '',
            contact_email: p.contact_email || s.user.email || '', linkedin_url: p.linkedin_url || '',
            industry: p.industry || '', years_experience: p.years_experience || '',
            founder_type: p.founder_type || '', education: p.education || '',
            looking_for: p.looking_for || '', commitment: p.commitment || '',
            startup_stage: p.startup_stage || '', interested_industry: p.interested_industry || [],
          })
          setExistingPhotoUrl(p.photo_url || '')
        } else {
          setForm(prev => ({ ...prev, contact_email: s.user.email || '' }))
        }
      } catch (e) { console.error(e) }
      setLoaded(true)
    }
    init()
  }, [router])

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))
  const toggleIndustry = (v) => setForm(prev => ({
    ...prev,
    interested_industry: prev.interested_industry.includes(v)
      ? prev.interested_industry.filter(x => x !== v)
      : [...prev.interested_industry, v],
  }))

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

      await supabaseFetch('member_profiles', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify({
          user_id: session.user.id,
          display_name: form.display_name.trim(),
          bio: form.bio.trim() || null,
          contact_email: form.contact_email.trim(),
          linkedin_url: form.linkedin_url.trim() || null,
          industry: form.industry.trim() || null,
          years_experience: form.years_experience || null,
          founder_type: form.founder_type || null,
          education: form.education.trim() || null,
          looking_for: form.looking_for || null,
          commitment: form.commitment || null,
          startup_stage: form.startup_stage || null,
          interested_industry: form.interested_industry,
          photo_url,
          updated_at: new Date().toISOString(),
        }),
      })
      setSaved(true)
      setExistingPhotoUrl(photo_url || '')
      setPhotoFile(null)
    } catch (e) {
      console.error(e)
      setError('Could not save your profile')
    }
    setSubmitting(false)
  }

  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', background: theme.paper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: theme.inkSoft, fontSize: '14px' }}>Loading...</div>
      </div>
    )
  }

  const displayedPhoto = photoPreview || existingPhotoUrl
  const fieldLabel = { fontSize: '11px', color: theme.inkSoft, display: 'block', marginBottom: '6px', letterSpacing: '0.03em' }

  return (
    <div style={{ minHeight: '100vh', background: theme.paper, paddingBottom: '48px' }}>
      {/* Topbar */}
      <div style={{ background: theme.surface, padding: '16px', borderBottom: `1px solid ${theme.line}` }}>
        <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/account">
            <div style={{ color: theme.ink, fontSize: '21px', lineHeight: 1 }}>←</div>
          </Link>
          <div>
            <div style={{ color: theme.ink, fontSize: '15.5px', fontWeight: '700' }}>Co-founder Profile</div>
            <div style={{ color: theme.brass, fontSize: '11px', marginTop: '1px', letterSpacing: '0.03em' }}>What other founders see</div>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div style={{
            background: theme.surface, margin: '18px 16px 14px', borderRadius: '4px',
            border: `1px solid ${theme.line}`, padding: '22px 18px 6px'
          }}>
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '68px', height: '68px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                background: theme.brass, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {displayedPhoto ? (
                  <img src={displayedPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontFamily: theme.fontDisplay, fontSize: '24px', fontWeight: '600', color: '#FFFFFF' }}>
                    {(form.display_name || '?').trim().charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <label style={{
                display: 'inline-block', background: theme.paper, color: theme.ink, border: `1px solid ${theme.line}`,
                borderRadius: '6px', padding: '9px 14px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer'
              }}>
                {displayedPhoto ? 'Change photo' : 'Upload photo'}
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
              </label>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={fieldLabel}>Your Name *</label>
              <input type="text" value={form.display_name} onChange={e => handleChange('display_name', e.target.value)} placeholder="Full name" className="ledger-input" />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={fieldLabel}>Bio / Pitch</label>
              <textarea
                value={form.bio} onChange={e => handleChange('bio', e.target.value)}
                placeholder="A couple lines about yourself and what you're building"
                className="ledger-input" style={{ minHeight: '80px', resize: 'vertical', paddingTop: '6px' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={fieldLabel}>Industry</label>
              <input type="text" value={form.industry} onChange={e => handleChange('industry', e.target.value)} placeholder="e.g. Fintech, E-commerce" className="ledger-input" />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={fieldLabel}>Years of Experience</label>
              <select value={form.years_experience} onChange={e => handleChange('years_experience', e.target.value)} className="ledger-input ledger-select">
                <option value="">Select</option>
                {YEARS_EXPERIENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={fieldLabel}>Founder Type</label>
              <select value={form.founder_type} onChange={e => handleChange('founder_type', e.target.value)} className="ledger-input ledger-select">
                <option value="">Select</option>
                {FOUNDER_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={fieldLabel}>Education</label>
              <input type="text" value={form.education} onChange={e => handleChange('education', e.target.value)} placeholder="e.g. BSc CSE, BUET" className="ledger-input" />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={fieldLabel}>Looking For</label>
              <select value={form.looking_for} onChange={e => handleChange('looking_for', e.target.value)} className="ledger-input ledger-select">
                <option value="">Select</option>
                {LOOKING_FOR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={fieldLabel}>Commitment</label>
              <select value={form.commitment} onChange={e => handleChange('commitment', e.target.value)} className="ledger-input ledger-select">
                <option value="">Select</option>
                {COMMITMENT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={fieldLabel}>Startup Stage</label>
              <select value={form.startup_stage} onChange={e => handleChange('startup_stage', e.target.value)} className="ledger-input ledger-select">
                <option value="">Select</option>
                {STARTUP_STAGE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={fieldLabel}>Interested In (Industry)</label>
              <ChipPicker options={INDUSTRY_OPTIONS} selected={form.interested_industry} onToggle={toggleIndustry} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={fieldLabel}>Contact Email *</label>
              <input type="email" value={form.contact_email} onChange={e => handleChange('contact_email', e.target.value)} placeholder="you@example.com" className="ledger-input" />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={fieldLabel}>LinkedIn / Portfolio Link</label>
              <input type="text" value={form.linkedin_url} onChange={e => handleChange('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/yourname" className="ledger-input" />
            </div>
          </div>

          {error && (
            <div style={{
              margin: '0 16px 14px', padding: '11px 13px', background: theme.dangerSoft,
              color: theme.danger, borderRadius: '4px', fontSize: '13px', borderLeft: `3px solid ${theme.danger}`
            }}>{error}</div>
          )}

          {saved && (
            <div style={{
              margin: '0 16px 14px', padding: '11px 13px', background: theme.signalSoft,
              color: theme.signal, borderRadius: '4px', fontSize: '13px', borderLeft: `3px solid ${theme.signal}`
            }}>✓ Profile saved — visible to other founders now.</div>
          )}

          <div style={{ padding: '0 16px' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%', background: submitting ? theme.line : theme.brass, color: '#FFFFFF',
                padding: '14px', borderRadius: '4px', fontSize: '14.5px', fontWeight: '700',
                border: 'none', letterSpacing: '0.02em'
              }}>
              {uploading ? 'Uploading photo...' : submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>

        <div style={{ margin: '18px 16px 0' }}>
          <VerificationSection />
        </div>
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
        .ledger-select {
          padding-bottom: 6px;
        }
        .ledger-input:focus {
          outline: none;
          border-bottom: 1.5px solid ${theme.brass};
        }
        .ledger-input::placeholder {
          color: ${theme.inkSoft};
        }
      `}</style>
    </div>
  )
}
