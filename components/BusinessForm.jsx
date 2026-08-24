'use client'
import { useState, useEffect } from 'react'
import { theme } from '@/lib/theme'
import { sc } from '@/lib/memberTheme'
import { supabaseFetch } from '@/lib/supabase'

const STAGE_OPTIONS = [
  { value: '', label: 'Select stage…' },
  { value: 'idea', label: 'Idea stage' },
  { value: 'mvp', label: 'MVP / Pre-launch' },
  { value: 'early_revenue', label: 'Early revenue' },
  { value: 'growth', label: 'Growth stage' },
]

const inputStyle = {
  width: '100%', padding: '11px 13px', borderRadius: '9px', border: `1px solid ${sc.line}`,
  background: sc.cardBg, fontSize: '14px', color: sc.text, outline: 'none', boxSizing: 'border-box',
  fontFamily: theme.fontBody,
}
const labelStyle = { fontSize: '12.5px', fontWeight: '700', color: sc.textSoft, marginBottom: '6px', display: 'block' }

export default function BusinessForm({ initial, onSubmit, submitting, submitLabel = 'Save' }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    industry: initial?.industry || '',
    description: initial?.description || '',
    stage: initial?.stage || '',
    equity_percent: initial?.equity_percent ?? '',
    valuation: initial?.valuation || '',
    funding_needed: initial?.funding_needed || '',
    photo_url: initial?.photo_url || '',
    is_active: initial?.is_active ?? true,
  })
  const [error, setError] = useState('')
  const [industries, setIndustries] = useState([])

  useEffect(() => {
    supabaseFetch('business_industries?select=id,name&is_active=eq.true&order=sort_order.asc')
      .then(rows => setIndustries(rows || []))
      .catch(e => console.error(e))
  }, [])

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('Business name is required.'); return }
    if (form.equity_percent !== '' && (Number(form.equity_percent) <= 0 || Number(form.equity_percent) > 100)) {
      setError('Equity % must be between 1 and 100.')
      return
    }
    const payload = {
      ...form,
      equity_percent: form.equity_percent === '' ? null : Number(form.equity_percent),
    }
    try {
      await onSubmit(payload)
    } catch (e2) {
      setError(e2?.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={labelStyle}>Business name *</label>
        <input style={inputStyle} value={form.name} onChange={set('name')} placeholder="e.g. Cot Lever" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={labelStyle}>Industry</label>
          <select style={inputStyle} value={form.industry} onChange={set('industry')}>
            <option value="">Select industry…</option>
            {industries.map(opt => <option key={opt.id} value={opt.name}>{opt.name}</option>)}
            {form.industry && !industries.some(o => o.name === form.industry) && (
              <option value={form.industry}>{form.industry}</option>
            )}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Stage</label>
          <select style={inputStyle} value={form.stage} onChange={set('stage')}>
            {STAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Description</label>
        <textarea
          style={{ ...inputStyle, minHeight: '90px', resize: 'vertical', fontFamily: theme.fontBody }}
          value={form.description}
          onChange={set('description')}
          placeholder="What does the business do?"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={labelStyle}>Equity offered (%)</label>
          <input style={inputStyle} type="number" min="1" max="100" step="0.1" value={form.equity_percent} onChange={set('equity_percent')} placeholder="e.g. 10" />
        </div>
        <div>
          <label style={labelStyle}>Funding needed</label>
          <input style={inputStyle} value={form.funding_needed} onChange={set('funding_needed')} placeholder="e.g. ৳5,00,000" />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Valuation (optional)</label>
        <input style={inputStyle} value={form.valuation} onChange={set('valuation')} placeholder="e.g. ৳50,00,000" />
      </div>

      <div>
        <label style={labelStyle}>Logo / photo URL (optional)</label>
        <input style={inputStyle} value={form.photo_url} onChange={set('photo_url')} placeholder="https://…" />
      </div>

      {initial && (
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: sc.textSoft, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.is_active} onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))} />
          Visible to other members (active listing)
        </label>
      )}

      {error && (
        <div style={{ padding: '10px 12px', background: '#FDEDEA', color: theme.danger || '#C0392B', borderRadius: '8px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={submitting} style={{
        padding: '12px 16px', borderRadius: '9px', border: 'none', background: theme.brass, color: '#FFFFFF',
        fontSize: '14px', fontWeight: '700', cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1,
      }}>
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
