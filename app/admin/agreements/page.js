'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

const TYPE_LABELS = {
  merchant: { label: 'Merchant Registration', desc: 'Shown at /merchant/create during shop signup' },
  customer: { label: 'Customer Registration', desc: 'Shown at /login during signup' },
  affiliate: { label: 'Affiliate Registration', desc: 'Shown at /affiliate during signup' },
  ship: { label: 'Ship a Parcel', desc: 'Shown at /ship before booking a shipment' },
}

export default function AdminAgreementsPage() {
  const [agreements, setAgreements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editingType, setEditingType] = useState(null)
  const [titleBn, setTitleBn] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [contentBn, setContentBn] = useState('')
  const [contentEn, setContentEn] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const rows = await supabaseFetch('agreements?select=*&order=type')
      setAgreements(rows || [])
    } catch (e) {
      console.error(e)
      setError('Failed to load agreements')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openEdit = (a) => {
    setEditingType(a.type)
    setTitleBn(a.title_bn || '')
    setTitleEn(a.title_en || '')
    setContentBn(a.content_bn || '')
    setContentEn(a.content_en || '')
    setSaved(false)
  }

  const closeEdit = () => {
    setEditingType(null)
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      await supabaseFetch(`agreements?type=eq.${editingType}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ title_bn: titleBn.trim(), title_en: titleEn.trim(), content_bn: contentBn.trim(), content_en: contentEn.trim(), updated_at: new Date().toISOString() }),
      })
      setSaved(true)
      await load()
    } catch (e) {
      console.error(e)
      setError('Failed to save')
    }
    setSaving(false)
  }

  if (loading) {
    return <div style={{ padding: '24px', color: '#999', fontSize: '14px' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '20px', maxWidth: '760px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0a0a0a', marginBottom: '4px' }}>Agreements</h1>
      <p style={{ fontSize: '13px', color: '#777', marginBottom: '20px' }}>
        Manage the agreement text shown as a checkbox on each registration/booking form.
      </p>

      {error && (
        <div style={{ background: '#fbe9e4', color: '#a6402b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {agreements.map(a => (
          <div key={a.type} style={{
            background: 'white', border: '1px solid #eee', borderRadius: '10px',
            padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0a0a0a' }}>
                {TYPE_LABELS[a.type]?.label || a.type} — <span style={{ color: '#555', fontWeight: '500' }}>{a.title_en}</span>
              </div>
              <div style={{ fontSize: '11.5px', color: '#999', marginTop: '2px' }}>{TYPE_LABELS[a.type]?.desc}</div>
            </div>
            <button
              onClick={() => openEdit(a)}
              style={{
                flexShrink: 0, background: '#0a0a0a', color: 'white', border: 'none',
                borderRadius: '8px', padding: '8px 16px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer',
              }}
            >Edit</button>
          </div>
        ))}
      </div>

      {editingType && (
        <div
          onClick={closeEdit}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'white', width: '100%', maxWidth: '560px', borderRadius: '14px', padding: '22px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#0a0a0a', marginBottom: '16px' }}>
              Edit {TYPE_LABELS[editingType]?.label}
            </div>

            <label style={{ fontSize: '11.5px', color: '#888', display: 'block', marginBottom: '4px' }}>Checkbox Label / Title — বাংলা</label>
            <input
              type="text"
              value={titleBn}
              onChange={(e) => setTitleBn(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '12px', boxSizing: 'border-box' }}
            />

            <label style={{ fontSize: '11.5px', color: '#888', display: 'block', marginBottom: '4px' }}>Checkbox Label / Title — English</label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '14px', boxSizing: 'border-box' }}
            />

            <label style={{ fontSize: '11.5px', color: '#888', display: 'block', marginBottom: '4px' }}>Full Agreement Text — বাংলা</label>
            <textarea
              value={contentBn}
              onChange={(e) => setContentBn(e.target.value)}
              rows={8}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13.5px', lineHeight: 1.6, marginBottom: '14px', boxSizing: 'border-box', resize: 'vertical' }}
            />

            <label style={{ fontSize: '11.5px', color: '#888', display: 'block', marginBottom: '4px' }}>Full Agreement Text — English</label>
            <textarea
              value={contentEn}
              onChange={(e) => setContentEn(e.target.value)}
              rows={8}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13.5px', lineHeight: 1.6, marginBottom: '16px', boxSizing: 'border-box', resize: 'vertical' }}
            />

            {saved && <div style={{ color: '#1a7a3a', fontSize: '13px', marginBottom: '12px' }}>✓ Saved</div>}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={closeEdit}
                style={{ flex: 1, background: '#f0f0f0', color: '#333', border: 'none', borderRadius: '8px', padding: '11px', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer' }}
              >Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ flex: 1, background: saving ? '#999' : '#0a0a0a', color: 'white', border: 'none', borderRadius: '8px', padding: '11px', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer' }}
              >{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
