'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import { EXTRA_FIELD_CONFIG, cleanExtraFieldsForType } from '@/lib/listingExtraFields'
import { fetchListingTypes } from '@/lib/listingTypes'
import AgreementCheckbox from '@/components/AgreementCheckbox'

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
    business_name: '', owner_name: '', description: '', industry: '', location: '',
    website: '', contact_email: '', listing_types: [],
  })
  const [extra, setExtra] = useState({}) // { [type]: { [fieldKey]: value } }
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [types, setTypes] = useState([]) // active listing type options, admin-managed
  const [agreed, setAgreed] = useState(false)
  const [listingCount, setListingCount] = useState(null) // null = still loading
  const [activeSub, setActiveSub] = useState(null) // most recent active, non-expired subscription (any of the user's listings)
  const [pendingSub, setPendingSub] = useState(null) // account-level subscription still awaiting admin approval — already paid, just not confirmed yet

  const MAX_LISTINGS_PER_USER = 3

  useEffect(() => {
    // getSession() reads localStorage — client-only, must stay in an effect
    // rather than a lazy useState initializer to avoid a hydration mismatch.
    const s = getSession()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(s)
    if (s?.user?.email) {
      setForm(prev => ({ ...prev, contact_email: s.user.email }))
    }
    fetchListingTypes({ activeOnly: true }).then(setTypes).catch(e => console.error(e))

    if (s?.user?.id) {
      supabaseFetch(`listings?select=id&owner_id=eq.${s.user.id}`)
        .then(rows => setListingCount((rows || []).length))
        .catch(e => { console.error(e); setListingCount(0) })

      const nowIso = new Date().toISOString()
      supabaseFetch(`listing_subscriptions?select=*&user_id=eq.${s.user.id}&status=eq.active&ends_at=gt.${nowIso}&order=ends_at.desc&limit=1`)
        .then(rows => setActiveSub(rows?.[0] || null))
        .catch(e => console.error(e))

      // Already-paid-but-not-yet-approved subscription (e.g. the one made at
      // signup on /account/subscribe). Without this, a user who just paid
      // and immediately tries to create their first listing gets sent to
      // /payment/[listingId] and asked to pay a second time while their
      // first payment is still waiting on admin review.
      supabaseFetch(`listing_subscriptions?select=*&user_id=eq.${s.user.id}&status=eq.pending&order=created_at.desc&limit=1`)
        .then(rows => setPendingSub(rows?.[0] || null))
        .catch(e => console.error(e))
    }
  }, [])

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleExtraChange = (type, key, value) => setExtra(prev => ({
    ...prev,
    [type]: { ...(prev[type] || {}), [key]: value }
  }))

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
    if (listingCount !== null && listingCount >= MAX_LISTINGS_PER_USER) {
      setError(`You've reached the ${MAX_LISTINGS_PER_USER}-listing limit for your account.`)
      return
    }
    if (!form.business_name.trim()) { setError('Enter your business name'); return }
    if (!form.owner_name.trim()) { setError('Enter the owner/founder name'); return }
    if (form.listing_types.length === 0) { setError('Select at least one category'); return }
    if (!form.contact_email.trim()) { setError('Provide a contact email'); return }
    if (!agreed) { setError('Please agree to the Business Listing Terms'); return }
    for (const type of form.listing_types) {
      const config = EXTRA_FIELD_CONFIG[type]
      if (!config) continue
      const missing = config.fields.find(f => f.required && !(extra[type]?.[f.key] || '').toString().trim())
      if (missing) { setError(`Please fill "${missing.label}" (${config.label})`); return }
    }

    setSubmitting(true)
    try {
      const extra_fields = {}
      form.listing_types.forEach(type => {
        const cleaned = cleanExtraFieldsForType(type, extra[type])
        if (cleaned) extra_fields[type] = cleaned
      })

      const payload = {
        owner_id: session.user.id,
        business_name: form.business_name.trim(),
        owner_name: form.owner_name.trim(),
        description: form.description.trim() || null,
        industry: form.industry.trim() || null,
        location: form.location.trim() || null,
        website: form.website.trim() || null,
        contact_email: form.contact_email.trim() || null,
        listing_types: form.listing_types,
        extra_fields,
        status: 'inactive',
      }
      const res = await supabaseFetch('listings', { method: 'POST', body: JSON.stringify(payload) })
      const listing = res?.[0]

      const coveringSub = activeSub || pendingSub
      if (coveringSub && listingCount < MAX_LISTINGS_PER_USER) {
        // Already has a paid subscription (active, or paid and still
        // awaiting admin approval) with room left under the 3-listing cap —
        // this extra listing rides on that plan at no extra charge. Still
        // goes through the normal admin-approval queue (the anti-bypass DB
        // trigger requires it) but with amount 0, so the admin knows
        // there's no separate bKash transaction to check.
        await supabaseFetch('listing_subscriptions', {
          method: 'POST',
          body: JSON.stringify({
            listing_id: listing.id,
            user_id: session.user.id,
            plan: coveringSub.plan,
            amount: 0,
            status: 'pending',
            payment_method: 'included_in_plan',
            payment_reference: activeSub
              ? 'Additional listing under existing subscription'
              : 'Listing under subscription paid at signup, pending admin approval',
          }),
        })
        router.push('/account/listings')
      } else {
        router.push(`/payment/${listing.id}`)
      }
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

  if (listingCount !== null && listingCount >= MAX_LISTINGS_PER_USER) {
    return (
      <div style={{ background: theme.paper, minHeight: '60vh', padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: theme.ink, fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
          You&apos;ve reached the {MAX_LISTINGS_PER_USER}-listing limit
        </p>
        <p style={{ color: theme.inkSoft, marginBottom: '18px', fontSize: '14px' }}>
          Your account already has {MAX_LISTINGS_PER_USER} listings. Manage or remove one to add another.
        </p>
        <Link href="/account/listings" style={{
          display: 'inline-block', background: theme.brass, color: 'white',
          borderRadius: '8px', padding: '12px 24px', fontSize: '14.5px', fontWeight: '600', textDecoration: 'none'
        }}>My Listings</Link>
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
          {(activeSub || pendingSub)
            ? `Your subscription covers up to ${MAX_LISTINGS_PER_USER} listings — this one won't need a separate payment.`
            : 'Fill in your details, then pay to activate the listing.'}
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
            <label style={labelStyle}>Owner / Founder Name *</label>
            <input style={inputStyle} value={form.owner_name} onChange={e => handleChange('owner_name', e.target.value)} placeholder="Your name — shown as 'by [Name]' on the listing" />
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
              {types.map(t => (
                <button key={t.key} type="button" onClick={() => toggleType(t.key)} style={{
                  padding: '9px 16px', borderRadius: '20px', border: `1px solid ${form.listing_types.includes(t.key) ? theme.ink : theme.line}`,
                  fontSize: '13px', fontWeight: '600', fontFamily: theme.fontBody,
                  background: form.listing_types.includes(t.key) ? theme.ink : theme.surface,
                  color: form.listing_types.includes(t.key) ? theme.paper : theme.inkSoft
                }}>{t.icon} {t.label}</button>
              ))}
            </div>
          </div>

          {form.listing_types.map(type => {
            const config = EXTRA_FIELD_CONFIG[type]
            if (!config) return null
            return (
              <div key={type} style={{
                marginBottom: '20px', padding: '16px', borderRadius: '10px',
                background: theme.paper, border: `1px solid ${theme.line}`
              }}>
                <div style={{
                  fontFamily: theme.fontMono, fontSize: '10.5px', letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: theme.brassDark, marginBottom: '12px', fontWeight: '600'
                }}>{config.label}</div>
                {config.fields.map(f => (
                  <div key={f.key} style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>{f.label}{f.required ? ' *' : ''}</label>
                    {f.type === 'textarea' ? (
                      <textarea
                        style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }}
                        value={extra[type]?.[f.key] || ''}
                        onChange={e => handleExtraChange(type, f.key, e.target.value)}
                        placeholder={f.placeholder || ''}
                      />
                    ) : f.type === 'select' ? (
                      <select
                        style={inputStyle}
                        value={extra[type]?.[f.key] || ''}
                        onChange={e => handleExtraChange(type, f.key, e.target.value)}
                      >
                        <option value="">Select</option>
                        {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input
                        style={inputStyle}
                        value={extra[type]?.[f.key] || ''}
                        onChange={e => handleExtraChange(type, f.key, e.target.value)}
                        placeholder={f.placeholder || ''}
                      />
                    )}
                  </div>
                ))}
              </div>
            )
          })}

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

          <div style={{ marginBottom: '20px' }}>
            <AgreementCheckbox type="listing" checked={agreed} onChange={setAgreed} accent={theme.brass} />
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
