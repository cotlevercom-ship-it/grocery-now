'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch, signOut, uploadImage } from '@/lib/supabase'
import { accountLightTheme as theme } from '@/lib/accountLightTheme'
import { SKILL_OPTIONS } from '@/lib/memberOptions'


const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say']

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
  if (Array.isArray(v)) return v.length > 0
  if (v === null || v === undefined) return false
  return String(v).trim().length > 0
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: '11px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase',
      color: theme.brass, margin: '0 0 14px'
    }}>{children}</div>
  )
}

const sectionBoxStyle = {
  background: theme.surface, borderRadius: '4px', border: `1px solid ${theme.line}`,
  padding: '18px 18px 22px', marginTop: '14px',
}

function FieldLabel({ children }) {
  return <label style={{ fontSize: '11px', color: theme.inkSoft, display: 'block', marginBottom: '6px', letterSpacing: '0.03em' }}>{children}</label>
}

function TagInput({ label, values, onChange, placeholder }) {
  const [draft, setDraft] = useState('')
  const addTag = () => {
    const v = draft.trim()
    if (!v) return
    if (!values.includes(v)) onChange([...values, v])
    setDraft('')
  }
  const removeTag = (v) => onChange(values.filter(x => x !== v))
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() }
  }
  return (
    <div style={{ marginBottom: '24px' }}>
      <FieldLabel>{label}</FieldLabel>
      {values.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '10px' }}>
          {values.map(v => (
            <span key={v} style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '12.5px', fontWeight: '600', padding: '6px 10px', borderRadius: '20px',
              background: theme.lineSoft, color: theme.ink, border: `1px solid ${theme.line}`
            }}>
              {v}
              <button type="button" onClick={() => removeTag(v)} style={{
                background: 'none', border: 'none', color: theme.inkSoft, cursor: 'pointer', fontSize: '13px', lineHeight: 1, padding: 0
              }}>×</button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} className="ledger-input" style={{ flex: 1 }} />
        <button type="button" onClick={addTag} style={{
          background: 'transparent', color: theme.brass, border: `1px solid ${theme.brass}`,
          borderRadius: '6px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer'
        }}>Add</button>
      </div>
    </div>
  )
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
  const [activeSection, setActiveSection] = useState(null)

  const [form, setForm] = useState({
    display_name: '', contact_email: '', linkedin_url: '',
    phone: '', location: '', gender: '', age: '',
    role_title: '', experience: '', interests: [], skills: [], languages: [],
  })
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [existingPhotoUrl, setExistingPhotoUrl] = useState('')

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))
  const toggleSkill = (s) => setForm(prev => ({ ...prev, skills: prev.skills.includes(s) ? prev.skills.filter(v => v !== s) : [...prev.skills, s] }))

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
            contact_email: p.contact_email || session.user.email || '', linkedin_url: p.linkedin_url || '',
            location: p.location || '', gender: p.gender || '', age: p.age != null ? String(p.age) : '',
            role_title: p.role_title || '', experience: p.experience || '',
            interests: p.interests || [], skills: p.skills || [], languages: p.languages || [],
          }))
          setExistingPhotoUrl(p.photo_url || '')
        } else {
          setForm(prev => ({ ...prev, contact_email: session.user.email || '' }))
        }
      } catch (e) { console.error(e) }

      setLoaded(true)
    }
    init()
  }, [router])

  const handleSubmit = async (sectionKey) => {
    setError('')
    setSaved(false)
    setActiveSection(sectionKey)
    if (!form.display_name.trim()) { setError('Enter your name (top of the page)'); return }
    if (!form.contact_email.trim()) { setError('Provide a contact email'); return }

    let ageValue = null
    if (form.age.trim()) {
      const n = parseInt(form.age, 10)
      if (Number.isNaN(n) || n < 16 || n > 100) { setError('Age must be between 16 and 100'); return }
      ageValue = n
    }

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
            location: form.location.trim() || null,
            gender: form.gender || null,
            age: ageValue,
            role_title: form.role_title.trim() || null,
            experience: form.experience.trim() || null,
            interests: form.interests,
            skills: form.skills,
            languages: form.languages,
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
    form.phone, form.location, form.gender, form.age,
    form.role_title, form.experience, form.interests, form.skills, form.languages,
    form.display_name, form.contact_email, form.linkedin_url,
  ]
  const totalFields = allFields.length
  const totalFilled = allFields.filter(isFilled).length
  const completionPct = Math.round((totalFilled / totalFields) * 100)

  const saveButtonLabel = (key) => {
    if (activeSection !== key) return 'Save'
    if (uploading) return 'Uploading photo...'
    if (submitting) return 'Saving...'
    return 'Save'
  }

  const SectionSaveButton = ({ sectionKey }) => (
    <div style={{ marginTop: '4px' }}>
      <button
        type="button"
        onClick={() => handleSubmit(sectionKey)}
        disabled={submitting}
        style={{
          display: 'inline-block', background: (submitting && activeSection === sectionKey) ? theme.line : theme.brass,
          color: '#FFFFFF', padding: '10px 20px', borderRadius: '4px', fontSize: '13px', fontWeight: '700',
          border: 'none', letterSpacing: '0.02em', cursor: 'pointer',
        }}
      >{saveButtonLabel(sectionKey)}</button>
      {activeSection === sectionKey && error && (
        <div style={{ marginTop: '10px', padding: '9px 12px', background: theme.dangerSoft, color: theme.danger, borderRadius: '4px', fontSize: '12.5px', borderLeft: `3px solid ${theme.danger}` }}>{error}</div>
      )}
      {activeSection === sectionKey && saved && (
        <div style={{ marginTop: '10px', padding: '9px 12px', background: theme.signalSoft, color: theme.signal, borderRadius: '4px', fontSize: '12.5px', borderLeft: `3px solid ${theme.signal}` }}>✓ Saved</div>
      )}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: theme.paper, paddingBottom: '48px' }}>
      {/* Passbook cover */}
      <div style={{ background: `linear-gradient(155deg, ${theme.paper} 0%, ${theme.surface} 60%, ${theme.lineSoft} 100%)` }}>
        <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '18px 18px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <label style={{ position: 'relative', display: 'block', cursor: 'pointer', flexShrink: 0 }}>
              <div style={{
                width: '54px', height: '54px', borderRadius: '50%', background: theme.brass,
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                fontSize: '22px', fontWeight: '700', color: '#FFFFFF',
                border: '2px solid rgba(255,255,255,0.25)'
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
            <div style={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {editingName ? (
                <input
                  ref={nameInputRef}
                  type="text" value={form.display_name} onChange={e => handleChange('display_name', e.target.value)}
                  onBlur={() => setEditingName(false)}
                  placeholder="Full name"
                  style={{
                    color: theme.ink, fontSize: '18px', fontWeight: '700', background: 'transparent',
                    border: 'none', borderBottom: `1px solid ${theme.brass}`, outline: 'none', minWidth: 0, flex: 1,
                    fontFamily: 'inherit', padding: '0 0 2px',
                  }}
                />
              ) : (
                <div style={{
                  color: theme.ink, fontSize: '18px', fontWeight: '700', overflow: 'hidden',
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
          </div>

          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: '700', color: theme.inkSoft, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Profile Completion</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: theme.brass }}>{completionPct}%</span>
            </div>
            <div style={{ width: '100%', height: '7px', borderRadius: '20px', background: 'rgba(255,255,255,0.18)', overflow: 'hidden' }}>
              <div style={{ width: `${completionPct}%`, height: '100%', borderRadius: '20px', background: theme.brass, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </div>
        <ZigzagEdge fill={theme.paper} />
      </div>

      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '4px 16px 0' }}>
        <div>
          <div style={{ ...sectionBoxStyle, marginTop: '10px' }}>
            <SectionLabel>Basic Info</SectionLabel>

            <div style={{ marginBottom: '24px' }}>
              <FieldLabel>Mobile Number</FieldLabel>
              <input type="tel" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="01XXXXXXXXX" className="ledger-input" style={{ fontFamily: theme.fontMono }} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <FieldLabel>Location</FieldLabel>
              <input type="text" value={form.location} onChange={e => handleChange('location', e.target.value)} placeholder="Dhaka" className="ledger-input" />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <FieldLabel>Gender</FieldLabel>
              <select value={form.gender} onChange={e => handleChange('gender', e.target.value)} className="ledger-input ledger-select">
                <option value="">Select</option>
                {GENDER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <FieldLabel>Age</FieldLabel>
              <input type="number" inputMode="numeric" min="16" max="100" value={form.age} onChange={e => handleChange('age', e.target.value)} placeholder="25" className="ledger-input" />
            </div>

            <SectionSaveButton sectionKey="basic" />
          </div>

          <div style={sectionBoxStyle}>
            <SectionLabel>Profession</SectionLabel>

            <div style={{ marginBottom: '24px' }}>
              <FieldLabel>Current Job / Role</FieldLabel>
              <input type="text" value={form.role_title} onChange={e => handleChange('role_title', e.target.value)} placeholder="e.g. Software Engineer at X" className="ledger-input" />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <FieldLabel>Experience</FieldLabel>
              <input type="text" value={form.experience} onChange={e => handleChange('experience', e.target.value)} placeholder="e.g. 5 years in fintech product management" className="ledger-input" />
            </div>

            <TagInput label="Interest" values={form.interests} onChange={v => handleChange('interests', v)} placeholder="e.g. Photography" />

            <div style={{ marginBottom: '24px' }}>
              <FieldLabel>Skill</FieldLabel>
              {form.skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '10px' }}>
                  {form.skills.map(s => (
                    <span key={s} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      fontSize: '12.5px', fontWeight: '600', padding: '6px 10px', borderRadius: '20px',
                      background: theme.lineSoft, color: theme.ink, border: `1px solid ${theme.line}`
                    }}>
                      {s}
                      <button type="button" onClick={() => toggleSkill(s)} style={{ background: 'none', border: 'none', color: theme.inkSoft, cursor: 'pointer', fontSize: '13px', lineHeight: 1, padding: 0 }}>×</button>
                    </span>
                  ))}
                </div>
              )}
              <select value="" onChange={(e) => { if (e.target.value) toggleSkill(e.target.value) }} className="ledger-input ledger-select">
                <option value="">Select a skill to add</option>
                {SKILL_OPTIONS.filter(s => !form.skills.includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <TagInput label="Language" values={form.languages} onChange={v => handleChange('languages', v)} placeholder="e.g. Bangla, English" />

            <SectionSaveButton sectionKey="profession" />
          </div>

          <div style={sectionBoxStyle}>
            <SectionLabel>Contact</SectionLabel>

            <div style={{ marginBottom: '24px' }}>
              <FieldLabel>Contact Email *</FieldLabel>
              <input type="email" value={form.contact_email} onChange={e => handleChange('contact_email', e.target.value)} placeholder="you@example.com" className="ledger-input" />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <FieldLabel>LinkedIn / Portfolio Link</FieldLabel>
              <input type="text" value={form.linkedin_url} onChange={e => handleChange('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/yourname" className="ledger-input" />
            </div>

            <SectionSaveButton sectionKey="contact" />
          </div>
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
        .ledger-select { padding-bottom: 6px; }
        .ledger-input:focus { outline: none; border-bottom: 1.5px solid ${theme.brass}; }
        .ledger-input::placeholder { color: ${theme.inkSoft}; }
      `}</style>
    </div>
  )
}
