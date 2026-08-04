'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabaseFetch, getSession } from '@/lib/supabase'
import { getAllShopCarts, clearCart } from '@/lib/cart'
import AgreementCheckbox from '@/components/AgreementCheckbox'

export default function CheckoutPage() {
  const router = useRouter()
  const [shopCarts, setShopCarts] = useState([]) // [{ shopId, shopName, items }]
  const [pickupShop, setPickupShop] = useState(null) // only fetched/used when cart has exactly 1 shop
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
  const [agreed, setAgreed] = useState(false)

  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('new') // address id, or 'new'
  const [saveNewAddress, setSaveNewAddress] = useState(true)

  useEffect(() => {
    async function init() {
      try {
        const carts = getAllShopCarts().filter(s => s.items.length > 0)
        if (carts.length === 0) {
          router.replace('/cart')
          return
        }
        setShopCarts(carts)

        // Pickup only makes sense when checking out from a single shop —
        // fetch that shop's pickup details in that case.
        if (carts.length === 1) {
          try {
            const shops = await supabaseFetch(`shops?select=*&id=eq.${carts[0].shopId}`)
            if (shops && shops.length > 0) setPickupShop(shops[0])
          } catch (e) {
            console.error(e)
          }
        }

        // fetch platform shipping rules (Cot Lever sets these centrally, not the merchant)
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

  if (!loaded || shopCarts.length === 0) {
    return null
  }

  const canPickup = shopCarts.length === 1 && pickupShop?.pickup_available

  // A country can have several rules (one per courier, e.g. EMS vs Bangladesh Post Office).
  const countryMatches = shippingRules.filter(r => r.country.toLowerCase() === country.trim().toLowerCase())
  const matchedRules = deliveryMethod === 'pickup' ? [] : (
    countryMatches.length > 0 ? countryMatches : shippingRules.filter(r => r.country === 'OTHER')
  )
  const selectedRule = matchedRules.find(r => r.id === selectedRuleId) || matchedRules[0] || null

  // Delivery charge is computed PER SHOP — each merchant ships its own parcel,
  // so each shop's items get their own weight/item-count allowance against the rule.
  const ruleChargeFor = (r, weightKg, itemCount) => Math.round(
    Number(r.base_charge)
    + Math.max(0, weightKg - Number(r.free_weight_kg)) * Number(r.per_kg_charge)
    + Math.max(0, itemCount - Number(r.free_item_count)) * Number(r.per_item_charge)
  )

  const shopBreakdown = shopCarts.map(sc => {
    const subtotal = sc.items.reduce((a, b) => a + b.qty * b.price, 0)
    const weightKg = sc.items.reduce((a, b) => a + ((b.weightGrams || 0) * b.qty), 0) / 1000
    const itemCount = sc.items.reduce((a, b) => a + b.qty, 0)
    const deliveryCharge = deliveryMethod === 'pickup' || !selectedRule ? 0 : ruleChargeFor(selectedRule, weightKg, itemCount)
    return { ...sc, subtotal, weightKg, itemCount, deliveryCharge }
  })

  const subtotal = shopBreakdown.reduce((a, b) => a + b.subtotal, 0)
  const deliveryCharge = shopBreakdown.reduce((a, b) => a + b.deliveryCharge, 0)
  const total = subtotal + deliveryCharge
  const totalItems = shopBreakdown.reduce((a, b) => a + b.itemCount, 0)

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
      ? (pickupShop?.pickup_address || '')
      : (usingSavedAddress ? (selectedAddress?.address || '') : address.trim())

    if (!name.trim() || !phone.trim() || (deliveryMethod === 'delivery' && !deliveryAddressText.trim())) {
      setError('Name, phone number and address are required')
      return
    }
    if (!agreed) {
      setError('Please agree to the Customer Terms to continue')
      return
    }

    setSubmitting(true)
    try {
      const orderGroupId = shopBreakdown.length > 1
        ? (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`)
        : null

      const createdOrders = []

      for (const sc of shopBreakdown) {
        const orderRes = await supabaseFetch('orders', {
          method: 'POST',
          body: JSON.stringify({
            user_id: session?.user?.id || null,
            shop_id: sc.shopId,
            order_group_id: orderGroupId,
            area_id: areaId,
            delivery_name: name.trim(),
            delivery_phone: phone.trim(),
            delivery_address: deliveryMethod === 'pickup' ? (pickupShop?.pickup_address || null) : deliveryAddressText,
            delivery_method: deliveryMethod,
            delivery_country: deliveryMethod === 'pickup' ? null : country.trim(),
            courier_name: deliveryMethod === 'pickup' ? null : (selectedRule?.courier_name || null),
            subtotal: sc.subtotal,
            delivery_charge: sc.deliveryCharge,
            discount: 0,
            total: sc.subtotal + sc.deliveryCharge,
            payment_method: paymentMethod,
            payment_status: 'unpaid',
            status: 'pending',
            tracking_history: [{ status: 'pending', note: 'Order placed', time: new Date().toISOString() }],
            note: note.trim() || null,
          }),
        })

        const order = orderRes[0]
        createdOrders.push(order)

        const itemsPayload = sc.items.map(item => ({
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
      }

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

      clearCart()

      if (orderGroupId) {
        router.push(`/orders/group/${orderGroupId}`)
      } else {
        router.push(`/orders/${createdOrders[0].id}`)
      }
    } catch (err) {
      console.error(err)
      setError('Could not place the order, please try again')
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', paddingBottom: 'calc(120px + env(safe-area-inset-bottom))' }} className="checkout-page">
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
        <div className="checkout-container" style={{ maxWidth: '1080px', margin: '0 auto', padding: '14px 16px' }}>

          {!session && (
            <div style={{
              padding: '10px 12px', background: '#f5f5f5', marginBottom: '14px',
              borderRadius: '8px', fontSize: '12px', color: '#0a0a0a',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px'
            }}>
              <span>Ordering as a guest</span>
              <Link href={`/login?next=/checkout`} style={{ color: '#0a0a0a', fontWeight: '600', textDecoration: 'underline' }}>
                Log in
              </Link>
            </div>
          )}

          {shopCarts.length > 1 && (
            <div style={{
              padding: '10px 12px', background: '#fdf1d9', marginBottom: '14px',
              borderRadius: '8px', fontSize: '12.5px', color: '#5c4600', lineHeight: 1.5
            }}>
              You're ordering from {shopCarts.length} different shops. This will create {shopCarts.length} separate orders — one per shop, each shipped and tracked independently.
            </div>
          )}

          <div className="checkout-layout" style={{ display: 'flex', gap: '20px' }}>

            {/* Left column: all form sections */}
            <div className="checkout-left" style={{ flex: 1, minWidth: 0 }}>

              {/* Delivery method */}
              {canPickup && (
                <div style={{
                  background: 'white', marginBottom: '14px', borderRadius: '6px',
                  border: '1px solid #e5e5e5', padding: '16px'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#1a1a1a' }}>
                    Delivery method
                  </div>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                    border: `1px solid ${deliveryMethod === 'delivery' ? '#0a0a0a' : '#ddd'}`,
                    borderRadius: '6px', marginBottom: '8px', cursor: 'pointer'
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
                    borderRadius: '6px', cursor: 'pointer'
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
                background: 'white', marginBottom: '14px', borderRadius: '6px',
                border: '1px solid #e5e5e5', padding: '16px'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#1a1a1a' }}>
                  {deliveryMethod === 'pickup' ? 'Pickup person details' : 'Delivery details'}
                </div>

                <div className="form-row" style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: '6px',
                        border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Phone number *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: '6px',
                        border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {deliveryMethod === 'pickup' ? (
                  <div>
                    <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Pickup address</label>
                    <div style={{
                      padding: '10px 12px', borderRadius: '6px', background: '#f5f5f5',
                      fontSize: '14px', color: '#333'
                    }}>{pickupShop?.pickup_address || 'Store address will be shared soon'}</div>
                  </div>
                ) : (
                  <>
                    {areaName && (
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Area</label>
                        <div style={{
                          padding: '10px 12px', borderRadius: '6px', background: '#f5f5f5',
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
                          width: '100%', padding: '10px 12px', borderRadius: '6px',
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
                            borderRadius: '6px', marginBottom: '8px', cursor: 'pointer'
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
                            borderRadius: '6px', marginBottom: '8px', cursor: 'pointer'
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
                          borderRadius: '6px', cursor: 'pointer'
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
                            width: '100%', padding: '10px 12px', borderRadius: '6px',
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
                background: 'white', marginBottom: '14px', borderRadius: '6px',
                border: '1px solid #e5e5e5', padding: '16px'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#1a1a1a' }}>
                  Payment method
                </div>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                  border: `1px solid ${paymentMethod === 'cod' ? '#0a0a0a' : '#ddd'}`,
                  borderRadius: '6px', cursor: 'pointer'
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
                background: 'white', marginBottom: '14px', borderRadius: '6px',
                border: '1px solid #e5e5e5', padding: '16px'
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
                    width: '100%', padding: '10px 12px', borderRadius: '6px',
                    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box',
                    resize: 'none', fontFamily: 'inherit'
                  }}
                />
              </div>

              {error && (
                <div className="mobile-only-error" style={{
                  padding: '10px 12px', background: '#ffebee', marginBottom: '14px',
                  color: '#c62828', borderRadius: '6px', fontSize: '13px'
                }}>{error}</div>
              )}
            </div>

            {/* Right column: order summary */}
            <div className="checkout-right">
              <div style={{
                background: 'white', borderRadius: '6px',
                border: '1px solid #e5e5e5', padding: '16px'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#1a1a1a' }}>
                  Order Summary
                </div>

                <div style={{ maxHeight: '260px', overflowY: 'auto', marginBottom: '12px' }}>
                  {shopBreakdown.map(sc => (
                    <div key={sc.shopId} style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#555', marginBottom: '8px' }}>
                        {sc.shopName}
                      </div>
                      {sc.items.map(item => (
                        <div key={item.cartKey || item.id} style={{
                          display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px'
                        }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '4px', background: '#f5f5f5',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden', flexShrink: 0, fontSize: '16px'
                          }}>
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : '🛍️'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: '12px', color: '#333', overflow: 'hidden',
                              textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>{item.name}</div>
                            <div style={{ fontSize: '11px', color: '#999' }}>Qty {item.qty}</div>
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: '#1a1a1a' }}>৳{item.price * item.qty}</div>
                        </div>
                      ))}
                      {shopBreakdown.length > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#888' }}>
                          <span>Shop subtotal + delivery</span>
                          <span>৳{sc.subtotal} + ৳{sc.deliveryCharge}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', marginBottom: '8px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                  <span>Subtotal</span>
                  <span>৳{subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', marginBottom: '8px' }}>
                  <span>Delivery charge{shopBreakdown.length > 1 ? ` (${shopBreakdown.length} shops)` : ''}</span>
                  <span>{deliveryCharge === 0 ? 'Free' : `৳${deliveryCharge}`}</span>
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', fontSize: '16px',
                  fontWeight: '700', color: '#1a1a1a', paddingTop: '10px', borderTop: '1px solid #eee', marginBottom: '14px'
                }}>
                  <span>Total</span>
                  <span>৳{total}</span>
                </div>

                {error && (
                  <div className="desktop-only-error" style={{
                    padding: '10px 12px', background: '#ffebee', marginBottom: '12px',
                    color: '#c62828', borderRadius: '6px', fontSize: '13px'
                  }}>{error}</div>
                )}

                <div style={{ marginBottom: '12px' }}>
                  <AgreementCheckbox type="customer" checked={agreed} onChange={setAgreed} accent="#f4a300" />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="desktop-confirm"
                  style={{
                    width: '100%', background: submitting ? '#9ca3af' : '#f4a300', color: '#1a1a1a',
                    padding: '12px', borderRadius: '6px', fontSize: '14px', fontWeight: '700',
                    border: 'none'
                  }}>
                  {submitting ? 'Placing order...' : `Confirm order — ৳${total}`}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom bar (mobile only) */}
        <div className="mobile-bottom-bar" style={{
          position: 'fixed', bottom: '0', left: '0', right: '0',
          background: 'white', padding: '14px 16px calc(14px + env(safe-area-inset-bottom))', borderTop: '1px solid #eee'
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

      <style jsx>{`
        .checkout-layout { flex-direction: column; }
        .checkout-right { width: 100%; }
        .desktop-confirm { display: none; }
        .desktop-only-error { display: none; }
        @media (min-width: 860px) {
          .checkout-layout { flex-direction: row; align-items: flex-start; }
          .checkout-right { width: 360px; flex-shrink: 0; position: sticky; top: 20px; }
          .desktop-confirm { display: block; }
          .desktop-only-error { display: block; }
          .mobile-only-error { display: none; }
          .mobile-bottom-bar { display: none; }
          .checkout-page { padding-bottom: 40px !important; }
          .form-row { flex-direction: row !important; }
        }
        @media (max-width: 859px) {
          .form-row { flex-direction: column; }
        }
      `}</style>
    </div>
  )
}
