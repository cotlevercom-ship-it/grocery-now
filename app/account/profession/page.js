'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import { SKILL_OPTIONS } from '@/lib/memberOptions'

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
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      <label style={{ fontSize: '11px', color: theme.inkSoft, display: 'block', marginBottom: '6px', letterSpacing: '0.03em' }}>{label}</label>
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
                background: 'none', border: 'none', color: theme.inkSoft, cursor: 'pointer',
                fontSize: '13px', lineHeight: 1, padding: 0
              }}>×</button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="ledger-input"
          style={{ flex: 1 }}
        />
        <button type="button" onClick={addTag} style={{
          background: 'transparent', color: theme.brass, border: `1px solid ${theme.brass}`,
          borderRadius: '6px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer'
        }}>Add</button>
      </div>
    </div>
  )
}

export default function ProfessionPage() {
  const router = useRouter()
  const [loaded, setLoaded] = useState(false)
  const [userId, setUserId] = useState(null)
  const [currentJob, setCurrentJob] = useState('')
  const [experience, setExperience] = useState('')
  const [interests, setInterests] = useState([])
  const [skills, setSkills] = useState([])
  const [languages, setLanguages] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function init() {
      const session = getSession()
      if (!session?.user?.id) {
        router.replace('/login?next=/account/profession')
        return
      }
      setUserId(session.user.id)

      try {
        const rows = await supabaseFetch(`member_profiles?select=role_title,experience,interests,skills,languages&user_id=eq.${session.user.id}`)
        const p = rows?.[0]
        if (p) {
          setCurrentJob(p.role_title || '')
          setExperience(p.experience || '')
          setInterests(p.interests || [])
          setSkills(p.skills || [])
          setLanguages(p.languages || [])
        }
      } catch (e) {
        console.error(e)
      }
      setLoaded(true)
    }
    init()
  }, [router])

  const toggleSkill = (s) => setSkills(prev => prev.includes(s) ? prev.filter(v => v !== s) : [...prev, s])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaved(false)
    setSubmitting(true)
    try {
      await supabaseFetch(`member_profiles?user_id=eq.${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          role_title: currentJob.trim() || null,
          experience: experience.trim() || null,
          interests,
          skills,
          languages,
          updated_at: new Date().toISOString(),
        }),
      })
      setSaved(true)
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

  return (
    <div style={{ minHeight: '100vh', background: theme.paper, paddingBottom: '48px' }}>
      {/* Topbar */}
      <div style={{ background: theme.surface, padding: '16px', borderBottom: `1px solid ${theme.line}` }}>
        <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/account">
            <div style={{ color: theme.ink, fontSize: '21px', lineHeight: 1 }}>←</div>
          </Link>
          <div>
            <div style={{ color: theme.ink, fontSize: '15.5px', fontWeight: '700' }}>Profession</div>
            <div style={{ color: theme.brass, fontSize: '11px', marginTop: '1px', letterSpacing: '0.03em' }}>Update Passbook Info</div>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }}>

        <form onSubmit={handleSubmit}>
          <div style={{
            background: theme.surface, margin: '18px 16px 14px', borderRadius: '4px',
            border: `1px solid ${theme.line}`, padding: '22px 18px 6px'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '11px', color: theme.inkSoft, display: 'block', marginBottom: '6px', letterSpacing: '0.03em' }}>Current Job</label>
              <input
                type="text"
                value={currentJob}
                onChange={(e) => setCurrentJob(e.target.value)}
                placeholder="e.g. Software Engineer at X"
                className="ledger-input"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '11px', color: theme.inkSoft, display: 'block', marginBottom: '6px', letterSpacing: '0.03em' }}>Experience</label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 5 years in fintech product management"
                className="ledger-input"
              />
            </div>

            <TagInput label="Interest" values={interests} onChange={setInterests} placeholder="e.g. Photography" />

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '11px', color: theme.inkSoft, display: 'block', marginBottom: '6px', letterSpacing: '0.03em' }}>Skill</label>
              {skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '10px' }}>
                  {skills.map(s => (
                    <span key={s} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      fontSize: '12.5px', fontWeight: '600', padding: '6px 10px', borderRadius: '20px',
                      background: theme.lineSoft, color: theme.ink, border: `1px solid ${theme.line}`
                    }}>
                      {s}
                      <button type="button" onClick={() => toggleSkill(s)} style={{
                        background: 'none', border: 'none', color: theme.inkSoft, cursor: 'pointer',
                        fontSize: '13px', lineHeight: 1, padding: 0
                      }}>×</button>
                    </span>
                  ))}
                </div>
              )}
              <select
                value=""
                onChange={(e) => { if (e.target.value) toggleSkill(e.target.value) }}
                className="ledger-input ledger-select"
              >
                <option value="">Select a skill to add</option>
                {SKILL_OPTIONS.filter(s => !skills.includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <TagInput label="Language" values={languages} onChange={setLanguages} placeholder="e.g. Bangla, English" />
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
            }}>✓ Saved</div>
          )}

          <div style={{ padding: '0 16px' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%', background: submitting ? theme.line : theme.brass, color: theme.ink,
                padding: '14px', borderRadius: '4px', fontSize: '14.5px', fontWeight: '700',
                border: 'none', letterSpacing: '0.02em'
              }}>
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>

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
