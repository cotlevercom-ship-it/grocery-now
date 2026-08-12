'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'

const TYPES = [
  { value: 'co_founder', label: 'Co-founder' },
  { value: 'partner', label: 'Partner' },
  { value: 'investor', label: 'Investor' },
  { value: 'employee', label: 'Employee' },
  { value: 'supplier', label: 'Supplier' },
  { value: 'buyer', label: 'Buyer' },
]

const INDUSTRIES = [
  'Technology / Software',
  'E-commerce',
  'F-Commerce',
  'Fashion & Apparel',
  'Food & Beverage',
  'Agriculture',
  'Manufacturing',
  'Retail',
  'Real Estate',
  'Healthcare',
  'Education',
  'Finance & Banking',
  'Logistics & Transportation',
  'Media & Entertainment',
  'Tourism & Hospitality',
  'Construction',
  'Textile & Garments',
  'Consulting',
]

export default function NewListingPage() {
  const router = useRouter()
  const [session, setSession] = useState(undefined)
  const [form, setForm] = useState({
    business_name: '', description: '', industry: '', location: '',
    website: '', contact_email: '', listing_types: [],
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const s = getSession()
    setSession(s)
    if (s?.user?.email) {
      setForm(prev => ({ ...prev, contact_email: s.user.email }))
    }
  }, [])

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const toggleType = (value) => {
    setForm(prev => ({
      ...prev,
      listing_types: prev.listing_types.includes(value)
        ? prev.listing_types.filter(t => t !== value)
        : [...prev.listing_types, value]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.business_name.trim()) { setError('Enter your business name'); return }
    if (form.listing_types.length === 0) { setError('Select at least one category'); return }
    if (!form.contact_email.trim()) { setError('Provide a contact email'); return }

    setSubmitting(true)
    try {
      const payload = {
        owner_id: session.user.id,
        business_name: form.business_name.trim(),
        description: form.description.trim() || null,
        industry: form.industry.trim() || null,
        location: form.location.trim() || null,
        website: form.website.trim() || null,
        contact_email: form.contact_email.trim() || null,
        listing_types: form.listing_types,
        status: 'inactive',
      }
      const res = await supabaseFetch('listings', { method: 'POST', body: JSON.stringify(payload) })
      const listing = res?.[0]
      router.push(`/payment/${listing.id}`)
    } catch (e) {
      console.error(e)
      setError('Could not create the listing')
    }
    setSubmitting(false)
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: '8px',
    border: `1px solid ${theme.line}`, fontSize: '14.5px', boxSizing: 'border-box',
    fontFamily: theme.fontBody, background: theme.surface, color: theme.ink,
  }
  const labelStyle = { fontSize: '12.5px', color: theme.inkSoft, display: 'block', marginBottom: '6px', fontWeight: '600' }

  if (session === undefined) return null

  if (session === null) {
    return (
      <div style={{ background: theme.paper, minHeight: '60vh', padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: theme.inkSoft, marginBottom: '18px', fontSize: '15px' }}>Log in to create a listing</p>
        <Link href="/login" style={{
          display: 'inline-block', background: theme.brass, color: 'white',
          borderRadius: '8px', padding: '12px 24px', fontSize: '14.5px', fontWeight: '600', textDecoration: 'none'
        }}>Log In</Link>
      </div>
    )
  }

  return (
    <div style={{ background: theme.paper, minHeight: '70vh' }}>
      <div style={{ maxWidth: '620px', margin: '0 auto', padding: 'clamp(20px,4vw,48px) clamp(16px,3vw,24px)' }}>
        <div style={{
          fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
          color: theme.brassDark, marginBottom: '10px', fontWeight: '600'
        }}>New Listing</div>
        <h1 style={{ fontFamily: theme.fontDisplay, fontSize: 'clamp(22px,2.8vw,30px)', fontWeight: '600', color: theme.ink, marginBottom: '8px' }}>
          List Your Business
        </h1>
        <p style={{ fontSize: '14px', color: theme.inkSoft, marginBottom: '28px' }}>
          Fill in your details, then pay to activate the listing.
        </p>

        {error && (
          <div style={{ marginBottom: '16px', padding: '11px 14px', background: theme.dangerSoft, color: theme.danger, borderRadius: '8px', fontSize: '13.5px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: theme.surface, borderRadius: '12px', border: `1px solid ${theme.line}`, padding: 'clamp(20px,3vw,28px)' }}>
          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Business Name *</label>
            <input style={inputStyle} value={form.business_name} onChange={e => handleChange('business_name', e.target.value)} placeholder="Your business name" />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="Briefly describe your business" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
            <div>
              <label style={labelStyle}>Industry</label>
              <select style={inputStyle} value={form.industry} onChange={e => handleChange('industry', e.target.value)}>
                <option value="">Select industry</option>
                {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Location</label>
              <input style={inputStyle} value={form.location} onChange={e => handleChange('location', e.target.value)} placeholder="Dhaka" />
            </div>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={labelStyle}>What are you looking for? (select multiple) *</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => toggleType(t.value)} style={{
                  padding: '9px 16px', borderRadius: '20px', border: `1px solid ${form.listing_types.includes(t.value) ? theme.ink : theme.line}`,
                  fontSize: '13px', fontWeight: '600', fontFamily: theme.fontBody,
                  background: form.listing_types.includes(t.value) ? theme.ink : theme.surface,
                  color: form.listing_types.includes(t.value) ? theme.paper : theme.inkSoft
                }}>{t.label}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Contact Email *</label>
            <input style={{ ...inputStyle, background: '#F2F0EA', color: theme.inkSoft, cursor: 'not-allowed' }} value={form.contact_email} readOnly />
            <div style={{ fontSize: '11.5px', color: theme.inkSoft, marginTop: '5px' }}>
              This is your account email — visitors will use it to reach you.
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Website (optional)</label>
            <input style={inputStyle} value={form.website} onChange={e => handleChange('website', e.target.value)} placeholder="https://..." />
          </div>

          <button type="submit" disabled={submitting} style={{
            width: '100%', background: submitting ? '#B8B2A0' : theme.brass, color: 'white',
            borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: '600', border: 'none', fontFamily: theme.fontBody
          }}>
            {submitting ? 'Creating...' : 'Next: Payment'}
          </button>
        </form>
      </div>
    </div>
  )
}
