'use client'
import { useRouter } from 'next/navigation'

export default function ProductList({ products, shop }) {
  const router = useRouter()

  const priceLabel = (product) => {
    const variants = product.product_variants || []
    if (variants.length === 0) {
      return `৳${product.sale_price || product.price}`
    }
    const prices = variants.map(v => v.sale_price || v.price)
    const min = Math.min(...prices)
    return `From ৳${min}`
  }

  const hasImages = (product) => (product.image_urls && product.image_urls.length > 0) || product.image_url
  const hasMultipleImages = (product) => (product.image_urls && product.image_urls.length > 1)
  const mainImage = (product) => (product.image_urls && product.image_urls[0]) || product.image_url

  const isNew = (product) => {
    if (!product.created_at) return false
    const ageMs = Date.now() - new Date(product.created_at).getTime()
    return ageMs < 7 * 24 * 60 * 60 * 1000
  }
  const isOutOfStock = (product) => product.is_available === false || product.stock === 0
  const discountPercent = (product) => {
    if (!product.sale_price || Number(product.sale_price) >= Number(product.price)) return 0
    return Math.round((1 - Number(product.sale_price) / Number(product.price)) * 100)
  }

  return (
    <div style={{ paddingBottom: '16px' }} className="shop-layout">
      <div className="shop-body" style={{ display: 'flex', alignItems: 'flex-start' }}>
        {/* Product grid */}
        <div style={{ padding: '12px 16px', flex: 1, minWidth: 0 }}>
          <div className="product-grid" style={{ display: 'grid', gap: '12px' }}>
            {products.map(product => {
              const outOfStock = isOutOfStock(product)
              const discount = discountPercent(product)
              return (
                <div
                  key={product.id}
                  onClick={() => router.push(`/products/${product.id}`)}
                  style={{
                    background: 'white', borderRadius: '4px',
                    border: '1px solid #e5e5e5', overflow: 'hidden', cursor: 'pointer'
                  }}
                >
                  <div style={{
                    aspectRatio: '1 / 1', background: '#f5f5f5',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '40px',
                    position: 'relative'
                  }}>
                    {hasImages(product) ? (
                      <img src={mainImage(product)} alt={product.name}
                        style={{
                          width: '100%', height: '100%', objectFit: 'cover',
                          opacity: outOfStock ? 0.45 : 1
                        }} />
                    ) : '🛍️'}

                    {hasMultipleImages(product) && (
                      <span style={{
                        position: 'absolute', bottom: '6px', right: '6px',
                        background: 'rgba(0,0,0,0.55)', color: 'white',
                        fontSize: '10px', padding: '1px 6px', borderRadius: '8px'
                      }}>+{product.image_urls.length - 1}</span>
                    )}

                    {isNew(product) && !outOfStock && (
                      <span style={{
                        position: 'absolute', top: '8px', left: '8px',
                        background: '#e53935', color: 'white', fontSize: '10px',
                        fontWeight: '700', padding: '3px 8px', borderRadius: '5px',
                        letterSpacing: '0.3px'
                      }}>NEW</span>
                    )}

                    {discount > 0 && !outOfStock && (
                      <span style={{
                        position: 'absolute', top: '8px', right: '8px',
                        background: '#0a0a0a', color: 'white', fontSize: '10px',
                        fontWeight: '700', padding: '3px 8px', borderRadius: '5px'
                      }}>-{discount}%</span>
                    )}

                    {outOfStock && (
                      <div style={{
                        position: 'absolute', inset: 0, display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                      }}>
                        <span style={{
                          background: 'rgba(0,0,0,0.7)', color: 'white',
                          fontSize: '11px', fontWeight: '600', padding: '4px 12px',
                          borderRadius: '6px'
                        }}>Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '10px' }}>
                    <div style={{
                      fontSize: '12.5px', fontWeight: '400', color: '#333',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden', lineHeight: '1.4', minHeight: '35px'
                    }}>{product.name}</div>

                    {product.moq > 1 && (
                      <div style={{ fontSize: '10.5px', color: '#2d6a4f', marginTop: '4px', fontWeight: '500' }}>
                        ✓ MOQ {product.moq} {product.unit}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a' }}>
                        {priceLabel(product)}
                      </span>
                      {(product.product_variants || []).length === 0 && discount > 0 && (
                        <span style={{ fontSize: '11px', color: '#aaa', textDecoration: 'line-through' }}>
                          ৳{product.price}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>{product.unit}</div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                      {outOfStock ? (
                        <span style={{ fontSize: '11px', color: '#c62828', fontWeight: '600' }}>Unavailable</span>
                      ) : (
                        <span style={{
                          padding: '5px 14px', borderRadius: '3px', fontSize: '11px',
                          fontWeight: '600', background: 'white', color: '#0a0a0a',
                          border: '1px solid #0a0a0a'
                        }}>Contact seller →</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {products.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📦</div>
              <p>No products found</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .product-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        @media (min-width: 480px) {
          .product-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 768px) {
          .product-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (min-width: 1024px) {
          .product-grid { grid-template-columns: repeat(5, 1fr); }
        }
      `}</style>
    </div>
  )
}
