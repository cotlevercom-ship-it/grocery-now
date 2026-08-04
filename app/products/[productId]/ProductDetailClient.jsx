'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getShopCart, setShopCart } from '@/lib/cart'

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
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

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

  const handleAddToCart = () => {
    if (outOfStock) return
    const cartKey = selectedVariant ? `${product.id}:${selectedVariant.id}` : product.id
    const existing = getShopCart(shop.id)
    const already = existing.find(i => i.cartKey === cartKey)
    const newItems = already
      ? existing.map(i => i.cartKey === cartKey ? { ...i, qty: i.qty + qty } : i)
      : [...existing, {
          cartKey,
          id: product.id,
          variantId: selectedVariant?.id || null,
          name: product.name,
          variantName: selectedVariant?.name || null,
          price,
          unit: product.unit,
          weightGrams: product.weight_grams || 0,
          image_url: images[0] || product.image_url,
          qty,
        }]
    setShopCart(shop.id, shop.name, newItems)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push('/cart')
  }

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

            {/* Quantity + Add to cart (desktop inline) */}
            <div className="desktop-cart-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                border: '1px solid #ddd', borderRadius: '8px', padding: '8px 12px'
              }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ fontSize: '16px', color: '#0a0a0a', width: '20px', background: 'none', border: 'none' }}>-</button>
                <span style={{ fontSize: '14px', fontWeight: '600', minWidth: '18px', textAlign: 'center' }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{ fontSize: '16px', color: '#0a0a0a', width: '20px', background: 'none', border: 'none' }}>+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={outOfStock}
                style={{
                  flex: 1, background: outOfStock ? '#ccc' : 'white', color: '#0a0a0a',
                  padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '700',
                  border: '2px solid #0a0a0a'
                }}
              >{added ? '✓ Added' : 'Add to cart'}</button>
              <button
                onClick={handleBuyNow}
                disabled={outOfStock}
                style={{
                  flex: 1, background: outOfStock ? '#ccc' : '#f4a300', color: '#1a1a1a',
                  padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', border: 'none'
                }}
              >Buy now</button>
            </div>

            {product.description && (
              <div style={{ marginTop: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a1a', marginBottom: '6px' }}>Description</div>
                <div style={{ fontSize: '13px', color: '#555', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {product.description}
                </div>
              </div>
            )}

            {/* Visit Store */}
            <Link href={`/shops/${shop.id}`} style={{
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
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          border: '1px solid #ddd', borderRadius: '8px', padding: '6px 10px', flexShrink: 0
        }}>
          <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ fontSize: '16px', color: '#0a0a0a', width: '18px', background: 'none', border: 'none' }}>-</button>
          <span style={{ fontSize: '13px', fontWeight: '600', minWidth: '16px', textAlign: 'center' }}>{qty}</span>
          <button onClick={() => setQty(q => q + 1)} style={{ fontSize: '16px', color: '#0a0a0a', width: '18px', background: 'none', border: 'none' }}>+</button>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          style={{
            flex: 1, background: outOfStock ? '#ccc' : 'white', color: '#0a0a0a',
            padding: '12px', borderRadius: '8px', fontSize: '13.5px', fontWeight: '700',
            border: '2px solid #0a0a0a'
          }}
        >{added ? '✓ Added' : 'Add to cart'}</button>
        <button
          onClick={handleBuyNow}
          disabled={outOfStock}
          style={{
            flex: 1, background: outOfStock ? '#ccc' : '#f4a300', color: '#1a1a1a',
            padding: '12px', borderRadius: '8px', fontSize: '13.5px', fontWeight: '700', border: 'none'
          }}
        >Buy now</button>
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
