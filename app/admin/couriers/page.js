'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

const emptyCourierForm = { name: '', type: 'manual', description: '', sort_order: '0', is_active: true }
const emptyRateForm = { country: '', base_charge: '0', free_weight_kg: '0', per_kg_charge: '0', sort_order: '0', is_active: true }

export default function AdminCouriersPage() {
  const [couriers, setCouriers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showCourierForm, setShowCourierForm] = useState(false)
  const [editingCourierId, setEditingCourierId] = useState(null)
  const [courierForm, setCourierForm] = useState(emptyCourierForm)
  const [savingCourier, setSavingCourier] = useState(false)

  const [selectedCourierId, setSelectedCourierId] = useState(null)
  const [rates, setRates] = useState([])
  const [ratesLoading, setRatesLoading] = useState(false)
  const [showRateForm, setShowRateForm] = useState(false)
  const [editingRateId, setEditingRateId] = useState(null)
  const [rateForm, setRateForm] = useState(emptyRateForm)
  const [savingRate, setSavingRate] = useState(false)

  async function loadCouriers() {
    setLoading(true)
    setError('')
    try {
      const data = await supabaseFetch('couriers?select=*&order=sort_order')
      setCouriers(data || [])
    } catch (e) {
      console.error(e)
      setError('Failed to load couriers')
    }
    setLoading(false)
  }

  useEffect(() => { loadCouriers() }, [])

  async function loadRates(courierId) {
    setRatesLoading(true)
    try {
      const data = await supabaseFetch(`courier_rates?select=*&courier_id=eq.${courierId}&order=sort_order`)
      setRates(data || [])
    } catch (e) {
      console.error(e)
      setError('Failed to load rates')
    }
    setRatesLoading(false)
  }

  const selectCourier = (id) => {
    setSelectedCourierId(id)
    setShowRateForm(false)
    setEditingRateId(null)
    loadRates(id)
  }

  // ---------- Courier CRUD ----------
  const openNewCourierForm = () => {
    setEditingCourierId(null)
    setCourierForm(emptyCourierForm)
    setShowCourierForm(true)
  }

  const openEditCourierForm = (c) => {
    setEditingCourierId(c.id)
    setCourierForm({
      name: c.name || '',
      type: c.type || 'manual',
      description: c.description || '',
      sort_order: String(c.sort_order ?? '0'),
      is_active: c.is_active !== false,
    })
    setShowCourierForm(true)
  }

  const closeCourierForm = () => {
    setShowCourierForm(false)
    setEditingCourierId(null)
    setCourierForm(emptyCourierForm)
  }

  const handleSaveCourier = async (e) => {
    e.preventDefault()
    setError('')
    if (!courierForm.name.trim()) return setError('Please enter a courier name')

    setSavingCourier(true)
    try {
      const payload = {
        name: courierForm.name.trim(),
        type: courierForm.type,
        description: courierForm.description.trim() || null,
        sort_order: Number(courierForm.sort_order) || 0,
        is_active: courierForm.is_active,
      }
      if (editingCourierId) {
        await supabaseFetch(`couriers?id=eq.${editingCourierId}`, { method: 'PATCH', body: JSON.stringify(payload) })
      } else {
        await supabaseFetch('couriers', { method: 'POST', body: JSON.stringify(payload) })
      }
      closeCourierForm()
      await loadCouriers()
    } catch (e) {
      console.error(e)
      setError('Failed to save courier')
    }
    setSavingCourier(false)
  }

  const handleDeleteCourier = async (id) => {
    if (!confirm('Delete this courier and all its rates?')) return
    try {
      await supabaseFetch(`couriers?id=eq.${id}`, { method: 'DELETE' })
      if (selectedCourierId === id) {
        setSelectedCourierId(null)
        setRates([])
      }
      await loadCouriers()
    } catch (e) {
      console.error(e)
      setError('Failed to delete courier')
    }
  }

  const toggleCourierActive = async (c) => {
    try {
      await supabaseFetch(`couriers?id=eq.${c.id}`, { method: 'PATCH', body: JSON.stringify({ is_active: !c.is_active }) })
      await loadCouriers()
    } catch (e) {
      console.error(e)
      setError('Failed to change status')
    }
  }

  // ---------- Rate CRUD ----------
  const openNewRateForm = () => {
    setEditingRateId(null)
    setRateForm(emptyRateForm)
    setShowRateForm(true)
  }

  const openEditRateForm = (r) => {
    setEditingRateId(r.id)
    setRateForm({
      country: r.country || '',
      base_charge: String(r.base_charge ?? '0'),
      free_weight_kg: String(r.free_weight_kg ?? '0'),
      per_kg_charge: String(r.per_kg_charge ?? '0'),
      sort_order: String(r.sort_order ?? '0'),
      is_active: r.is_active !== false,
    })
    setShowRateForm(true)
  }

  const closeRateForm = () => {
    setShowRateForm(false)
    setEditingRateId(null)
    setRateForm(emptyRateForm)
  }

  const handleSaveRate = async (e) => {
    e.preventDefault()
    setError('')
    if (!rateForm.country.trim()) return setError('Please enter a country name (or ALL for a flat rate)')
    if (!selectedCourierId) return

    setSavingRate(true)
    try {
      const payload = {
        courier_id: selectedCourierId,
        country: rateForm.country.trim(),
        base_charge: Number(rateForm.base_charge) || 0,
        free_weight_kg: Number(rateForm.free_weight_kg) || 0,
        per_kg_charge: Number(rateForm.per_kg_charge) || 0,
        sort_order: Number(rateForm.sort_order) || 0,
        is_active: rateForm.is_active,
      }
      if (editingRateId) {
        await supabaseFetch(`courier_rates?id=eq.${editingRateId}`, { method: 'PATCH', body: JSON.stringify(payload) })
      } else {
        await supabaseFetch('courier_rates', { method: 'POST', body: JSON.stringify(payload) })
      }
      closeRateForm()
      await loadRates(selectedCourierId)
    } catch (e) {
      console.error(e)
      setError('Failed to save rate')
    }
    setSavingRate(false)
  }

  const handleDeleteRate = async (id) => {
    if (!confirm('Delete this rate?')) return
    try {
      await supabaseFetch(`courier_rates?id=eq.${id}`, { method: 'DELETE' })
      await loadRates(selectedCourierId)
    } catch (e) {
      console.error(e)
      setError('Failed to delete rate')
    }
  }

  const toggleRateActive = async (r) => {
    try {
      await supabaseFetch(`courier_rates?id=eq.${r.id}`, { method: 'PATCH', body: JSON.stringify({ is_active: !r.is_active }) })
      await loadRates(selectedCourierId)
    } catch (e) {
      console.error(e)
      setError('Failed to change status')
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1.5px solid #9ca3af', fontSize: '14px', boxSizing: 'border-box'
  }
  const labelStyle = { fontSize: '12px', color: '#333', display: 'block', marginBottom: '5px', fontWeight: '600' }

  const selectedCourier = couriers.find(c => c.id === selectedCourierId)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0a0a0a', marginBottom: '4px' }}>Couriers</h1>
          <p style={{ color: '#888', fontSize: '14px', maxWidth: '640px' }}>
            Manage couriers available on the Book Shipment page. For each courier, add rates per destination country
            (use country <b>ALL</b> for a flat rate regardless of destination). Rate = Base + (extra weight over the free allowance × per-kg rate).
          </p>
        </div>
        {!showCourierForm && (
          <button onClick={openNewCourierForm} style={{
            background: '#0a0a0a', color: 'white', border: 'none', borderRadius: '8px',
            padding: '10px 18px', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap'
          }}>+ New Courier</button>
        )}
      </div>

      {error && (
        <div style={{
          maxWidth: '600px', margin: '16px 0', padding: '10px 12px',
          background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
        }}>{error}</div>
      )}

      {showCourierForm && (
        <form onSubmit={handleSaveCourier} style={{
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
          padding: '20px', marginBottom: '24px', maxWidth: '560px'
        }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#0a0a0a', marginBottom: '14px' }}>
            {editingCourierId ? 'Edit Courier' : 'New Courier'}
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Courier Name *</label>
            <input style={inputStyle} value={courierForm.name} onChange={e => setCourierForm({ ...courierForm, name: e.target.value })} placeholder="e.g. DHL, EMS, Bangladesh Post Office" />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Description</label>
            <input style={inputStyle} value={courierForm.description} onChange={e => setCourierForm({ ...courierForm, description: e.target.value })} placeholder="short note, optional" />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Sort Order</label>
            <input type="number" style={inputStyle} value={courierForm.sort_order} onChange={e => setCourierForm({ ...courierForm, sort_order: e.target.value })} />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#444', marginBottom: '16px' }}>
            <input type="checkbox" checked={courierForm.is_active} onChange={e => setCourierForm({ ...courierForm, is_active: e.target.checked })} />
            Active
          </label>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={savingCourier} style={{
              background: savingCourier ? '#a9a9a9' : '#0a0a0a', color: 'white', border: 'none',
              borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600'
            }}>{savingCourier ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={closeCourierForm} style={{
              background: '#f0f0f0', color: '#555', border: 'none',
              borderRadius: '8px', padding: '10px 20px', fontSize: '14px'
            }}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>Loading...</div>
      ) : couriers.length === 0 ? (
        <div style={{ color: '#999', fontSize: '13px' }}>No couriers yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '760px', marginBottom: '28px' }}>
          {couriers.map(c => (
            <div key={c.id} onClick={() => selectCourier(c.id)} style={{
              background: selectedCourierId === c.id ? '#fff8ec' : 'white',
              borderRadius: '10px', border: selectedCourierId === c.id ? '1.5px solid #f4a300' : '1px solid #e0e0e0',
              padding: '14px 16px', opacity: c.is_active ? 1 : 0.6, cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap'
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0a0a0a' }}>
                  {c.name} {!c.is_active && <span style={{ fontSize: '11px', color: '#c62828', fontWeight: '600' }}>(Inactive)</span>}
                </div>
                {c.description && (
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{c.description}</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                <button onClick={() => openEditCourierForm(c)} style={{
                  background: '#f5f5f5', color: '#333', border: 'none',
                  borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                }}>Edit</button>
                <button onClick={() => toggleCourierActive(c)} style={{
                  background: '#fff3e0', color: '#f4a300', border: 'none',
                  borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                }}>{c.is_active ? 'Deactivate' : 'Activate'}</button>
                <button onClick={() => handleDeleteCourier(c.id)} style={{
                  background: '#ffebee', color: '#c62828', border: 'none',
                  borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCourier && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#0a0a0a' }}>
              Rates for {selectedCourier.name}
            </h2>
            {!showRateForm && (
              <button onClick={openNewRateForm} style={{
                background: '#2d6a4f', color: 'white', border: 'none', borderRadius: '8px',
                padding: '9px 16px', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap'
              }}>+ New Rate</button>
            )}
          </div>

          {showRateForm && (
            <form onSubmit={handleSaveRate} style={{
              background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
              padding: '20px', marginBottom: '20px', maxWidth: '560px'
            }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#0a0a0a', marginBottom: '14px' }}>
                {editingRateId ? 'Edit Rate' : 'New Rate'}
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Destination Country *</label>
                <input style={inputStyle} value={rateForm.country} onChange={e => setRateForm({ ...rateForm, country: e.target.value })} placeholder="e.g. USA, UK, or ALL for a flat rate" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={labelStyle}>Base Charge (৳)</label>
                  <input type="number" style={inputStyle} value={rateForm.base_charge} onChange={e => setRateForm({ ...rateForm, base_charge: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Sort Order</label>
                  <input type="number" style={inputStyle} value={rateForm.sort_order} onChange={e => setRateForm({ ...rateForm, sort_order: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={labelStyle}>Free Weight (kg)</label>
                  <input type="number" style={inputStyle} value={rateForm.free_weight_kg} onChange={e => setRateForm({ ...rateForm, free_weight_kg: e.target.value })} placeholder="weight included in base charge" />
                </div>
                <div>
                  <label style={labelStyle}>Charge per extra Kg (৳)</label>
                  <input type="number" style={inputStyle} value={rateForm.per_kg_charge} onChange={e => setRateForm({ ...rateForm, per_kg_charge: e.target.value })} />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#444', marginBottom: '16px' }}>
                <input type="checkbox" checked={rateForm.is_active} onChange={e => setRateForm({ ...rateForm, is_active: e.target.checked })} />
                Active
              </label>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={savingRate} style={{
                  background: savingRate ? '#a9a9a9' : '#2d6a4f', color: 'white', border: 'none',
                  borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600'
                }}>{savingRate ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={closeRateForm} style={{
                  background: '#f0f0f0', color: '#555', border: 'none',
                  borderRadius: '8px', padding: '10px 20px', fontSize: '14px'
                }}>Cancel</button>
              </div>
            </form>
          )}

          {ratesLoading ? (
            <div style={{ color: '#888', fontSize: '14px' }}>Loading rates...</div>
          ) : rates.length === 0 ? (
            <div style={{ color: '#999', fontSize: '13px' }}>No rates yet for this courier — add one per country, or ALL for a flat rate.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '760px' }}>
              {rates.map(r => (
                <div key={r.id} style={{
                  background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
                  padding: '14px 16px', opacity: r.is_active ? 1 : 0.6,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap'
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#0a0a0a' }}>
                      {r.country === 'ALL' ? 'ALL (flat rate)' : r.country} {!r.is_active && <span style={{ fontSize: '11px', color: '#c62828', fontWeight: '600' }}>(Inactive)</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                      Base ৳{r.base_charge} · first {r.free_weight_kg}kg free · then ৳{r.per_kg_charge}/kg
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button onClick={() => openEditRateForm(r)} style={{
                      background: '#f5f5f5', color: '#333', border: 'none',
                      borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                    }}>Edit</button>
                    <button onClick={() => toggleRateActive(r)} style={{
                      background: '#fff3e0', color: '#f4a300', border: 'none',
                      borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                    }}>{r.is_active ? 'Deactivate' : 'Activate'}</button>
                    <button onClick={() => handleDeleteRate(r.id)} style={{
                      background: '#ffebee', color: '#c62828', border: 'none',
                      borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                    }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
