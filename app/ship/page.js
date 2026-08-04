'use client'
import { useState } from 'react'
import { supabaseFetch, getSession } from '@/lib/supabase'
import AgreementCheckbox from '@/components/AgreementCheckbox'

const COUNTRIES = [
  'Bangladesh', 'India', 'Nepal', 'USA', 'UK', 'Canada', 'Australia',
  'UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Oman', 'Bahrain',
  'Malaysia', 'Singapore', 'China', 'Japan', 'South Korea', 'Thailand',
  'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Sweden',
  'Pakistan', 'Sri Lanka', 'Myanmar', 'South Africa', 'Other',
]

const emptyCalc = { mode: 'international', from: 'Bangladesh', to: '', weight_kg: '', unit: 'kg', shipment_type: 'parcel' }
const emptyContact = {
  sender_name: '', sender_phone: '', sender_address: '',
  receiver_name: '', receiver_phone: '', receiver_address: '',
  declared_value: '', parcel_description: '',
}

export default function ShipPage() {
  const [step, setStep] = useState('calc') // calc | rates | contact | done
  const [calc, setCalc] = useState(emptyCalc)
  const [contact, setContact] = useState(emptyContact)
  const [error, setError] = useState('')
  const [loadingRates, setLoadingRates] = useState(false)
  const [quotes, setQuotes] = useState([])
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [booking, setBooking] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [bookingRef, setBookingRef] = useState(null)

  const inputStyle = {
    width: '100%', padding: '13px 14px', borderRadius: '10px',
    border: '1.5px solid #ddd', fontSize: '15px', boxSizing: 'border-box',
    background: 'white', color: '#333'
  }
  const labelStyle = { fontSize: '14px', color: '#222', display: 'block', marginBottom: '6px', fontWeight: '600' }
  const required = <span style={{ color: '#c62828' }}> *</span>

  const handleCalculate = async (e) => {
    e.preventDefault()
    setError('')
    if (calc.mode === 'domestic') return setError('Domestic rates are coming soon — please use International for now.')
    if (!calc.to) return setError('Please select a destination country')
    const weight = Number(calc.weight_kg)
    if (!weight || weight <= 0) return setError('Please enter a valid weight')

    setLoadingRates(true)
    try {
      const couriers = await supabaseFetch('couriers?select=*&is_active=eq.true&order=sort_order')
      const results = []
      for (const courier of couriers || []) {
        const rates = await supabaseFetch(
          `courier_rates?select=*&courier_id=eq.${courier.id}&is_active=eq.true&or=(country.eq.${encodeURIComponent(calc.to)},country.eq.ALL)&order=sort_order`
        )
        if (!rates || rates.length === 0) continue
        const rate = rates.find(r => r.country.toLowerCase() === calc.to.toLowerCase()) || rates.find(r => r.country === 'ALL')
        if (!rate) continue
        const extraWeight = Math.max(0, weight - Number(rate.free_weight_kg || 0))
        const charge = Number(rate.base_charge || 0) + extraWeight * Number(rate.per_kg_charge || 0)
        results.push({ courier, rate, charge: Math.round(charge) })
      }
      results.sort((a, b) => a.charge - b.charge)
      setQuotes(results)
      setStep('rates')
    } catch (e) {
      console.error(e)
      setError('Failed to load courier rates')
    }
    setLoadingRates(false)
  }

  const goToContact = () => {
    if (!selectedQuote) return
    setError('')
    setStep('contact')
  }

  const handleConfirmBooking = async (e) => {
    e.preventDefault()
    if (!selectedQuote) return
    setError('')
    if (!contact.sender_name.trim() || !contact.sender_phone.trim() || !contact.sender_address.trim()) return setError('Please fill in your (sender) details')
    if (!contact.receiver_name.trim() || !contact.receiver_phone.trim() || !contact.receiver_address.trim()) return setError('Please fill in the receiver details')
    if (!agreed) return setError('Please agree to the Shipping Terms to continue')

    setBooking(true)
    try {
      const session = getSession()
      const payload = {
        user_id: session?.user?.id || null,
        courier_id: selectedQuote.courier.id,
        courier_name: selectedQuote.courier.name,
        status: 'pending',
        sender_name: contact.sender_name.trim(),
        sender_phone: contact.sender_phone.trim(),
        sender_address: contact.sender_address.trim(),
        sender_country: calc.from,
        receiver_name: contact.receiver_name.trim(),
        receiver_phone: contact.receiver_phone.trim(),
        receiver_address: contact.receiver_address.trim(),
        receiver_country: calc.to,
        parcel_type: calc.shipment_type,
        weight_kg: Number(calc.weight_kg),
        parcel_description: contact.parcel_description.trim() || null,
        declared_value: contact.declared_value ? Number(contact.declared_value) : null,
        charge_amount: selectedQuote.charge,
      }
      const rows = await supabaseFetch('shipment_bookings', { method: 'POST', body: JSON.stringify(payload) })
      setBookingRef(rows?.[0]?.id || null)
      setStep('done')
    } catch (e) {
      console.error(e)
      setError('Failed to create booking, please try again')
    }
    setBooking(false)
  }

  const resetAll = () => {
    setCalc(emptyCalc)
    setContact(emptyContact)
    setQuotes([])
    setSelectedQuote(null)
    setBookingRef(null)
    setStep('calc')
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '28px 16px 60px' }}>

      {step === 'calc' && (
        <>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0a0a0a', textAlign: 'center', marginBottom: '22px' }}>
            Shipping Rates
          </h1>

          <div style={{
            display: 'flex', borderRadius: '999px', border: '1.5px solid #f4a300',
            overflow: 'hidden', marginBottom: '26px'
          }}>
            {[
              { key: 'international', label: 'International', icon: '✈️' },
              { key: 'domestic', label: 'Domestic', icon: '🚚' },
            ].map(m => (
              <button key={m.key} type="button" onClick={() => setCalc({ ...calc, mode: m.key })} style={{
                flex: 1, padding: '13px 10px', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                fontSize: '15px', fontWeight: '600',
                background: calc.mode === m.key ? '#f4a300' : 'white',
                color: calc.mode === m.key ? '#0a0a0a' : '#f4a300',
              }}>
                <span>{m.icon}</span> {m.label}
              </button>
            ))}
          </div>

          {error && (
            <div style={{
              margin: '0 0 18px', padding: '10px 12px',
              background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
            }}>{error}</div>
          )}

          <form onSubmit={handleCalculate}>
            <div style={{ marginBottom: '22px' }}>
              <label style={labelStyle}>From{required}</label>
              <select style={inputStyle} value={calc.from} onChange={e => setCalc({ ...calc, from: e.target.value })}>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label style={labelStyle}>To{required}</label>
              <select style={inputStyle} value={calc.to} onChange={e => setCalc({ ...calc, to: e.target.value })}>
                <option value="">Start typing the country name</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label style={labelStyle}>Weight{required}</label>
              <input type="number" step="0.1" min="0" style={inputStyle} value={calc.weight_kg}
                onChange={e => setCalc({ ...calc, weight_kg: e.target.value })} placeholder="0" />
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label style={labelStyle}>Unit{required}</label>
              <select style={inputStyle} value={calc.unit} onChange={e => setCalc({ ...calc, unit: e.target.value })}>
                <option value="kg">Kg</option>
              </select>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={labelStyle}>Shipment Type{required}</label>
              <select style={inputStyle} value={calc.shipment_type} onChange={e => setCalc({ ...calc, shipment_type: e.target.value })}>
                <option value="documents">Document(s)</option>
                <option value="parcel">Parcel(s)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={loadingRates} style={{
                background: loadingRates ? '#4a4a4a' : '#0a0a0a', color: 'white', border: 'none',
                borderRadius: '999px', padding: '14px 34px', fontSize: '16px', fontWeight: '700'
              }}>{loadingRates ? 'Calculating...' : 'Calculate'}</button>
            </div>
          </form>
        </>
      )}

      {step === 'rates' && (
        <div>
          <button onClick={() => setStep('calc')} style={{
            background: 'transparent', border: 'none', color: '#666', fontSize: '13px', padding: 0, marginBottom: '14px'
          }}>← Edit search</button>

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0a0a0a', marginBottom: '4px' }}>
            {calc.from} → {calc.to}
          </h2>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '18px' }}>
            {calc.weight_kg} kg · {calc.shipment_type === 'documents' ? 'Document(s)' : 'Parcel(s)'}
          </p>

          {error && (
            <div style={{
              margin: '0 0 16px', padding: '10px 12px',
              background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
            }}>{error}</div>
          )}

          {quotes.length === 0 ? (
            <div style={{ color: '#999', fontSize: '13px', background: 'white', borderRadius: '10px', border: '1px solid #eee', padding: '20px' }}>
              No courier rate available for this destination right now. Please try a different country or contact support.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {quotes.map(q => (
                <div key={q.courier.id} onClick={() => setSelectedQuote(q)} style={{
                  background: selectedQuote?.courier.id === q.courier.id ? '#fff3e0' : 'white',
                  border: selectedQuote?.courier.id === q.courier.id ? '1.5px solid #f4a300' : '1px solid #eee',
                  borderRadius: '10px', padding: '14px 16px', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px'
                }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#0a0a0a' }}>{q.courier.name}</div>
                    {q.courier.description && <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{q.courier.description}</div>}
                  </div>
                  <div style={{ fontSize: '17px', fontWeight: '700', color: '#f4a300', whiteSpace: 'nowrap' }}>৳{q.charge}</div>
                </div>
              ))}

              <button onClick={goToContact} disabled={!selectedQuote} style={{
                marginTop: '10px', width: '100%',
                background: !selectedQuote ? '#a9a9a9' : '#0a0a0a', color: 'white', border: 'none',
                borderRadius: '10px', padding: '13px', fontSize: '15px', fontWeight: '700'
              }}>{selectedQuote ? `Continue with ${selectedQuote.courier.name} — ৳${selectedQuote.charge}` : 'Select a courier'}</button>
            </div>
          )}
        </div>
      )}

      {step === 'contact' && (
        <div>
          <button onClick={() => setStep('rates')} style={{
            background: 'transparent', border: 'none', color: '#666', fontSize: '13px', padding: 0, marginBottom: '14px'
          }}>← Back to rates</button>

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0a0a0a', marginBottom: '16px' }}>
            Sender &amp; Receiver Details
          </h2>

          {error && (
            <div style={{
              margin: '0 0 16px', padding: '10px 12px',
              background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
            }}>{error}</div>
          )}

          <form onSubmit={handleConfirmBooking} style={{ background: 'white', borderRadius: '12px', border: '1px solid #eee', padding: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#163a2c', margin: '0 0 10px' }}>Sender (you) — {calc.from}</div>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Full Name *</label>
              <input style={inputStyle} value={contact.sender_name} onChange={e => setContact({ ...contact, sender_name: e.target.value })} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Phone *</label>
              <input style={inputStyle} value={contact.sender_phone} onChange={e => setContact({ ...contact, sender_phone: e.target.value })} />
            </div>
            <div style={{ marginBottom: '18px' }}>
              <label style={labelStyle}>Pickup Address *</label>
              <input style={inputStyle} value={contact.sender_address} onChange={e => setContact({ ...contact, sender_address: e.target.value })} />
            </div>

            <div style={{ fontSize: '13px', fontWeight: '700', color: '#163a2c', margin: '0 0 10px' }}>Receiver — {calc.to}</div>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Full Name *</label>
              <input style={inputStyle} value={contact.receiver_name} onChange={e => setContact({ ...contact, receiver_name: e.target.value })} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Phone *</label>
              <input style={inputStyle} value={contact.receiver_phone} onChange={e => setContact({ ...contact, receiver_phone: e.target.value })} />
            </div>
            <div style={{ marginBottom: '18px' }}>
              <label style={labelStyle}>Delivery Address *</label>
              <input style={inputStyle} value={contact.receiver_address} onChange={e => setContact({ ...contact, receiver_address: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
              <div>
                <label style={labelStyle}>Declared Value (৳)</label>
                <input type="number" style={inputStyle} value={contact.declared_value} onChange={e => setContact({ ...contact, declared_value: e.target.value })} placeholder="optional" />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <input style={inputStyle} value={contact.parcel_description} onChange={e => setContact({ ...contact, parcel_description: e.target.value })} placeholder="optional" />
              </div>
            </div>

            <div style={{ margin: '4px 0 14px' }}>
              <AgreementCheckbox type="ship" checked={agreed} onChange={setAgreed} />
            </div>

            <button type="submit" disabled={booking} style={{
              width: '100%', background: booking ? '#a9a9a9' : '#0a0a0a', color: 'white', border: 'none',
              borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: '700'
            }}>{booking ? 'Booking...' : `Confirm Booking — ৳${selectedQuote?.charge}`}</button>
          </form>
        </div>
      )}

      {step === 'done' && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #eee', padding: '28px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>✅</div>
          <div style={{ fontSize: '17px', fontWeight: '700', color: '#0a0a0a', marginBottom: '6px' }}>Shipment Booked</div>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '4px' }}>
            Booked with <b>{selectedQuote?.courier.name}</b> for ৳{selectedQuote?.charge}.
          </p>
          {bookingRef && (
            <p style={{ color: '#aaa', fontSize: '12px', marginBottom: '18px' }}>Booking ID: {bookingRef}</p>
          )}
          <button onClick={resetAll} style={{
            background: '#0a0a0a', color: 'white', border: 'none',
            borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600'
          }}>Book Another Shipment</button>
        </div>
      )}
    </div>
  )
}
