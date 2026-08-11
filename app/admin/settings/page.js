'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

const KEYS = ['contact_email', 'whatsapp_number', 'facebook_url', 'listing_price_monthly', 'listing_price_yearly', 'bkash_payment_number']

const FIELD_META = {
  contact_email: { label: 'Support Email', placeholder: 'support@example.com' },
  whatsapp_number: { label: 'WhatsApp Number (without country code, e.g. 01XXXXXXXXX)', placeholder: '01XXXXXXXXX' },
  facebook_url: { label: 'Facebook Page Link', placeholder: 'https://facebook.com/yourpage' },
  listing_price_monthly: { label: 'Listing Price — Monthly (৳)', placeholder: '500' },
  listing_price_yearly: { label: 'Listing Price — Yearly (৳)', placeholder: '5000' },
  bkash_payment_number: { label: 'bKash Payment Number (for listing subscriptions)', placeholder: '01XXXXXXXXX' },
}

export default function AdminSettingsPage() {
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const rows = await supabaseFetch(`app_settings?select=key,value&key=in.(${KEYS.join(',')})`)
      const map = {}
      KEYS.forEach(k => { map[k] = '' })
      ;(rows || []).forEach(r => { map[r.key] = r.value || '' })
      setValues(map)
    } catch (e) {
      console.error(e)
      setError('Failed to load settings')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleChange = (key, val) => {
    setValues(v => ({ ...v, [key]: val }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      for (const key of KEYS) {
        await supabaseFetch(`app_settings?key=eq.${key}`, {
          method: 'PATCH',
          body: JSON.stringify({ value: values[key] || '', updated_at: new Date().toISOString() }),
        })
      }
      setSuccess('Saved successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      console.error(e)
      setError('Failed to save')
    }
    setSaving(false)
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
  }
  const labelStyle = { fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }

  if (loading) {
    return <div style={{ color: '#888', fontSize: '14px' }}>Loading...</div>
  }

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '4px' }}>
        Settings
      </h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        Manage the site's contact info and payment number from here. Leave a field blank to hide that icon/info in the footer.
      </p>

      {error && (
        <div style={{
          maxWidth: '520px', marginBottom: '16px', padding: '10px 12px',
          background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
        }}>{error}</div>
      )}
      {success && (
        <div style={{
          maxWidth: '520px', marginBottom: '16px', padding: '10px 12px',
          background: '#f5f5f5', color: '#2d6a4f', borderRadius: '8px', fontSize: '13px'
        }}>{success}</div>
      )}

      <form onSubmit={handleSave} style={{
        background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
        padding: '20px', maxWidth: '520px'
      }}>
        {KEYS.map(key => (
          <div key={key} style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>{FIELD_META[key].label}</label>
            <input
              style={inputStyle}
              value={values[key] || ''}
              onChange={e => handleChange(key, e.target.value)}
              placeholder={FIELD_META[key].placeholder}
            />
          </div>
        ))}

        <button type="submit" disabled={saving} style={{
          background: saving ? '#9ca3af' : '#0a0a0a', color: 'white', border: 'none',
          borderRadius: '8px', padding: '10px 22px', fontSize: '14px', fontWeight: '600'
        }}>{saving ? 'Saving...' : 'Save'}</button>
      </form>
    </div>
  )
}
