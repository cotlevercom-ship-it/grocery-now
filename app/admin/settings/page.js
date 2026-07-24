'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

const KEYS = ['bkash_number', 'contact_email', 'whatsapp_number', 'facebook_url']

const FIELD_META = {
  bkash_number: { label: 'bKash নাম্বার (Merchant)', placeholder: '01XXXXXXXXX' },
  contact_email: { label: 'সাপোর্ট Email', placeholder: 'support@example.com' },
  whatsapp_number: { label: 'WhatsApp নাম্বার (দেশের কোড ছাড়া, যেমন 01XXXXXXXXX)', placeholder: '01XXXXXXXXX' },
  facebook_url: { label: 'Facebook Page লিংক', placeholder: 'https://facebook.com/yourpage' },
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
      setError('সেটিংস লোড করতে সমস্যা হয়েছে')
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
      setSuccess('সফলভাবে সেভ হয়েছে')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      console.error(e)
      setError('সেভ করতে সমস্যা হয়েছে')
    }
    setSaving(false)
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
  }
  const labelStyle = { fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }

  if (loading) {
    return <div style={{ color: '#888', fontSize: '14px' }}>লোড হচ্ছে...</div>
  }

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '4px' }}>
        সেটিংস
      </h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        সাইটের যোগাযোগ তথ্য ও পেমেন্ট নাম্বার এখান থেকে নিয়ন্ত্রণ করুন। খালি রাখলে ফুটারে সেই আইকন/তথ্য দেখাবে না।
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
          background: '#e8f5e9', color: '#2d6a4f', borderRadius: '8px', fontSize: '13px'
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
          background: saving ? '#a5d6a7' : '#2e7d32', color: 'white', border: 'none',
          borderRadius: '8px', padding: '10px 22px', fontSize: '14px', fontWeight: '600'
        }}>{saving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}</button>
      </form>
    </div>
  )
}
