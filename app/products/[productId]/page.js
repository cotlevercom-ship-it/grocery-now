import { supabaseFetch } from '@/lib/supabase'
import Link from 'next/link'
import ProductDetailClient from './ProductDetailClient'

export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }) {
  const { productId } = await params

  let product = null
  try {
    const rows = await supabaseFetch(
      `products?select=*,product_variants(*),shops(id,name,slug,rating,image_url,is_active,whatsapp_number,contact_email)&id=eq.${productId}`
    )
    product = rows?.[0] || null
  } catch (e) {
    console.error(e)
  }

  if (!product || !product.shops) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#999' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❓</div>
          <p style={{ marginBottom: '20px' }}>Product not found</p>
          <Link href="/" style={{
            display: 'inline-block', background: '#0a0a0a', color: 'white',
            padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600'
          }}>Back to home</Link>
        </div>
      </div>
    )
  }

  return <ProductDetailClient product={product} shop={product.shops} />
}
