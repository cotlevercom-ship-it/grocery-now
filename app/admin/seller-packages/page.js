'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

const emptyForm = {
  name_bn: '', price: '0', max_products: '', max_categories: '', max_subcategories: '', features_bn: '', sort_order: '0', is_active: true,
}

export default function AdminSellerPackagesPage() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const [deletingId, setDeletingId] = useState(null)

  async function loadPackages() {
    setLoading(true)
    setError('')
    try {
      const data = await supabaseFetch('seller_packages?select=*&order=sort_order')
      setPackages(data || [])
    } catch (e) {
      console.error(e)
      setError('প্যাকেজ লোড করতে সমস্যা হয়েছে')
    }
    setLoading(false)
  }

  useEffect(() => { loadPackages() }, [])

  const openNewForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEditForm = (pkg) => {
    setEditingId(pkg.id)
    setForm({
      name_bn: pkg.name_bn || '',
      price: String(pkg.price ?? '0'),
      max_products: pkg.max_products == null ? '' : String(pkg.max_products),
      max_categories: pkg.max_categories == null ? '' : String(pkg.max_categories),
      max_subcategories: pkg.max_subcategories == null ? '' : String(pkg.max_subcategories),
      features_bn: (pkg.features_bn || []).join('\n'),
      sort_order: String(pkg.sort_order ?? '0'),
      is_active: pkg.is_active !== false,
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name_bn.trim()) {
      setError('প্যাকেজের নাম দিন')
      return
    }
    const payload = {
      name_bn: form.name_bn.trim(),
      price: Number(form.price) || 0,
      max_products: form.max_products.trim() === '' ? null : Number(form.max_products),
      max_categories: form.max_categories.trim() === '' ? null : Number(form.max_categories),
      max_subcategories: form.max_subcategories.trim() === '' ? null : Number(form.max_subcategories),
      features_bn: form.features_bn.split('\n').map(f => f.trim()).filter(Boolean),
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    }
    setSaving(true)
    try {
      if (editingId) {
        await supabaseFetch(`seller_packages?id=eq.${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
      } else {
        await supabaseFetch('seller_packages', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      }
      closeForm()
      await loadPackages()
    } catch (e) {
      console.error(e)
      setError('প্যাকেজ সেভ করতে সমস্যা হয়েছে')
    }
    setSaving(false)
  }

  const toggleActive = async (pkg) => {
    try {
      await supabaseFetch(`seller_packages?id=eq.${pkg.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !pkg.is_active }),
      })
      await loadPackages()
    } catch (e) {
      console.error(e)
      setError('স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('এই প্যাকেজটি মুছে ফেলতে চান? কোনো দোকান এই প্যাকেজে থাকলে সমস্যা হতে পারে।')) return
    setDeletingId(id)
    try {
      await supabaseFetch(`seller_packages?id=eq.${id}`, { method: 'DELETE' })
      await loadPackages()
    } catch (e) {
      console.error(e)
      setError('প্যাকেজ মুছতে সমস্যা হয়েছে। এই প্যাকেজে দোকান থাকলে আগে সেগুলো সরান বা inactive করুন।')
    }
    setDeletingId(null)
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
  }
  const labelStyle = { fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '4px' }}>
            সেলার প্যাকেজ
          </h1>
          <p style={{ color: '#888', fontSize: '14px' }}>
            দাম, পণ্যের সীমা ও ফিচার এখান থেকে নিয়ন্ত্রণ করুন।
          </p>
        </div>
        {!showForm && (
          <button onClick={openNewForm} style={{
            background: '#163a2c', color: 'white', border: 'none', borderRadius: '8px',
            padding: '10px 18px', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap'
          }}>+ নতুন প্যাকেজ</button>
        )}
      </div>

      {error && (
        <div style={{
          maxWidth: '560px', margin: '16px 0', padding: '10px 12px',
          background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
        }}>{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleSave} style={{
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
          padding: '20px', marginBottom: '24px', maxWidth: '480px'
        }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#163a2c', marginBottom: '14px' }}>
            {editingId ? 'প্যাকেজ এডিট করুন' : 'নতুন প্যাকেজ'}
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>প্যাকেজের নাম *</label>
            <input style={inputStyle} value={form.name_bn}
              onChange={e => setForm({ ...form, name_bn: e.target.value })}
              placeholder="যেমন: স্ট্যান্ডার্ড" />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>দাম (৳/মাস, ফ্রি হলে 0)</label>
              <input style={inputStyle} type="number" value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>সর্বোচ্চ পণ্য (ফাঁকা = আনলিমিটেড)</label>
              <input style={inputStyle} type="number" value={form.max_products}
                onChange={e => setForm({ ...form, max_products: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>সর্বোচ্চ Category (ফাঁকা = আনলিমিটেড)</label>
              <input style={inputStyle} type="number" value={form.max_categories}
                onChange={e => setForm({ ...form, max_categories: e.target.value })} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>সর্বোচ্চ Sub-category (ফাঁকা = আনলিমিটেড)</label>
              <input style={inputStyle} type="number" value={form.max_subcategories}
                onChange={e => setForm({ ...form, max_subcategories: e.target.value })} />
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>ফিচার (প্রতি লাইনে একটি)</label>
            <textarea style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} rows={4}
              value={form.features_bn}
              onChange={e => setForm({ ...form, features_bn: e.target.value })}
              placeholder={'যেমন:\nআনলিমিটেড পণ্য\nঅগ্রাধিকার সাপোর্ট'} />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>ক্রম (Sort Order)</label>
              <input style={inputStyle} type="number" value={form.sort_order}
                onChange={e => setForm({ ...form, sort_order: e.target.value })} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#444', marginTop: '18px' }}>
              <input type="checkbox" checked={form.is_active}
                onChange={e => setForm({ ...form, is_active: e.target.checked })} />
              সক্রিয়
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={saving} style={{
              background: saving ? '#a5d6a7' : '#2e7d32', color: 'white', border: 'none',
              borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600'
            }}>{saving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}</button>
            <button type="button" onClick={closeForm} style={{
              background: '#f0f0f0', color: '#555', border: 'none',
              borderRadius: '8px', padding: '10px 20px', fontSize: '14px'
            }}>বাতিল</button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>লোড হচ্ছে...</div>
      ) : packages.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '50px 20px', color: '#999',
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>💳</div>
          <p>এখনো কোনো প্যাকেজ যোগ করা হয়নি</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '640px' }}>
          {packages.map(pkg => (
            <div key={pkg.id} style={{
              background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
              padding: '16px', opacity: pkg.is_active ? 1 : 0.6
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#163a2c' }}>
                    {pkg.name_bn} {!pkg.is_active && <span style={{ fontSize: '11px', color: '#c62828', fontWeight: '600' }}>(নিষ্ক্রিয়)</span>}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#2e7d32', marginTop: '4px' }}>
                    {pkg.price > 0 ? `৳${pkg.price}/মাস` : 'ফ্রি'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                    পণ্যের সীমা: {pkg.max_products == null ? 'আনলিমিটেড' : pkg.max_products} ·
                    Category: {pkg.max_categories == null ? 'আনলিমিটেড' : pkg.max_categories} ·
                    Sub-category: {pkg.max_subcategories == null ? 'আনলিমিটেড' : pkg.max_subcategories} ·
                    ক্রম: {pkg.sort_order}
                  </div>
                  {pkg.features_bn?.length > 0 && (
                    <ul style={{ margin: '8px 0 0', paddingLeft: '18px' }}>
                      {pkg.features_bn.map((f, i) => (
                        <li key={i} style={{ fontSize: '12px', color: '#555' }}>{f}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                  <button onClick={() => openEditForm(pkg)} style={{
                    background: '#e8f5e9', color: '#2d6a4f', border: 'none',
                    borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                  }}>এডিট</button>
                  <button onClick={() => toggleActive(pkg)} style={{
                    background: '#fff3e0', color: '#f4a300', border: 'none',
                    borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                  }}>{pkg.is_active ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}</button>
                  <button onClick={() => handleDelete(pkg.id)} disabled={deletingId === pkg.id} style={{
                    background: '#ffebee', color: '#c62828', border: 'none',
                    borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                  }}>{deletingId === pkg.id ? 'মুছছে...' : 'মুছুন'}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
