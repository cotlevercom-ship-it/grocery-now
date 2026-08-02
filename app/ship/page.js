'use client'
import { useState } from 'react'
import { supabaseFetch, getSession } from '@/lib/supabase'

const COUNTRIES = [
  'Bangladesh', 'India', 'Nepal', 'USA', 'UK', 'Canada', 'Australia',
  'UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Oman', 'Bahrain',
  'Malaysia', 'Singapore', 'China', 'Japan', 'South Korea', 'Thailand',
  'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Sweden',
  'Pakistan', 'Sri Lanka', 'Myanmar', 'South Africa', 'Other',
]

const emptyDetails = {
  sender_name: '', sender_phone: '', sender_address: '', sender_country: 'Bangladesh',
  receiver_name: '', receiver_phone: '', receiver_address: '', receiver_country: '',
  weight_kg: '', parcel_description: '', declared_value: '',
}

export default function ShipPage() {
  const [step, setStep] = useState('form') // form | rates | booking | done
  const [details, setDetails] = useState(emptyDetails)
  const [error, setError] = useState('')
  const [loadingRates, setLoadingRates] = useState(false)
  const [quotes, setQuotes] = useState([])
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [booking, setBooking] = useState(false)
  const [bookingRef, setBookingRef] = useState(null)

  const inputStyle = {
    width: '100%', padding: '11px 12px', borderRadius: '8px',
    border: '1.5px solid #d0d0d0', fontSize: '14px', boxSizing: 'border-box'
  }
  const labelStyle = { fontSize: '12px', color: '#333', display: 'block', marginBottom: '5px', fontWeight: '600' }

  const handleGetRates = async (e) => {
    e.preventDefault()
    setError('')
    if (!details.receiver_country.trim()) return setError('Please enter the destination country')
    const weight = Number(details.weight_kg)
    if (!weight || weight <= 0) return setError('Please enter a valid parcel weight')
    if (!details.sender_name.trim() || !details.sender_phone.trim() || !details.sender_address.trim()) return setError('Please fill in your (sender) details')
    if (!details.receiver_name.trim() || !details.receiver_phone.trim() || !details.receiver_address.trim()) return setError('Please fill in the receiver details')

    setLoadingRates(true)
    try {
      const couriers = await supabaseFetch('couriers?select=*&is_active=eq.true&order=sort_order')
      const country = details.receiver_country.trim()
      const results = []
      for (const courier of couriers || []) {
        const rates = await supabaseFetch(
          `courier_rates?select=*&courier_id=eq.${courier.id}&is_active=eq.true&or=(country.eq.${encodeURIComponent(country)},country.eq.ALL)&order=sort_order`
        )
        if (!rates || rates.length === 0) continue
        // prefer an exact country match over the ALL fallback
        const rate = rates.find(r => r.country.toLowerCase() === country.toLowerCase()) || rates.find(r => r.country === 'ALL')
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

  const handleConfirmBooking = async () => {
    if (!selectedQuote) return
    setBooking(true)
    setError('')
    try {
      const session = getSession()
      const payload = {
        user_id: session?.user?.id || null,
        courier_id: selectedQuote.courier.id,
        courier_name: selectedQuote.courier.name,
        status: 'pending',
        sender_name: details.sender_name.trim(),
        sender_phone: details.sender_phone.trim(),
        sender_address: details.sender_address.trim(),
        sender_country: details.sender_country.trim() || 'Bangladesh',
        receiver_name: details.receiver_name.trim(),
        receiver_phone: details.receiver_phone.trim(),
        receiver_address: details.receiver_address.trim(),
        receiver_country: details.receiver_country.trim(),
        weight_kg: Number(details.weight_kg),
        parcel_description: details.parcel_description.trim() || null,
        declared_value: details.declared_value ? Number(details.declared_value) : null,
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
    setDetails(emptyDetails)
    setQuotes([])
    setSelectedQuote(null)
    setBookingRef(null)
    setStep('form')
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '20px 16px 60px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0a0a0a', marginBottom: '4px' }}>Book Shipment</h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        Compare courier rates and book a parcel — no shop or seller account needed.
      </p>

      {error && (
        <div style={{
          margin: '0 0 16px', padding: '10px 12px',
          background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
        }}>{error}</div>
      )}

      {step === 'form' && (
        <form onSubmit={handleGetRates} style={{ background: 'white', borderRadius: '12px', border: '1px solid #eee', padding: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#163a2c', margin: '0 0 10px' }}>Sender (you)</div>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Full Name *</label>
            <input style={inputStyle} value={details.sender_name} onChange={e => setDetails({ ...details, sender_name: e.target.value })} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Phone *</label>
            <input style={inputStyle} value={details.sender_phone} onChange={e => setDetails({ ...details, sender_phone: e.target.value })} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Pickup Address *</label>
            <input style={inputStyle} value={details.sender_address} onChange={e => setDetails({ ...details, sender_address: e.target.value })} />
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Sender Country</label>
            <select style={inputStyle} value={details.sender_country} onChange={e => setDetails({ ...details, sender_country: e.target.value })}>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ fontSize: '13px', fontWeight: '700', color: '#163a2c', margin: '0 0 10px' }}>Receiver</div>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Full Name *</label>
            <input style={inputStyle} value={details.receiver_name} onChange={e => setDetails({ ...details, receiver_name: e.target.value })} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Phone *</label>
            <input style={inputStyle} value={details.receiver_phone} onChange={e => setDetails({ ...details, receiver_phone: e.target.value })} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Delivery Address *</label>
            <input style={inputStyle} value={details.receiver_address} onChange={e => setDetails({ ...details, receiver_address: e.target.value })} />
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Destination Country *</label>
            <select style={inputStyle} value={details.receiver_country} onChange={e => setDetails({ ...details, receiver_country: e.target.value })}>
              <option value="">Select a country</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ fontSize: '13px', fontWeight: '700', color: '#163a2c', margin: '0 0 10px' }}>Parcel</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>Weight (kg) *</label>
              <input type="number" step="0.1" style={inputStyle} value={details.weight_kg} onChange={e => setDetails({ ...details, weight_kg: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Declared Value (৳)</label>
              <input type="number" style={inputStyle} value={details.declared_value} onChange={e => setDetails({ ...details, declared_value: e.target.value })} placeholder="optional" />
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Parcel Description</label>
            <input style={inputStyle} value={details.parcel_description} onChange={e => setDetails({ ...details, parcel_description: e.target.value })} placeholder="what's inside, optional" />
          </div>

          <button type="submit" disabled={loadingRates} style={{
            width: '100%', background: loadingRates ? '#a9a9a9' : '#0a0a0a', color: 'white', border: 'none',
            borderRadius: '10px', padding: '13px', fontSize: '15px', fontWeight: '700'
          }}>{loadingRates ? 'Fetching rates...' : 'Get Courier Rates'}</button>
        </form>
      )}

      {step === 'rates' && (
        <div>
          <button onClick={() => setStep('form')} style={{
            background: 'transparent', border: 'none', color: '#666', fontSize: '13px', padding: 0, marginBottom: '14px'
          }}>← Edit details</button>

          {quotes.length === 0 ? (
            <div style={{ color: '#999', fontSize: '13px', background: 'white', borderRadius: '10px', border: '1px solid #eee', padding: '20px' }}>
              No courier rate available for this destination right now. Please try a different country or contact support.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {quotes.map(q => (
                <div key={q.courier.id} onClick={() => setSelectedQuote(q)} style={{
                  background: selectedQuote?.courier.id === q.courier.id ? '#fff8ec' : 'white',
                  border: selectedQuote?.courier.id === q.courier.id ? '1.5px solid #f4a300' : '1px solid #eee',
                  borderRadius: '10px', padding: '14px 16px', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px'
                }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#0a0a0a' }}>{q.courier.name}</div>
                    {q.courier.description && <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{q.courier.description}</div>}
                  </div>
                  <div style={{ fontSize: '17px', fontWeight: '700', color: '#2d6a4f', whiteSpace: 'nowrap' }}>৳{q.charge}</div>
                </div>
              ))}

              <button onClick={handleConfirmBooking} disabled={!selectedQuote || booking} style={{
                marginTop: '10px', width: '100%',
                background: (!selectedQuote || booking) ? '#a9a9a9' : '#0a0a0a', color: 'white', border: 'none',
                borderRadius: '10px', padding: '13px', fontSize: '15px', fontWeight: '700'
              }}>{booking ? 'Booking...' : selectedQuote ? `Book with ${selectedQuote.courier.name} — ৳${selectedQuote.charge}` : 'Select a courier'}</button>
            </div>
          )}
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
