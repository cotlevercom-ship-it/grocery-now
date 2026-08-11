'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function normalizeWhatsApp(number) {
  if (!number) return null
  let digits = number.replace(/[^\d]/g, '')
  if (digits.startsWith('0')) digits = '880' + digits.slice(1)
  if (!digits.startsWith('880') && digits.length <= 11) digits = '880' + digits
  return digits
}

export default function ProductDetailClient({ product, shop }) {
  const router = useRouter()

  const images = (product.image_urls && product.image_urls.length > 0)
    ? product.image_urls
    : (product.image_url ? [product.image_url] : [])

  const variants = product.product_variants || []
  const availableVariants = variants.filter(v => v.is_available !== false)

  const [imgIndex, setImgIndex] = useState(0)
  const [selectedVariantId, setSelectedVariantId] = useState(
    availableVariants.length > 0 ? availableVariants[0].id : null
  )

  const selectedVariant = variants.find(v => v.id === selectedVariantId) || null
  const price = selectedVariant
    ? (selectedVariant.sale_price || selectedVariant.price)
    : (product.sale_price || product.price)
  const originalPrice = selectedVariant ? selectedVariant.price : product.price
  const hasDiscount = selectedVariant
    ? (selectedVariant.sale_price && selectedVariant.sale_price < selectedVariant.price)
    : (product.sale_price && product.sale_price < product.price)

  const outOfStock = variants.length > 0
    ? (!selectedVariant || selectedVariant.is_available === false)
    : product.is_available === false

  const contactMessage = `Hi, I'm interested in "${product.name}"${selectedVariant ? ` (${selectedVariant.name})` : ''} on Cot Lever. Is it available?`
  const waNumber = normalizeWhatsApp(shop.whatsapp_number)
  const waHref = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(contactMessage)}` : null
  const emailHref = shop.contact_email
    ? `mailto:${shop.contact_email}?subject=${encodeURIComponent(`Inquiry: ${product.name}`)}&body=${encodeURIComponent(contactMessage)}`
    : null
  const hasContact = !!(waHref || emailHref)

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', paddingBottom: 'calc(90px + env(safe-area-inset-bottom))' }}>
      {/* Topbar */}
      <div style={{
        background: '#0a0a0a', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'white', fontSize: '22px', lineHeight: 1, padding: 0 }}>←</button>
        <div style={{ color: 'white', fontSize: '16px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.name}
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="product-layout" style={{ display: 'flex', gap: '28px', padding: '16px' }}>

          {/* Left: gallery */}
          <div className="product-gallery-col">
            <div style={{
              width: '100%', aspectRatio: '1', background: '#f9fbe7',
              borderRadius: '8px', overflow: 'hidden', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              {images.length > 0 ? (
                <img src={images[imgIndex]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '64px' }}>🛍️</span>
              )}
            </div>

            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', overflowX: 'auto' }}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    style={{
                      width: '56px', height: '56px', borderRadius: '6px', flexShrink: 0,
                      border: `2px solid ${i === imgIndex ? '#f4a300' : '#e5e5e5'}`,
                      padding: 0, overflow: 'hidden', background: 'white'
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: details */}
          <div className="product-info-col" style={{ flex: 1, minWidth: 0 }}>
            {product.brand && (
              <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {product.brand}
              </div>
            )}
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', marginTop: '4px', lineHeight: 1.35 }}>
              {product.name}
            </h1>

            {product.moq > 1 && (
              <div style={{
                display: 'inline-block', fontSize: '11.5px', fontWeight: '600', color: '#2d6a4f',
                background: '#eaf6ee', padding: '3px 9px', borderRadius: '5px', marginTop: '8px'
              }}>
                ✓ MOQ {product.moq} {product.unit}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '14px' }}>
              <span style={{ fontSize: '24px', fontWeight: '800', color: '#0a0a0a' }}>৳{price}</span>
              {hasDiscount && (
                <span style={{ fontSize: '15px', color: '#999', textDecoration: 'line-through' }}>৳{originalPrice}</span>
              )}
              {product.unit && <span style={{ fontSize: '12.5px', color: '#888' }}>/ {product.unit}</span>}
            </div>

            {outOfStock && (
              <div style={{ marginTop: '10px', fontSize: '13px', color: '#d32f2f', fontWeight: '700' }}>
                Out of stock
              </div>
            )}

            {variants.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>
                  Choose an option
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {variants.map(v => {
                    const vAvailable = v.is_available !== false
                    const vPrice = v.sale_price || v.price
                    return (
                      <label
                        key={v.id}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 12px', borderRadius: '8px',
                          border: `1px solid ${selectedVariantId === v.id ? '#0a0a0a' : '#ddd'}`,
                          opacity: vAvailable ? 1 : 0.5,
                          cursor: vAvailable ? 'pointer' : 'not-allowed'
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="radio"
                            name="variant"
                            disabled={!vAvailable}
                            checked={selectedVariantId === v.id}
                            onChange={() => setSelectedVariantId(v.id)}
                          />
                          <span style={{ fontSize: '13px', color: '#1a1a1a' }}>
                            {v.name}{!vAvailable ? ' (Out of stock)' : ''}
                          </span>
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#0a0a0a' }}>৳{vPrice}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Contact Seller (desktop inline) */}
            <div className="desktop-cart-actions" style={{ marginTop: '20px' }}>
              {outOfStock && (
                <div style={{ marginBottom: '10px', fontSize: '12.5px', color: '#888' }}>
                  Ask the seller if this is back in stock.
                </div>
              )}
              {hasContact ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  {waHref && (
                    <a href={waHref} target="_blank" rel="noopener noreferrer" style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      background: '#25D366', color: 'white',
                      padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', textDecoration: 'none'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 6.32A8.86 8.86 0 0 0 12.05 4a8.9 8.9 0 0 0-7.7 13.35L3 20.6l3.35-1.32a8.9 8.9 0 0 0 5.7 2.05h.01a8.9 8.9 0 0 0 8.9-8.9 8.86 8.86 0 0 0-3.36-6.11ZM12.05 19.9h-.01a7.4 7.4 0 0 1-3.77-1.03l-.27-.16-2.8 1.1.94-2.73-.18-.28a7.4 7.4 0 1 1 6.1 3.1Zm4.06-5.54c-.22-.11-1.3-.64-1.5-.72-.2-.07-.35-.11-.5.11s-.58.72-.71.87-.26.16-.48.05a6.06 6.06 0 0 1-1.78-1.1 6.66 6.66 0 0 1-1.23-1.53c-.13-.22 0-.34.1-.45.1-.1.22-.26.33-.39.11-.13.14-.22.22-.37a.4.4 0 0 1-.02-.39c-.05-.11-.5-1.2-.68-1.64-.18-.43-.36-.37-.5-.38h-.43a.82.82 0 0 0-.6.28 2.5 2.5 0 0 0-.77 1.85c0 1.09.79 2.14.9 2.29.11.15 1.55 2.37 3.76 3.32a12.6 12.6 0 0 0 1.26.47c.53.17 1.01.14 1.39.09.42-.06 1.3-.53 1.48-1.05.18-.51.18-.95.13-1.05-.05-.1-.2-.16-.42-.27Z"/></svg>
                      WhatsApp Seller
                    </a>
                  )}
                  {emailHref && (
                    <a href={emailHref} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      background: 'white', color: '#0a0a0a', border: '2px solid #0a0a0a',
                      padding: '11px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', textDecoration: 'none'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      Email Seller
                    </a>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: '#999' }}>This seller hasn't added contact details yet.</div>
              )}
            </div>


            {product.description && (
              <div style={{ marginTop: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a1a', marginBottom: '6px' }}>Description</div>
                <div style={{ fontSize: '13px', color: '#555', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {product.description}
                </div>
              </div>
            )}

            {(Array.isArray(product.tier_pricing) && product.tier_pricing.length > 0) ||
              product.uom || product.carton_size || product.model_number || product.origin ||
              product.certification || product.lead_time || product.payment_terms ||
              product.sample_available ? (
              <div style={{
                marginTop: '24px', background: 'white', border: '1px solid #e5e5e5',
                borderRadius: '10px', padding: '16px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a1a', marginBottom: '12px' }}>
                  Wholesale / B2B Details
                </div>

                {Array.isArray(product.tier_pricing) && product.tier_pricing.length > 0 && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px', fontSize: '12.5px' }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5' }}>
                        <th style={{ textAlign: 'left', padding: '7px 10px', fontWeight: '700', color: '#555' }}>Quantity</th>
                        <th style={{ textAlign: 'right', padding: '7px 10px', fontWeight: '700', color: '#555' }}>Price / {product.unit || 'unit'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.tier_pricing.map((t, i) => (
                        <tr key={i} style={{ borderTop: '1px solid #eee' }}>
                          <td style={{ padding: '7px 10px', color: '#333' }}>
                            {t.max_qty ? `${t.min_qty} – ${t.max_qty}` : `${t.min_qty}+`}
                          </td>
                          <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: '700', color: '#0a0a0a' }}>
                            ৳{t.price}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: '10px', columnGap: '12px', fontSize: '12.5px'
                }}>
                  {product.moq > 1 && (
                    <div><span style={{ color: '#888' }}>MOQ: </span><b style={{ color: '#1a1a1a' }}>{product.moq} {product.unit}</b></div>
                  )}
                  {product.uom && (
                    <div><span style={{ color: '#888' }}>Unit of Measure: </span><b style={{ color: '#1a1a1a' }}>{product.uom}</b></div>
                  )}
                  {product.carton_size && (
                    <div><span style={{ color: '#888' }}>Carton Size: </span><b style={{ color: '#1a1a1a' }}>{product.carton_size}</b></div>
                  )}
                  {product.model_number && (
                    <div><span style={{ color: '#888' }}>Model No: </span><b style={{ color: '#1a1a1a' }}>{product.model_number}</b></div>
                  )}
                  {product.origin && (
                    <div><span style={{ color: '#888' }}>Origin: </span><b style={{ color: '#1a1a1a' }}>{product.origin}</b></div>
                  )}
                  {product.certification && (
                    <div><span style={{ color: '#888' }}>Certification: </span><b style={{ color: '#1a1a1a' }}>{product.certification}</b></div>
                  )}
                  {product.lead_time && (
                    <div><span style={{ color: '#888' }}>Lead Time: </span><b style={{ color: '#1a1a1a' }}>{product.lead_time}</b></div>
                  )}
                  {product.payment_terms && (
                    <div><span style={{ color: '#888' }}>Payment Terms: </span><b style={{ color: '#1a1a1a' }}>{product.payment_terms}</b></div>
                  )}
                  {product.sample_available && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{
                        display: 'inline-block', background: '#e8f5e9', color: '#2e7d32',
                        fontSize: '11.5px', fontWeight: '700', padding: '3px 10px', borderRadius: '5px'
                      }}>✓ Samples available</span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Visit Store */}
            <Link href={`/shop/${shop.slug}`} style={{
              display: 'flex', alignItems: 'center', gap: '12px', marginTop: '26px',
              background: 'white', border: '1px solid #e5e5e5', borderRadius: '10px',
              padding: '14px', textDecoration: 'none'
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '8px', background: '#f5f5f5',
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0
              }}>
                {shop.image_url ? (
                  <img src={shop.image_url} alt={shop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : '🏪'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#1a1a1a' }}>{shop.name}</div>
                {shop.rating && (
                  <div style={{ fontSize: '11.5px', color: '#888', marginTop: '2px' }}>⭐ {shop.rating}</div>
                )}
              </div>
              <div style={{
                fontSize: '12.5px', fontWeight: '700', color: '#0a0a0a',
                border: '1px solid #0a0a0a', borderRadius: '6px', padding: '6px 12px', flexShrink: 0
              }}>Visit Store →</div>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar (mobile only) */}
      <div className="mobile-bottom-bar" style={{
        position: 'fixed', bottom: '0', left: '0', right: '0',
        background: 'white', borderTop: '1px solid #eee',
        padding: '10px 16px calc(10px + env(safe-area-inset-bottom))',
        display: 'flex', alignItems: 'center', gap: '10px'
      }}>
        {hasContact ? (
          <>
            {waHref && (
              <a href={waHref} target="_blank" rel="noopener noreferrer" style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                background: '#25D366', color: 'white',
                padding: '12px', borderRadius: '8px', fontSize: '13.5px', fontWeight: '700', textDecoration: 'none'
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 6.32A8.86 8.86 0 0 0 12.05 4a8.9 8.9 0 0 0-7.7 13.35L3 20.6l3.35-1.32a8.9 8.9 0 0 0 5.7 2.05h.01a8.9 8.9 0 0 0 8.9-8.9 8.86 8.86 0 0 0-3.36-6.11ZM12.05 19.9h-.01a7.4 7.4 0 0 1-3.77-1.03l-.27-.16-2.8 1.1.94-2.73-.18-.28a7.4 7.4 0 1 1 6.1 3.1Zm4.06-5.54c-.22-.11-1.3-.64-1.5-.72-.2-.07-.35-.11-.5.11s-.58.72-.71.87-.26.16-.48.05a6.06 6.06 0 0 1-1.78-1.1 6.66 6.66 0 0 1-1.23-1.53c-.13-.22 0-.34.1-.45.1-.1.22-.26.33-.39.11-.13.14-.22.22-.37a.4.4 0 0 1-.02-.39c-.05-.11-.5-1.2-.68-1.64-.18-.43-.36-.37-.5-.38h-.43a.82.82 0 0 0-.6.28 2.5 2.5 0 0 0-.77 1.85c0 1.09.79 2.14.9 2.29.11.15 1.55 2.37 3.76 3.32a12.6 12.6 0 0 0 1.26.47c.53.17 1.01.14 1.39.09.42-.06 1.3-.53 1.48-1.05.18-.51.18-.95.13-1.05-.05-.1-.2-.16-.42-.27Z"/></svg>
                WhatsApp
              </a>
            )}
            {emailHref && (
              <a href={emailHref} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                background: 'white', color: '#0a0a0a', border: '2px solid #0a0a0a',
                padding: '11px', borderRadius: '8px', fontSize: '13.5px', fontWeight: '700', textDecoration: 'none'
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                Email
              </a>
            )}
          </>
        ) : (
          <div style={{ flex: 1, textAlign: 'center', fontSize: '13px', color: '#999', padding: '10px 0' }}>
            This seller hasn't added contact details yet.
          </div>
        )}
      </div>

      <style jsx>{`
        .product-layout { flex-direction: column; }
        .product-gallery-col { width: 100%; }
        .mobile-bottom-bar { display: flex; }
        @media (min-width: 720px) {
          .product-layout { flex-direction: row; }
          .product-gallery-col { width: 380px; flex-shrink: 0; }
          .mobile-bottom-bar { display: none; }
        }
      `}</style>
    </div>
  )
}
