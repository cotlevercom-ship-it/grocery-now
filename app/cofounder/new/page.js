'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'

const inputStyle = {
  width: '100%', padding: '11px 13px', borderRadius: '8px', border: `1px solid ${theme.line}`,
  fontSize: '14px', fontFamily: theme.fontBody, background: theme.surface, color: theme.ink,
}
const labelStyle = { fontSize: '13px', fontWeight: '600', color: theme.ink, marginBottom: '6px', display: 'block' }

export default function NewCofounderPostPage() {
  const router = useRouter()
  const [session, setSession] = useState(undefined)
  const [form, setForm] = useState({
    idea_name: '', description: '', stage: '', skills_needed: '',
    equity_offered: '', commitment: '', contact_email: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const s = getSession()
    if (!s?.user?.id) {
      router.replace('/login?next=/cofounder/new')
      return
    }
    setSession(s)
    setForm(prev => ({ ...prev, contact_email: s.user.email }))
  }, [router])

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.idea_name.trim()) { setError('Give your idea/business a name'); return }
    if (!form.description.trim()) { setError('Add a short description'); return }
    setSubmitting(true)
    try {
      await supabaseFetch('cofounder_posts', {
        method: 'POST',
        body: JSON.stringify({
          owner_id: session.user.id,
          idea_name: form.idea_name.trim(),
          description: form.description.trim(),
          stage: form.stage || null,
          skills_needed: form.skills_needed.trim() || null,
          equity_offered: form.equity_offered.trim() || null,
          commitment: form.commitment || null,
          contact_email: form.contact_email.trim() || null,
        }),
      })
      router.push('/account/cofounder')
    } catch (e) {
      console.error(e)
      setError('Could not submit — please try again')
    }
    setSubmitting(false)
  }

  if (session === undefined) {
    return (
      <div style={{ background: theme.paper, minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: theme.inkSoft, fontSize: '14px' }}>Loading…</div>
      </div>
    )
  }

  return (
    <div style={{ background: theme.paper, minHeight: '80vh' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,3vw,24px)' }}>
        <Link href="/cofounder" style={{ fontSize: '13px', color: theme.inkSoft, textDecoration: 'none', display: 'inline-block', marginBottom: '18px' }}>← Find a Co-founder</Link>

        <div style={{
          fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
          color: theme.brassDark, marginBottom: '8px', fontWeight: '600'
        }}>Free</div>
        <h1 style={{ fontFamily: theme.fontDisplay, fontSize: 'clamp(22px,2.8vw,30px)', fontWeight: '600', color: theme.ink, marginBottom: '8px' }}>
          Post Your Idea
        </h1>
        <p style={{ fontSize: '13.5px', color: theme.inkSoft, marginBottom: '26px', lineHeight: '1.6' }}>
          No payment needed. Your post goes live after a quick review.
        </p>

        {error && (
          <div style={{ marginBottom: '16px', padding: '11px 14px', background: theme.dangerSoft, color: theme.danger, borderRadius: '8px', fontSize: '13.5px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={labelStyle}>Idea / business name</label>
            <input style={inputStyle} value={form.idea_name} onChange={e => handleChange('idea_name', e.target.value)} placeholder="e.g. a bilingual tutoring app" />
          </div>

          <div>
            <label style={labelStyle}>Describe your idea</label>
            <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="What problem does it solve? What's the plan so far?" />
          </div>

          <div>
            <label style={labelStyle}>Current stage</label>
            <select style={inputStyle} value={form.stage} onChange={e => handleChange('stage', e.target.value)}>
              <option value="">Select stage</option>
              <option value="Idea">Idea</option>
              <option value="MVP">MVP</option>
              <option value="Launched">Launched</option>
              <option value="Revenue-generating">Revenue-generating</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>What skills/expertise are you looking for?</label>
            <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} value={form.skills_needed} onChange={e => handleChange('skills_needed', e.target.value)} placeholder="e.g. technical co-founder with backend experience" />
          </div>

          <div>
            <label style={labelStyle}>Equity offered (optional)</label>
            <input style={inputStyle} value={form.equity_offered} onChange={e => handleChange('equity_offered', e.target.value)} placeholder="e.g. 10–20%" />
          </div>

          <div>
            <label style={labelStyle}>Commitment expected</label>
            <select style={inputStyle} value={form.commitment} onChange={e => handleChange('commitment', e.target.value)}>
              <option value="">Select</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Contact email</label>
            <input style={{ ...inputStyle, background: '#F2F0EA', color: theme.inkSoft, cursor: 'not-allowed' }} value={form.contact_email} readOnly />
          </div>

          <button type="submit" disabled={submitting} style={{
            background: theme.brass, color: 'white', border: 'none', borderRadius: '8px',
            padding: '13px', fontSize: '14.5px', fontWeight: '700', cursor: submitting ? 'default' : 'pointer',
            opacity: submitting ? 0.7 : 1
          }}>{submitting ? 'Submitting…' : 'Submit Post'}</button>
        </form>
      </div>
    </div>
  )
}
