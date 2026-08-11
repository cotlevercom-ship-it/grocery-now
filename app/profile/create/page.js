'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, supabaseFetch, uploadImage } from '@/lib/supabase'
import AgreementCheckbox from '@/components/AgreementCheckbox'

const STAGES = [
  { value: 'idea', label: 'Just an idea' },
  { value: 'mvp', label: 'Building an MVP' },
  { value: 'early-revenue', label: 'Early revenue' },
  { value: 'scaling', label: 'Scaling' },
]
const COMMITMENTS = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
]

const emptyForm = {
  full_name: '', headline: '', bio: '', location: '', image_url: '',
  skills: '', looking_for: '', industries: '', commitment: 'full-time', stage: 'idea',
  linkedin_url: '', portfolio_url: '', whatsapp_number: '', contact_email: '',
}

const toArray = (s) => s.split(',').map(x => x.trim()).filter(Boolean)
const toCsv = (arr) => (arr || []).join(', ')

export default function CreateFounderProfilePage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  useEffect(() => {
    async function init() {
      const session = getSession()
      if (!session?.user) {
        router.replace('/login?next=/profile/create')
        return
      }
      try {
        const rows = await supabaseFetch(`founder_profiles?select=*&owner_id=eq.${session.user.id}`)
        if (rows && rows.length > 0) {
          const p = rows[0]
          setEditingId(p.id)
          setForm({
            full_name: p.full_name || '',
            headline: p.headline || '',
            bio: p.bio || '',
            location: p.location || '',
            image_url: p.image_url || '',
            skills: toCsv(p.skills),
            looking_for: toCsv(p.looking_for),
            industries: toCsv(p.industries),
            commitment: p.commitment || 'full-time',
            stage: p.stage || 'idea',
            linkedin_url: p.linkedin_url || '',
            portfolio_url: p.portfolio_url || '',
            whatsapp_number: p.whatsapp_number || '',
            contact_email: p.contact_email || session.user.email || '',
          })
        } else {
          setForm(f => ({ ...f, contact_email: session.user.email || '' }))
        }
      } catch (e) {
        console.error(e)
      }
      setChecking(false)
    }
    init()
  }, [router])

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const url = await uploadImage(file, 'founders')
      set('image_url', url)
    } catch (err) {
      console.error(err)
      setError('Image upload failed. Please try again.')
    }
    setUploading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.full_name.trim()) { setError('Please enter your name'); return }
    if (!form.headline.trim()) { setError('Please enter a short headline'); return }
    if (!form.whatsapp_number.trim() && !form.contact_email.trim()) {
      setError('Please add a WhatsApp number or an email so people can reach you'); return
    }
    if (!editingId && !agreedToTerms) {
      setError('Please agree to the Founder Profile Agreement to continue'); return
    }

    setSaving(true)
    try {
      const session = getSession()
      const payload = {
        owner_id: session.user.id,
        full_name: form.full_name.trim(),
        headline: form.headline.trim(),
        bio: form.bio.trim() || null,
        location: form.location.trim() || null,
        image_url: form.image_url || null,
        skills: toArray(form.skills),
        looking_for: toArray(form.looking_for),
        industries: toArray(form.industries),
        commitment: form.commitment,
        stage: form.stage,
        linkedin_url: form.linkedin_url.trim() || null,
        portfolio_url: form.portfolio_url.trim() || null,
        whatsapp_number: form.whatsapp_number.trim() || null,
        contact_email: form.contact_email.trim() || null,
        is_active: true,
      }

      if (editingId) {
        await supabaseFetch(`founder_profiles?id=eq.${editingId}`, {
          method: 'PATCH', body: JSON.stringify(payload),
        })
      } else {
        await supabaseFetch('founder_profiles', {
          method: 'POST', body: JSON.stringify(payload),
        })
      }
      router.push('/account')
    } catch (err) {
      console.error(err)
      setError('Failed to save your profile. Please try again.')
    }
    setSaving(false)
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit'
  }
  const labelStyle = { fontSize: '12.5px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '5px' }

  if (checking) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '14px' }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '28px 16px 60px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0a0a0a', marginBottom: '4px' }}>
        {editingId ? 'Edit Your Profile' : 'Create Your Founder Profile'}
      </h1>
      <p style={{ color: '#888', fontSize: '13.5px', marginBottom: '24px' }}>
        This is what other founders will see. Be specific about what you're building and what you need.
      </p>

      {error && (
        <div style={{ marginBottom: '16px', padding: '10px 12px', background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', background: '#f0f0ee',
            border: '1px solid #e0e0e0', overflow: 'hidden', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#ccc'
          }}>
            {form.image_url ? (
              <img src={form.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : '👤'}
          </div>
          <label style={{
            fontSize: '13px', fontWeight: '600', color: '#0a0a0a', cursor: 'pointer',
            border: '1.5px solid #0a0a0a', borderRadius: '8px', padding: '8px 14px'
          }}>
            {uploading ? 'Uploading...' : 'Upload Photo'}
            <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} style={{ display: 'none' }} />
          </label>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Full Name *</label>
          <input style={inputStyle} value={form.full_name} onChange={e => set('full_name', e.target.value)} />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Headline *</label>
          <input style={inputStyle} value={form.headline} onChange={e => set('headline', e.target.value)}
            placeholder="e.g. Building a fintech startup, looking for a technical co-founder" />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>About You</label>
          <textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={form.bio}
            onChange={e => set('bio', e.target.value)}
            placeholder="Your background, what you've built before, what you're working on now..." />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Location</label>
          <input style={inputStyle} value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Dhaka, Bangladesh" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div>
            <label style={labelStyle}>Stage</label>
            <select style={{ ...inputStyle, background: 'white' }} value={form.stage} onChange={e => set('stage', e.target.value)}>
              {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Commitment</label>
            <select style={{ ...inputStyle, background: 'white' }} value={form.commitment} onChange={e => set('commitment', e.target.value)}>
              {COMMITMENTS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Your Skills (comma separated)</label>
          <input style={inputStyle} value={form.skills} onChange={e => set('skills', e.target.value)} placeholder="e.g. Product, Marketing, Sales" />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Looking For (comma separated)</label>
          <input style={inputStyle} value={form.looking_for} onChange={e => set('looking_for', e.target.value)} placeholder="e.g. Technical Co-founder, Backend Engineer" />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Industries (comma separated)</label>
          <input style={inputStyle} value={form.industries} onChange={e => set('industries', e.target.value)} placeholder="e.g. Fintech, E-commerce" />
        </div>

        <div style={{ marginBottom: '6px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#0a0a0a' }}>Contact</div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '2px', marginBottom: '10px' }}>
            Other founders will use this to reach you directly — add at least one.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div>
            <label style={labelStyle}>WhatsApp Number</label>
            <input style={inputStyle} value={form.whatsapp_number} onChange={e => set('whatsapp_number', e.target.value)} placeholder="e.g. 8801712345678" />
          </div>
          <div>
            <label style={labelStyle}>Contact Email</label>
            <input type="email" style={inputStyle} value={form.contact_email} onChange={e => set('contact_email', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <div>
            <label style={labelStyle}>LinkedIn URL</label>
            <input style={inputStyle} value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <label style={labelStyle}>Portfolio / Website</label>
            <input style={inputStyle} value={form.portfolio_url} onChange={e => set('portfolio_url', e.target.value)} placeholder="https://..." />
          </div>
        </div>

        {!editingId && (
          <div style={{ marginBottom: '18px' }}>
            <AgreementCheckbox type="founder" checked={agreedToTerms} onChange={setAgreedToTerms} />
          </div>
        )}

        <button type="submit" disabled={saving || uploading} style={{
          background: saving ? '#9ca3af' : '#f4a300', color: '#0a0a0a', border: 'none',
          borderRadius: '10px', padding: '13px 24px', fontSize: '15px', fontWeight: '800', width: '100%'
        }}>
          {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Publish My Profile'}
        </button>
      </form>
    </div>
  )
}
