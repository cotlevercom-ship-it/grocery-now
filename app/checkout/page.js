'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabaseFetch, getSession } from '@/lib/supabase'

export default function CheckoutPage() {
  const router = useRouter()
  const [cartData, setCartData] = useState(null)
  const [shop, setShop] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [session, setSession] = useState(null)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [country, setCountry] = useState('Bangladesh')
  const [shippingRules, setShippingRules] = useState([])
  const [selectedRuleId, setSelectedRuleId] = useState(null)
  const [areaId, setAreaId] = useState(null)
  const [areaName, setAreaName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [deliveryMethod, setDeliveryMethod] = useState('delivery') // 'delivery' | 'pickup'
  const [note, setNote] = useState('')

  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('new') // address id, or 'new'
  const [saveNewAddress, setSaveNewAddress] = useState(true)

  useEffect(() => {
    async function init() {
      try {
        const savedCart = localStorage.getItem('cart')
        if (!savedCart) {
          router.replace('/cart')
          return
        }
        const parsed = JSON.parse(savedCart)
        if (!parsed.items || parsed.items.length === 0) {
          router.replace('/cart')
          return
        }
        setCartData(parsed)

        // fetch shop for pickup/store details
        const shops = await supabaseFetch(`shops?select=*&id=eq.${parsed.shopId}`)
        if (shops && shops.length > 0) {
          setShop(shops[0])
        }

        // fetch platform shipping rules (Cot Lever sets these centrally, not the seller)
        try {
          const rules = await supabaseFetch('shipping_rules?select=*&is_active=eq.true')
          setShippingRules(rules || [])
        } catch (e) {
          console.error(e)
        }

        // prefill area from navbar selection
        const savedArea = localStorage.getItem('selectedArea')
        if (savedArea) {
          const area = JSON.parse(savedArea)
          setAreaId(area.id)
          setAreaName(area.name)
        }

        // if logged in, prefill from saved profile
        const currentSession = getSession()
        setSession(currentSession)
        if (currentSession?.user?.id) {
          try {
            const profiles = await supabaseFetch(`user_profiles?select=*&id=eq.${currentSession.user.id}`)
            if (profiles && profiles.length > 0) {
              const profile = profiles[0]
              if (profile.full_name) setName(profile.full_name)
              if (profile.phone) setPhone(profile.phone)
            }
          } catch (e) {
            console.error(e)
          }

          try {
            const addrRows = await supabaseFetch(
              `user_addresses?select=*&user_id=eq.${currentSession.user.id}&order=is_default.desc,created_at.desc`
            )
            setSavedAddresses(addrRows || [])
            const defaultAddr = (addrRows || []).find(a => a.is_default) || (addrRows || [])[0]
            if (defaultAddr) {
              setSelectedAddressId(defaultAddr.id)
              if (defaultAddr.country) setCountry(defaultAddr.country)
            }
          } catch (e) {
            console.error(e)
          }
        }
      } catch (e) {
        console.error(e)
      }
      setLoaded(true)
    }
    init()
  }, [router])

  useEffect(() => {
    if (deliveryMethod === 'pickup') return
    const countryMatches = shippingRules.filter(r => r.country.toLowerCase() === country.trim().toLowerCase())
    const options = countryMatches.length > 0 ? countryMatches : shippingRules.filter(r => r.country === 'OTHER')
    if (options.length > 0 && !options.some(r => r.id === selectedRuleId)) {
      setSelectedRuleId(options[0].id)
    }
  }, [country, deliveryMethod, shippingRules, selectedRuleId])

  if (!loaded || !cartData) {
    return null
  }

  const subtotal = cartData.items.reduce((a, b) => a + b.qty * b.price, 0)
  const totalWeightKg = cartData.items.reduce((a, b) => a + ((b.weightGrams || 0) * b.qty), 0) / 1000
  const totalItems = cartData.items.reduce((a, b) => a + b.qty, 0)

  // A country can have several rules (one per courier, e.g. EMS vs Bangladesh Post Office).
  // Match on the exact country first; if none, fall back to the OTHER (rest-of-world) rules.
  const countryMatches = shippingRules.filter(r => r.country.toLowerCase() === country.trim().toLowerCase())
  const matchedRules = deliveryMethod === 'pickup' ? [] : (
    countryMatches.length > 0 ? countryMatches : shippingRules.filter(r => r.country === 'OTHER')
  )

  const ruleCharge = (r) => Math.round(
    Number(r.base_charge)
    + Math.max(0, totalWeightKg - Number(r.free_weight_kg)) * Number(r.per_kg_charge)
    + Math.max(0, totalItems - Number(r.free_item_count)) * Number(r.per_item_charge)
  )

  const selectedRule = matchedRules.find(r => r.id === selectedRuleId) || matchedRules[0] || null
  const deliveryCharge = deliveryMethod === 'pickup' || !selectedRule ? 0 : ruleCharge(selectedRule)
  const total = subtotal + deliveryCharge

  // Country dropdown options come from whatever countries admin has set up shipping rules for.
  const countryOptions = Array.from(new Set([
    ...shippingRules.map(r => r.country),
    country,
  ].filter(Boolean))).sort((a, b) => {
    if (a === 'OTHER') return 1
    if (b === 'OTHER') return -1
    return a.localeCompare(b)
  })

  const usingSavedAddress = deliveryMethod === 'delivery' && selectedAddressId !== 'new'
  const selectedAddress = usingSavedAddress ? savedAddresses.find(a => a.id === selectedAddressId) : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const deliveryAddressText = deliveryMethod === 'pickup'
      ? (shop?.pickup_address || '')
      : (usingSavedAddress ? (selectedAddress?.address || '') : address.trim())

    if (!name.trim() || !phone.trim() || (deliveryMethod === 'delivery' && !deliveryAddressText.trim())) {
      setError('Name, phone number and address are required')
      return
    }

    setSubmitting(true)
    try {
      // create order (user_id set only when logged in; null means guest order)
      const orderRes = await supabaseFetch('orders', {
        method: 'POST',
        body: JSON.stringify({
          user_id: session?.user?.id || null,
          shop_id: cartData.shopId,
          area_id: areaId,
          delivery_name: name.trim(),
          delivery_phone: phone.trim(),
          delivery_address: deliveryMethod === 'pickup' ? (shop?.pickup_address || null) : deliveryAddressText,
          delivery_method: deliveryMethod,
          delivery_country: deliveryMethod === 'pickup' ? null : country.trim(),
          courier_name: deliveryMethod === 'pickup' ? null : (selectedRule?.courier_name || null),
          subtotal: subtotal,
          delivery_charge: deliveryCharge,
          discount: 0,
          total: total,
          payment_method: paymentMethod,
          payment_status: 'unpaid',
          status: 'pending',
          tracking_history: [{ status: 'pending', note: 'Order placed', time: new Date().toISOString() }],
          note: note.trim() || null,
        }),
      })

      const order = orderRes[0]

      // save/update profile name+phone for logged-in users (best-effort, ignore failures)
      if (session?.user?.id) {
        try {
          await supabaseFetch(`user_profiles`, {
            method: 'POST',
            headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
            body: JSON.stringify({
              id: session.user.id,
              full_name: name.trim(),
              phone: phone.trim(),
              default_area_id: areaId,
            }),
          })
        } catch (e) {
          console.error(e)
        }
      }

      // save a freshly-typed address to the address book (best-effort, ignore failures)
      if (session?.user?.id && deliveryMethod === 'delivery' && !usingSavedAddress && saveNewAddress && address.trim()) {
        try {
          await supabaseFetch('user_addresses', {
            method: 'POST',
            body: JSON.stringify({
              user_id: session.user.id,
              address: address.trim(),
              country: country.trim() || 'Bangladesh',
              is_default: savedAddresses.length === 0,
            }),
          })
        } catch (e) {
          console.error(e)
        }
      }

      // create order items
      const itemsPayload = cartData.items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_unit: item.unit || null,
        variant_id: item.variantId || null,
        variant_name: item.variantName || null,
        quantity: item.qty,
        unit_price: item.price,
        total_price: item.price * item.qty,
      }))

      await supabaseFetch('order_items', {
        method: 'POST',
        body: JSON.stringify(itemsPayload),
      })

      // clear cart
      localStorage.removeItem('cart')

      router.push(`/orders/${order.id}`)
    } catch (err) {
      console.error(err)
      setError('Could not place the order, please try again')
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', paddingBottom: '100px' }}>
      {/* Topbar */}
      <div style={{
        background: '#0a0a0a', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <Link href="/cart">
          <div style={{ color: 'white', fontSize: '22px', lineHeight: 1 }}>←</div>
        </Link>
        <div style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>Checkout</div>
      </div>

      <form onSubmit={handleSubmit}>
        {!session && (
          <div style={{
            margin: '14px 16px 0', padding: '10px 12px', background: '#f5f5f5',
            borderRadius: '8px', fontSize: '12px', color: '#0a0a0a',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px'
          }}>
            <span>Ordering as a guest</span>
            <Link href={`/login?next=/checkout`} style={{ color: '#0a0a0a', fontWeight: '600', textDecoration: 'underline' }}>
              Log in
            </Link>
          </div>
        )}

        {/* Delivery method */}
        {shop?.pickup_available && (
          <div style={{
            background: 'white', margin: '14px 16px', borderRadius: '10px',
            border: '1px solid #e0e0e0', padding: '16px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#1a1a1a' }}>
              Delivery method
            </div>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
              border: `1px solid ${deliveryMethod === 'delivery' ? '#0a0a0a' : '#ddd'}`,
              borderRadius: '8px', marginBottom: '8px', cursor: 'pointer'
            }}>
              <input
                type="radio"
                name="deliveryMethod"
                checked={deliveryMethod === 'delivery'}
                onChange={() => setDeliveryMethod('delivery')}
              />
              <span style={{ fontSize: '14px' }}>Home delivery</span>
            </label>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
              border: `1px solid ${deliveryMethod === 'pickup' ? '#0a0a0a' : '#ddd'}`,
              borderRadius: '8px', cursor: 'pointer'
            }}>
              <input
                type="radio"
                name="deliveryMethod"
                checked={deliveryMethod === 'pickup'}
                onChange={() => setDeliveryMethod('pickup')}
              />
              <span style={{ fontSize: '14px' }}>Store pickup (no delivery charge)</span>
            </label>
          </div>
        )}

        {/* Delivery info */}
        <div style={{
          background: 'white', margin: '14px 16px', borderRadius: '10px',
          border: '1px solid #e0e0e0', padding: '16px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#1a1a1a' }}>
            {deliveryMethod === 'pickup' ? 'Pickup person details' : 'Delivery details'}
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Phone number *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
              }}
            />
          </div>

          {deliveryMethod === 'pickup' ? (
            <div>
              <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Pickup address</label>
              <div style={{
                padding: '10px 12px', borderRadius: '8px', background: '#f5f5f5',
                fontSize: '14px', color: '#333'
              }}>{shop?.pickup_address || 'Store address will be shared soon'}</div>
            </div>
          ) : (
            <>
              {areaName && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Area</label>
                  <div style={{
                    padding: '10px 12px', borderRadius: '8px', background: '#f5f5f5',
                    fontSize: '14px', color: '#333'
                  }}>{areaName}</div>
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Delivery country *</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box',
                    background: 'white'
                  }}
                >
                  {countryOptions.map(c => (
                    <option key={c} value={c}>{c === 'OTHER' ? 'Other (Rest of World)' : c}</option>
                  ))}
                </select>
              </div>

              {matchedRules.length > 1 && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '6px' }}>Courier *</label>
                  {matchedRules.map(r => (
                    <label key={r.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px',
                      padding: '10px 12px', border: `1px solid ${selectedRuleId === r.id ? '#0a0a0a' : '#ddd'}`,
                      borderRadius: '8px', marginBottom: '8px', cursor: 'pointer'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="radio"
                          name="courierRule"
                          checked={selectedRuleId === r.id}
                          onChange={() => setSelectedRuleId(r.id)}
                        />
                        <span style={{ fontSize: '14px' }}>{r.courier_name || r.country}</span>
                      </span>
                      <span style={{ fontSize: '13px', color: '#555', fontWeight: '600' }}>৳{ruleCharge(r)}</span>
                    </label>
                  ))}
                </div>
              )}

              {session?.user?.id && savedAddresses.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '6px' }}>Delivery address *</label>
                  {savedAddresses.map(addr => (
                    <label key={addr.id} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px',
                      border: `1px solid ${selectedAddressId === addr.id ? '#0a0a0a' : '#ddd'}`,
                      borderRadius: '8px', marginBottom: '8px', cursor: 'pointer'
                    }}>
                      <input
                        type="radio"
                        name="savedAddress"
                        checked={selectedAddressId === addr.id}
                        onChange={() => { setSelectedAddressId(addr.id); if (addr.country) setCountry(addr.country) }}
                        style={{ marginTop: '3px' }}
                      />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a1a' }}>{addr.label || 'Address'}</div>
                        <div style={{ fontSize: '13px', color: '#555', marginTop: '2px' }}>{addr.address}</div>
                      </div>
                    </label>
                  ))}
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                    border: `1px solid ${selectedAddressId === 'new' ? '#0a0a0a' : '#ddd'}`,
                    borderRadius: '8px', cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="savedAddress"
                      checked={selectedAddressId === 'new'}
                      onChange={() => setSelectedAddressId('new')}
                    />
                    <span style={{ fontSize: '14px' }}>+ Use a new address</span>
                  </label>
                </div>
              )}

              {selectedAddressId === 'new' && (
                <div>
                  <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Full address *</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/flat number, road, area name"
                    rows={3}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px',
                      border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box',
                      resize: 'none', fontFamily: 'inherit'
                    }}
                  />
                  {session?.user?.id && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '12px', color: '#666', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={saveNewAddress}
                        onChange={(e) => setSaveNewAddress(e.target.checked)}
                      />
                      Save this address for next time
                    </label>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Payment method */}
        <div style={{
          background: 'white', margin: '14px 16px', borderRadius: '10px',
          border: '1px solid #e0e0e0', padding: '16px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#1a1a1a' }}>
            Payment method
          </div>
          <label style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
            border: `1px solid ${paymentMethod === 'cod' ? '#0a0a0a' : '#ddd'}`,
            borderRadius: '8px', marginBottom: '8px', cursor: 'pointer'
          }}>
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === 'cod'}
              onChange={() => setPaymentMethod('cod')}
            />
            <span style={{ fontSize: '14px' }}>Cash on delivery</span>
          </label>
        </div>

        {/* Note */}
        <div style={{
          background: 'white', margin: '14px 16px', borderRadius: '10px',
          border: '1px solid #e0e0e0', padding: '16px'
        }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>
            Order note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any special instructions"
            rows={2}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: '8px',
              border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box',
              resize: 'none', fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Summary */}
        <div style={{
          background: 'white', margin: '14px 16px', borderRadius: '10px',
          border: '1px solid #e0e0e0', padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', marginBottom: '8px' }}>
            <span>Subtotal</span>
            <span>৳{subtotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', marginBottom: '8px' }}>
            <span>Delivery charge</span>
            <span>{deliveryCharge === 0 ? 'Free' : `৳${deliveryCharge}`}</span>
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', fontSize: '15px',
            fontWeight: '600', color: '#1a1a1a', paddingTop: '8px', borderTop: '1px solid #eee'
          }}>
            <span>Total</span>
            <span>৳{total}</span>
          </div>
        </div>

        {error && (
          <div style={{
            margin: '0 16px 14px', padding: '10px 12px', background: '#ffebee',
            color: '#c62828', borderRadius: '8px', fontSize: '13px'
          }}>{error}</div>
        )}

        {/* Bottom bar */}
        <div style={{
          position: 'fixed', bottom: '0', left: '0', right: '0',
          background: 'white', padding: '14px 16px', borderTop: '1px solid #eee'
        }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', background: submitting ? '#9ca3af' : '#0a0a0a', color: 'white',
              padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: '600',
              border: 'none'
            }}>
            {submitting ? 'Placing order...' : `Confirm order — ৳${total}`}
          </button>
        </div>
      </form>
    </div>
  )
}
