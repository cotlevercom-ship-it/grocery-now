'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch } from '@/lib/supabase'

const TYPES = [
  { value: 'co_founder', label: 'কো-ফাউন্ডার' },
  { value: 'partner', label: 'পার্টনার' },
  { value: 'investor', label: 'ইনভেস্টর' },
  { value: 'employee', label: 'কর্মী' },
  { value: 'supplier', label: 'সাপ্লায়ার' },
  { value: 'buyer', label: 'বায়ার' },
]

export default function NewListingPage() {
  const router = useRouter()
  const [session, setSession] = useState(undefined)
  const [form, setForm] = useState({
    business_name: '', description: '', industry: '', location: '',
    website: '', contact_email: '', contact_phone: '', listing_types: [],
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setSession(getSession())
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

    if (!form.business_name.trim()) { setError('বিজনেসের নাম দিন'); return }
    if (form.listing_types.length === 0) { setError('অন্তত একটি ক্যাটেগরি বেছে নিন'); return }
    if (!form.contact_phone.trim() && !form.contact_email.trim()) { setError('ফোন বা ইমেইল অন্তত একটি দিন'); return }

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
        contact_phone: form.contact_phone.trim() || null,
        listing_types: form.listing_types,
        status: 'inactive',
      }
      const res = await supabaseFetch('listings', { method: 'POST', body: JSON.stringify(payload) })
      const listing = res?.[0]
      router.push(`/payment/${listing.id}`)
    } catch (e) {
      console.error(e)
      setError('লিস্টিং তৈরি করতে সমস্যা হয়েছে')
    }
    setSubmitting(false)
  }

  const inputStyle = {
    width: '100%', padding: '11px 13px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
  }
  const labelStyle = { fontSize: '12.5px', color: '#555', display: 'block', marginBottom: '5px', fontWeight: '600' }

  if (session === undefined) return null

  if (session === null) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#666', marginBottom: '16px' }}>লিস্টিং তৈরি করতে লগ ইন করুন</p>
        <Link href="/login" style={{
          display: 'inline-block', background: '#163a2c', color: 'white',
          borderRadius: '8px', padding: '10px 22px', fontSize: '14px', fontWeight: '700'
        }}>লগ ইন করুন</Link>
      </div>
    )
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 40px)', maxWidth: '620px', margin: '0 auto' }}>
      <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: '800', marginBottom: '6px' }}>আপনার বিজনেস লিস্ট করুন</h1>
      <p style={{ fontSize: '13.5px', color: '#888', marginBottom: '22px' }}>
        তথ্য দিন, এরপর পেমেন্ট করে লিস্টিং একটিভ করুন।
      </p>

      {error && (
        <div style={{ marginBottom: '16px', padding: '10px 12px', background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e5e5', padding: '20px' }}>
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>বিজনেসের নাম *</label>
          <input style={inputStyle} value={form.business_name} onChange={e => handleChange('business_name', e.target.value)} placeholder="আপনার বিজনেসের নাম" />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>বিবরণ</label>
          <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="আপনার বিজনেস সম্পর্কে সংক্ষেপে লিখুন" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div>
            <label style={labelStyle}>শিল্প/ইন্ডাস্ট্রি</label>
            <input style={inputStyle} value={form.industry} onChange={e => handleChange('industry', e.target.value)} placeholder="যেমন: টেক, ফ্যাশন" />
          </div>
          <div>
            <label style={labelStyle}>লোকেশন</label>
            <input style={inputStyle} value={form.location} onChange={e => handleChange('location', e.target.value)} placeholder="ঢাকা" />
          </div>
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>কী খুঁজছেন? (একাধিক বেছে নিতে পারেন) *</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {TYPES.map(t => (
              <button key={t.value} type="button" onClick={() => toggleType(t.value)} style={{
                padding: '8px 16px', borderRadius: '20px', border: '1px solid #ddd', fontSize: '13px', fontWeight: '600',
                background: form.listing_types.includes(t.value) ? '#163a2c' : 'white',
                color: form.listing_types.includes(t.value) ? 'white' : '#444'
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>ফোন নম্বর</label>
          <input style={inputStyle} value={form.contact_phone} onChange={e => handleChange('contact_phone', e.target.value)} placeholder="01XXXXXXXXX" />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>ইমেইল</label>
          <input style={inputStyle} value={form.contact_email} onChange={e => handleChange('contact_email', e.target.value)} placeholder="you@example.com" />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>ওয়েবসাইট (ঐচ্ছিক)</label>
          <input style={inputStyle} value={form.website} onChange={e => handleChange('website', e.target.value)} placeholder="https://..." />
        </div>

        <button type="submit" disabled={submitting} style={{
          width: '100%', background: submitting ? '#9ca3af' : '#163a2c', color: 'white',
          borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: '700'
        }}>
          {submitting ? 'তৈরি হচ্ছে...' : 'পরবর্তী ধাপ: পেমেন্ট'}
        </button>
      </form>
    </div>
  )
}
