'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch, signOut, uploadImage } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import { sc } from '@/lib/memberTheme'
import AppSidebar from '@/components/AppSidebar'
import AppBottomNav from '@/components/AppBottomNav'
import VerifiedBadge from '@/components/VerifiedBadge'

function Card({ title, children, style }) {
  return (
    <div style={{ background: sc.cardBg, borderRadius: '14px', boxShadow: sc.shadow, padding: '20px', ...style }}>
      {title && <h2 style={{ fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: '15px', color: sc.text, marginBottom: '14px' }}>{title}</h2>}
      {children}
    </div>
  )
}

function FieldLabel({ children }) {
  return <label style={{ fontSize: '11.5px', color: sc.textSoft, display: 'block', marginBottom: '6px' }}>{children}</label>
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box', border: `1px solid ${sc.line}`, borderRadius: '9px',
  padding: '10px 12px', fontSize: '13.5px', fontFamily: theme.fontBody, color: sc.text, background: sc.bg,
}

function Toggle({ on, onChange, disabled }) {
  return (
    <button type="button" onClick={() => !disabled && onChange(!on)} disabled={disabled} aria-pressed={on} style={{
      width: '42px', height: '24px', borderRadius: '999px', border: 'none', flexShrink: 0, position: 'relative',
      background: disabled ? sc.line : (on ? theme.brass : '#D8DADD'), cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.6 : 1, transition: 'background 0.15s',
    }}>
      <span style={{
        position: 'absolute', top: '3px', left: on ? '21px' : '3px', width: '18px', height: '18px',
        borderRadius: '50%', background: '#FFFFFF', transition: 'left 0.15s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

function StatCard({ icon, iconBg, value, label, href }) {
  const body = (
    <div style={{ background: sc.cardBg, borderRadius: '12px', boxShadow: sc.shadow, padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', flexShrink: 0 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '19px', fontWeight: '800', color: sc.text, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '11.5px', color: sc.textSoft, marginTop: '2px' }}>{label}</div>
      </div>
    </div>
  )
  return href ? <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>{body}</Link> : body
}

function timeLabel(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AccountPage() {
  const router = useRouter()
  const [loaded, setLoaded] = useState(false)
  const nameInputRef = useRef(null)
  const [editingName, setEditingName] = useState(false)
  const [userId, setUserId] = useState(null)
  const [userEmail, setUserEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [prefSaving, setPrefSaving] = useState(false)

  const [form, setForm] = useState({
    display_name: '', role_title: '', contact_email: '', linkedin_url: '',
    location: '', bio: '', skills: '', interests: '', languages: '', looking_for: '', commitment: '',
  })
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [existingPhotoUrl, setExistingPhotoUrl] = useState('')

  const [meta, setMeta] = useState({ createdAt: null, verified: false, isDiscoverable: true, showActive: true, notifyEmail: true, notifyPush: true, viewCount: 0 })
  const [phone, setPhone] = useState('')
  const [premiumStatus, setPremiumStatus] = useState('none')
  const [counts, setCounts] = useState({ connections: 0, requests: 0, bookmarks: 0 })

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

  const loadCounts = useCallback(async (uid) => {
    try {
      const [conns, reqs, marks] = await Promise.all([
        supabaseFetch(`connections?select=id&status=eq.accepted&or=(requester_id.eq.${uid},addressee_id.eq.${uid})`),
        supabaseFetch(`connections?select=id&status=eq.pending&addressee_id=eq.${uid}`),
        supabaseFetch(`bookmarks?select=id&user_id=eq.${uid}`),
      ])
      setCounts({ connections: (conns || []).length, requests: (reqs || []).length, bookmarks: (marks || []).length })
    } catch (e) { console.error(e) }
  }, [])

  useEffect(() => {
    async function init() {
      const session = getSession()
      if (!session?.user?.id) {
        router.replace('/login?next=/account')
        return
      }
      setUserId(session.user.id)
      setUserEmail(session.user.email || '')

      let signupFullName = ''
      try {
        const uRows = await supabaseFetch(`user_profiles?select=phone,full_name&id=eq.${session.user.id}`)
        setPhone(uRows?.[0]?.phone || '')
        signupFullName = uRows?.[0]?.full_name || ''
      } catch (e) { console.error(e) }

      try {
        const rows = await supabaseFetch(`member_profiles?select=*&user_id=eq.${session.user.id}`)
        const p = rows?.[0]
        if (p) {
          setForm(prev => ({
            ...prev,
            display_name: p.display_name || '',
            role_title: p.role_title || '',
            contact_email: p.contact_email || session.user.email || '',
            linkedin_url: p.linkedin_url || '',
            bio: p.bio || '',
            location: p.location || '',
            skills: (p.skills || []).join(', '),
            interests: (p.interests || []).join(', '),
            languages: (p.languages || []).join(', '),
            looking_for: p.looking_for || '',
            commitment: p.commitment || '',
          }))
          setExistingPhotoUrl(p.photo_url || '')
          setPremiumStatus(p.premium_status || 'none')
          setMeta({
            createdAt: p.created_at, verified: !!p.verified,
            isDiscoverable: p.is_discoverable !== false, showActive: p.show_active_status !== false,
            notifyEmail: p.notify_email !== false, notifyPush: p.notify_push !== false,
            viewCount: p.profile_view_count || 0,
          })
        } else {
          setForm(prev => ({ ...prev, display_name: signupFullName || '', contact_email: session.user.email || '' }))
        }
      } catch (e) { console.error(e) }

      await loadCounts(session.user.id)
      setLoaded(true)
    }
    init()
  }, [router, loadCounts])

  const parseList = (str) => str.split(',').map(s => s.trim()).filter(Boolean)

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

      await supabaseFetch('member_profiles', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify({
          user_id: userId,
          display_name: form.display_name.trim(),
          role_title: form.role_title.trim() || null,
          contact_email: form.contact_email.trim(),
          linkedin_url: form.linkedin_url.trim() || null,
          bio: form.bio.trim() || null,
          location: form.location.trim() || null,
          skills: parseList(form.skills),
          interests: parseList(form.interests),
          languages: parseList(form.languages),
          looking_for: form.looking_for.trim() || null,
          commitment: form.commitment.trim() || null,
          photo_url,
          updated_at: new Date().toISOString(),
        }),
      })
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

  const savePref = async (field, value) => {
    setPrefSaving(true)
    try {
      await supabaseFetch(`member_profiles?user_id=eq.${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ [field]: value }),
      })
    } catch (e) { console.error(e) }
    setPrefSaving(false)
  }

  if (!loaded) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: sc.bg }}>
        <AppSidebar active="profile" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: sc.textSoft, fontSize: '14px' }}>Loading…</div>
      </div>
    )
  }

  const initial = (form.display_name || '?').trim().charAt(0).toUpperCase()
  const displayedPhoto = photoPreview || existingPhotoUrl
  const shortId = userId ? userId.split('-')[0].toUpperCase() : ''
  const planLabel = premiumStatus === 'active' ? 'Pro' : premiumStatus === 'pending' ? 'Pending' : 'Free'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: sc.bg }}>
      <AppSidebar active="profile" />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(20px,3vw,32px) clamp(16px,3vw,24px) 70px' }}>

          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontFamily: theme.fontDisplay, fontWeight: '700', fontSize: '26px', color: sc.text, marginBottom: '4px' }}>My Account</h1>
            <p style={{ fontSize: '13.5px', color: sc.textSoft }}>Manage your profile, preferences and account settings.</p>
          </div>

          {/* Profile header card */}
          <Card style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
              <label style={{ position: 'relative', display: 'block', cursor: 'pointer', flexShrink: 0 }}>
                <div style={{
                  width: '84px', height: '84px', borderRadius: '50%', background: theme.brass,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                  fontSize: '30px', fontWeight: '700', color: '#FFFFFF',
                }}>
                  {displayedPhoto ? <img src={displayedPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initial}
                </div>
                <span style={{
                  position: 'absolute', bottom: '-2px', right: '-2px', width: '24px', height: '24px', borderRadius: '50%',
                  background: sc.cardBg, border: `2px solid ${sc.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px',
                }}>✏️</span>
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
              </label>

              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {editingName ? (
                    <input
                      ref={nameInputRef} type="text" value={form.display_name} onChange={e => handleChange('display_name', e.target.value)}
                      onBlur={() => setEditingName(false)} placeholder="Full name"
                      style={{ fontSize: '19px', fontWeight: '700', color: sc.text, background: 'transparent', border: 'none', borderBottom: `1px solid ${theme.brass}`, outline: 'none', fontFamily: 'inherit', padding: '0 0 2px' }}
                    />
                  ) : (
                    <span style={{ fontSize: '19px', fontWeight: '700', color: sc.text }}>{form.display_name || 'Add your name'}</span>
                  )}
                  {meta.verified && <VerifiedBadge />}
                  <button type="button" onClick={() => { setEditingName(true); setTimeout(() => nameInputRef.current?.focus(), 0) }} aria-label="Edit name" style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px',
                    borderRadius: '50%', border: 'none', background: sc.chipBg, fontSize: '10px', cursor: 'pointer',
                  }}>✏️</button>
                </div>

                <input
                  type="text" value={form.role_title} onChange={e => handleChange('role_title', e.target.value)}
                  placeholder="Profession / headline (e.g. Builder · Product Designer)"
                  style={{ fontSize: '13px', color: sc.textSoft, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'inherit', marginTop: '3px', width: '100%', padding: 0 }}
                />

                <div style={{ display: 'flex', gap: '14px', marginTop: '8px', flexWrap: 'wrap', fontSize: '12.5px', color: sc.textSoft }}>
                  <input
                    type="text" value={form.location} onChange={e => handleChange('location', e.target.value)} placeholder="📍 Location"
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: '12.5px', color: sc.textSoft, width: '140px', padding: 0 }}
                  />
                  {form.linkedin_url && (
                    <a href={form.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: theme.brass, textDecoration: 'none' }}>🔗 LinkedIn</a>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '12px', color: sc.textSoft, minWidth: '180px' }}>
                <div>📅 Member since <b style={{ color: sc.text }}>{timeLabel(meta.createdAt)}</b></div>
                <div>🆔 User ID <b style={{ color: sc.text, fontFamily: 'monospace' }}>{shortId}</b></div>
                <div>✉️ Email <b style={{ color: sc.text }}>{form.contact_email || userEmail}</b></div>
                {phone && <div>📱 Phone <b style={{ color: sc.text }}>{phone}</b></div>}
              </div>
            </div>
          </Card>

          {/* Stat cards */}
          <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <StatCard icon="👥" iconBg="rgba(179,55,42,0.08)" value={counts.connections} label="Connections" href="/connections" />
            <StatCard icon="🤝" iconBg="rgba(47,122,80,0.10)" value={counts.requests} label="Meet Requests" href="/requests" />
            <StatCard icon="🔖" iconBg="rgba(37,99,235,0.08)" value={counts.bookmarks} label="Bookmarks" href="/bookmarks" />
            <StatCard icon="👁️" iconBg="rgba(147,51,234,0.08)" value={meta.viewCount} label="Profile Views" />
            <StatCard icon="⭐" iconBg="rgba(217,164,6,0.12)" value={planLabel} label="Current Plan" href="/premium" />
          </div>

          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* About Me */}
            <Card title="About Me">
              <div style={{ marginBottom: '14px' }}>
                <FieldLabel>Bio</FieldLabel>
                <textarea rows={3} value={form.bio} onChange={e => handleChange('bio', e.target.value)} placeholder="A short intro about yourself" style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <FieldLabel>Skills (comma separated)</FieldLabel>
                <input type="text" value={form.skills} onChange={e => handleChange('skills', e.target.value)} placeholder="Product Design, UI/UX, Figma" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <FieldLabel>Interests (comma separated)</FieldLabel>
                <input type="text" value={form.interests} onChange={e => handleChange('interests', e.target.value)} placeholder="SaaS, AI, Productivity" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <FieldLabel>Languages (comma separated)</FieldLabel>
                <input type="text" value={form.languages} onChange={e => handleChange('languages', e.target.value)} placeholder="Bangla, English" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <FieldLabel>Looking For</FieldLabel>
                <input type="text" value={form.looking_for} onChange={e => handleChange('looking_for', e.target.value)} placeholder="Technical co-founder" style={inputStyle} />
              </div>
              <div>
                <FieldLabel>Work Status</FieldLabel>
                <input type="text" value={form.commitment} onChange={e => handleChange('commitment', e.target.value)} placeholder="Full-time" style={inputStyle} />
              </div>
            </Card>

            {/* Preferences */}
            <Card title="Preferences">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: sc.text }}>Email Notifications</div>
                    <div style={{ fontSize: '11.5px', color: sc.textFaint, marginTop: '1px' }}>Get updates about messages and requests (delivery coming soon)</div>
                  </div>
                  <Toggle on={meta.notifyEmail} disabled={prefSaving} onChange={v => { setMeta(m => ({ ...m, notifyEmail: v })); savePref('notify_email', v) }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: sc.text }}>Push Notifications</div>
                    <div style={{ fontSize: '11.5px', color: sc.textFaint, marginTop: '1px' }}>Receive push notifications on mobile (delivery coming soon)</div>
                  </div>
                  <Toggle on={meta.notifyPush} disabled={prefSaving} onChange={v => { setMeta(m => ({ ...m, notifyPush: v })); savePref('notify_push', v) }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: sc.text }}>Profile Visibility</div>
                    <div style={{ fontSize: '11.5px', color: sc.textFaint, marginTop: '1px' }}>{meta.isDiscoverable ? 'Visible to everyone' : 'Hidden from Discover & search'}</div>
                  </div>
                  <Toggle on={meta.isDiscoverable} disabled={prefSaving} onChange={v => { setMeta(m => ({ ...m, isDiscoverable: v })); savePref('is_discoverable', v) }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: sc.text }}>Active Status</div>
                    <div style={{ fontSize: '11.5px', color: sc.textFaint, marginTop: '1px' }}>Show when you&apos;re active</div>
                  </div>
                  <Toggle on={meta.showActive} disabled={prefSaving} onChange={v => { setMeta(m => ({ ...m, showActive: v })); savePref('show_active_status', v) }} />
                </div>
              </div>
            </Card>

            {/* Account & Security */}
            <Card title="Account & Security">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Link href="/settings" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: sc.text }}>🔒 Change Password</div>
                    <div style={{ fontSize: '11.5px', color: sc.textFaint, marginTop: '1px' }}>Update your account password</div>
                  </div>
                  <span style={{ color: sc.textSoft, fontSize: '16px' }}>›</span>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: sc.text }}>🛡️ Two-Factor Authentication</div>
                    <div style={{ fontSize: '11.5px', color: sc.textFaint, marginTop: '1px' }}>Coming soon</div>
                  </div>
                  <span style={{ fontSize: '11.5px', fontWeight: '700', color: sc.textFaint, background: sc.chipBg, padding: '5px 10px', borderRadius: '999px' }}>Off</span>
                </div>
              </div>
            </Card>

            {/* Billing & Plan */}
            <Card title="Billing & Plan">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '11.5px', color: sc.textSoft }}>Current Plan</div>
                  <div style={{ fontSize: '14.5px', fontWeight: '700', color: theme.brass, marginTop: '2px' }}>👑 {planLabel} Plan</div>
                </div>
                <Link href="/premium" style={{
                  textDecoration: 'none', border: `1.5px solid ${theme.brass}`, color: theme.brass, borderRadius: '8px',
                  padding: '8px 16px', fontSize: '12.5px', fontWeight: '700',
                }}>Manage Plan</Link>
              </div>
            </Card>
          </div>

          <div style={{ marginTop: '20px' }}>
            <button
              type="button" onClick={handleSubmit} disabled={submitting}
              style={{
                display: 'block', width: '100%', background: submitting ? sc.line : theme.brass,
                color: '#FFFFFF', padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
                border: 'none', cursor: submitting ? 'default' : 'pointer',
              }}
            >{uploading ? 'Uploading photo...' : submitting ? 'Saving...' : 'Save Changes'}</button>
            {error && <div style={{ marginTop: '10px', padding: '9px 12px', background: '#FBEAE8', color: '#C43C2C', borderRadius: '6px', fontSize: '12.5px' }}>{error}</div>}
            {saved && <div style={{ marginTop: '10px', padding: '9px 12px', background: '#E9F5EE', color: '#2F7A50', borderRadius: '6px', fontSize: '12.5px' }}>✓ Saved</div>}
          </div>

          <button onClick={handleLogout} style={{
            display: 'block', width: '100%', textAlign: 'center', background: 'transparent',
            color: '#C43C2C', padding: '13px', borderRadius: '8px', fontSize: '13.5px',
            fontWeight: '700', border: '1.5px dashed #E3A79E', cursor: 'pointer', marginTop: '14px',
          }}>Log Out</button>
        </div>
      </div>

      <AppBottomNav active="profile" />

      <style jsx global>{`
        @media (max-width: 860px) {
          body { padding-bottom: 62px; }
        }
        @media (max-width: 760px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
