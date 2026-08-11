'use client'
import { useState, useEffect, Suspense } from 'react'
import { getSession, supabaseFetch } from '@/lib/supabase'
import MerchantNav from '@/components/MerchantNav'

export default function MerchantOrdersPage() {
  return (
    <Suspense fallback={null}>
      <MerchantOrdersInner />
    </Suspense>
  )
}

function MerchantOrdersInner() {
  const [shopId, setShopId] = useState('')
  const [loadingShop, setLoadingShop] = useState(true)
  const [inquiryStats, setInquiryStats] = useState({ total: 0, whatsapp: 0, email: 0, byProduct: [] })

  useEffect(() => {
    async function loadShop() {
      setLoadingShop(true)
      try {
        const session = getSession()
        if (session?.user) {
          const shops = await supabaseFetch(`shops?select=id&owner_id=eq.${session.user.id}`)
          if (shops && shops.length > 0) {
            setShopId(shops[0].id)
          }
        }
      } catch (e) {
        console.error(e)
      }
      setLoadingShop(false)
    }
    loadShop()
  }, [])

  async function loadInquiryStats(id) {
    try {
      const rows = await supabaseFetch(`inquiries?select=contact_method,product_id,products(name)&shop_id=eq.${id}&order=created_at.desc&limit=500`)
      const list = rows || []
      const whatsapp = list.filter(r => r.contact_method === 'whatsapp').length
      const email = list.filter(r => r.contact_method === 'email').length
      const counts = {}
      list.forEach(r => {
        const key = r.product_id
        if (!key) return
        if (!counts[key]) counts[key] = { name: r.products?.name || 'Unknown product', count: 0 }
        counts[key].count += 1
      })
      const byProduct = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5)
      setInquiryStats({ total: list.length, whatsapp, email, byProduct })
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (shopId) {
      loadInquiryStats(shopId)
    }
  }, [shopId])

  if (loadingShop) {
    return (
      <MerchantNav>
        <div style={{ color: '#888', fontSize: '14px' }}>Loading...</div>
      </MerchantNav>
    )
  }

  if (!shopId) {
    return (
      <MerchantNav>
        <div style={{ color: '#c62828', fontSize: '14px' }}>Could not find your shop.</div>
      </MerchantNav>
    )
  }

  return (
    <MerchantNav>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '8px' }}>Inquiries</h1>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
          See who's messaging you about your listings.
        </p>

        <div style={{
          maxWidth: '700px', background: 'white', borderRadius: '10px',
          border: '1px solid #e0e0e0', padding: '16px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#0a0a0a', marginBottom: '10px' }}>
            Buyer Interest
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: inquiryStats.byProduct.length > 0 ? '14px' : 0 }}>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#0a0a0a' }}>{inquiryStats.total}</div>
              <div style={{ fontSize: '11.5px', color: '#888' }}>Total contacts</div>
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#25D366' }}>{inquiryStats.whatsapp}</div>
              <div style={{ fontSize: '11.5px', color: '#888' }}>via WhatsApp</div>
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#0a0a0a' }}>{inquiryStats.email}</div>
              <div style={{ fontSize: '11.5px', color: '#888' }}>via Email</div>
            </div>
          </div>
          {inquiryStats.byProduct.length > 0 ? (
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#a3a39d', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Most contacted products
              </div>
              {inquiryStats.byProduct.map((p, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', fontSize: '12.5px',
                  color: '#333', padding: '5px 0', borderTop: i > 0 ? '1px solid #f0f0f0' : 'none'
                }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '10px' }}>{p.name}</span>
                  <span style={{ fontWeight: '700', flexShrink: 0 }}>{p.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '12.5px', color: '#999' }}>No buyer contacts yet.</div>
          )}
        </div>
      </div>
    </MerchantNav>
  )
}
