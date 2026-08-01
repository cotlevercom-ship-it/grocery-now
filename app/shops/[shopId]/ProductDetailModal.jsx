'use client'
import { useState } from 'react'

export default function ProductDetailModal({ product, onClose, onAddToCart }) {
  const images = (product.image_urls && product.image_urls.length > 0)
    ? product.image_urls
    : (product.image_url ? [product.image_url] : [])

  const variants = product.product_variants || []
  const availableVariants = variants.filter(v => v.is_available !== false)

  const [imgIndex, setImgIndex] = useState(0)
  const [selectedVariantId, setSelectedVariantId] = useState(
    availableVariants.length > 0 ? availableVariants[0].id : null
  )
  const [qty, setQty] = useState(1)

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

  const handleAdd = () => {
    if (outOfStock) return
    onAddToCart(product, selectedVariant, qty)
    onClose()
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'flex-end', zIndex: 1000
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white', width: '100%', maxHeight: '88vh', overflowY: 'auto',
          borderTopLeftRadius: '16px', borderTopRightRadius: '16px'
        }}
      >
        {/* Image gallery */}
        <div style={{ position: 'relative', width: '100%', height: '220px', background: '#f9fbe7' }}>
          {images.length > 0 ? (
            <img
              src={images[imgIndex]}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
              🛍️
            </div>
          )}

          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '10px', right: '10px', width: '30px', height: '30px',
              borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
            }}
          >✕</button>

          {images.length > 1 && (
            <>
              <button
                onClick={() => setImgIndex(i => (i - 1 + images.length) % images.length)}
                style={{
                  position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
                  width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(0,0,0,0.4)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >‹</button>
              <button
                onClick={() => setImgIndex(i => (i + 1) % images.length)}
                style={{
                  position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                  width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(0,0,0,0.4)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >›</button>
              <div style={{
                position: 'absolute', bottom: '10px', left: 0, right: 0,
                display: 'flex', justifyContent: 'center', gap: '6px'
              }}>
                {images.map((_, i) => (
                  <span
                    key={i}
                    onClick={() => setImgIndex(i)}
                    style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: i === imgIndex ? '#0a0a0a' : 'rgba(255,255,255,0.8)',
                      border: i === imgIndex ? 'none' : '1px solid #ccc',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Details */}
        <div style={{ padding: '16px' }}>
          {product.brand && (
            <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {product.brand}
            </div>
          )}
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginTop: '2px' }}>
            {product.name}
          </div>
          {product.unit && (
            <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{product.unit}</div>
          )}

          {product.description && (
            <div style={{ fontSize: '13px', color: '#555', marginTop: '10px', lineHeight: 1.5 }}>
              {product.description}
            </div>
          )}

          {/* Variants */}
          {variants.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>
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
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#0a0a0a' }}>৳{vPrice}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '16px' }}>
            <span style={{ fontSize: '20px', fontWeight: '700', color: '#0a0a0a' }}>৳{price}</span>
            {hasDiscount && (
              <span style={{ fontSize: '14px', color: '#999', textDecoration: 'line-through' }}>৳{originalPrice}</span>
            )}
          </div>

          {outOfStock && (
            <div style={{ marginTop: '8px', fontSize: '13px', color: '#d32f2f', fontWeight: '600' }}>
              Out of stock
            </div>
          )}

          {/* Quantity + Add to cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '18px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              border: '1px solid #ddd', borderRadius: '8px', padding: '6px 10px'
            }}>
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                style={{ fontSize: '16px', color: '#0a0a0a', width: '20px' }}
              >-</button>
              <span style={{ fontSize: '14px', fontWeight: '600', minWidth: '16px', textAlign: 'center' }}>{qty}</span>
              <button
                onClick={() => setQty(q => q + 1)}
                style={{ fontSize: '16px', color: '#0a0a0a', width: '20px' }}
              >+</button>
            </div>

            <button
              onClick={handleAdd}
              disabled={outOfStock}
              style={{
                flex: 1, background: outOfStock ? '#ccc' : '#0a0a0a', color: 'white',
                padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: 'none'
              }}
            >
              Add to cart — ৳{price * qty}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
