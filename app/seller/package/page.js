'use client'
import { useState, useEffect } from 'react'
import { getSession, supabaseFetch } from '@/lib/supabase'
import SellerNav from '@/components/SellerNav'

export default function SellerPackagePage() {
  const [loading, setLoading] = useState(true)
  const [shop, setShop] = useState(null)
  const [packages, setPackages] = useState([])
  const [productCount, setProductCount] = useState(0)
  const [switchingId, setSwitchingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    const session = getSession()
    if (!session?.user) {
      setLoading(false)
      return
    }
    try {
      const [shops, pkgs] = await Promise.all([
        supabaseFetch(`shops?select=*,seller_packages(*)&owner_id=eq.${session.user.id}`),
        supabaseFetch('seller_packages?select=*&is_active=eq.true&order=sort_order'),
      ])
      const myShop = shops?.[0] || null
      setShop(myShop)
      setPackages(pkgs || [])
      if (myShop) {
        const products = await supabaseFetch(`products?select=id&shop_id=eq.${myShop.id}`)
        setProductCount(products?.length || 0)
      }
    } catch (e) {
      console.error(e)
      setError('তথ্য লোড করতে সমস্যা হয়েছে')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSwitch = async (pkg) => {
    if (!shop || pkg.id === shop.package_id) return
    if (pkg.max_products != null && productCount > pkg.max_products) {
      setError(`এই প্যাকেজে সর্বোচ্চ ${pkg.max_products}টি পণ্য রাখা যায়, কিন্তু আপনার বর্তমানে ${productCount}টি পণ্য আছে। প্যাকেজ পরিবর্তনের আগে কিছু পণ্য মুছে ফেলুন।`)
      return
    }
    setError('')
    setSuccess('')
    setSwitchingId(pkg.id)
    try {
      await supabaseFetch(`shops?id=eq.${shop.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ package_id: pkg.id }),
      })
      setSuccess(`আপনার প্যাকেজ "${pkg.name_bn}"-এ পরিবর্তন হয়েছে`)
      await load()
    } catch (e) {
      console.error(e)
      setError('প্যাকেজ পরিবর্তন করতে সমস্যা হয়েছে')
    }
    setSwitchingId(null)
  }

  if (loading) {
    return (
      <SellerNav>
        <div style={{ color: '#888', fontSize: '14px' }}>লোড হচ্ছে...</div>
      </SellerNav>
    )
  }

  const currentPkg = shop?.seller_packages || null
  const usagePercent = currentPkg?.max_products
    ? Math.min(100, Math.round((productCount / currentPkg.max_products) * 100))
    : null

  return (
    <SellerNav>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '4px' }}>
          সাবস্ক্রিপশন প্যাকেজ
        </h1>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
          আপনার দোকানের জন্য একটি প্যাকেজ বেছে নিন। বেশি প্যাকেজে বেশি পণ্য লিস্ট করার সুযোগ পাবেন।
        </p>

        {error && (
          <div style={{
            maxWidth: '700px', marginBottom: '16px', padding: '10px 12px',
            background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
          }}>{error}</div>
        )}
        {success && (
          <div style={{
            maxWidth: '700px', marginBottom: '16px', padding: '10px 12px',
            background: '#e8f5e9', color: '#2d6a4f', borderRadius: '8px', fontSize: '13px'
          }}>{success}</div>
        )}

        {/* Current usage */}
        <div style={{
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
          padding: '18px 22px', marginBottom: '24px', maxWidth: '700px'
        }}>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>বর্তমান প্যাকেজ</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#163a2c', marginBottom: '10px' }}>
            {currentPkg ? currentPkg.name_bn : 'নির্ধারিত নেই'}
          </div>
          <div style={{ fontSize: '13px', color: '#555', marginBottom: '6px' }}>
            পণ্য ব্যবহার: {productCount}{currentPkg?.max_products != null ? ` / ${currentPkg.max_products}` : ' / আনলিমিটেড'}
          </div>
          {usagePercent != null && (
            <div style={{ background: '#eee', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
              <div style={{
                width: `${usagePercent}%`, height: '100%',
                background: usagePercent >= 100 ? '#c62828' : usagePercent >= 80 ? '#f4a300' : '#2e7d32',
              }} />
            </div>
          )}
        </div>

        {/* Package options */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {packages.map(pkg => {
            const isCurrent = shop?.package_id === pkg.id
            return (
              <div key={pkg.id} style={{
                background: 'white', borderRadius: '12px',
                border: isCurrent ? '2px solid #2d6a4f' : '1px solid #e0e0e0',
                padding: '22px', minWidth: '240px', flex: '1 1 240px', position: 'relative'
              }}>
                {isCurrent && (
                  <span style={{
                    position: 'absolute', top: '14px', right: '14px', fontSize: '11px',
                    fontWeight: '700', color: '#2d6a4f', background: '#e8f5e9',
                    padding: '3px 10px', borderRadius: '10px'
                  }}>বর্তমান</span>
                )}
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#163a2c', marginBottom: '4px' }}>
                  {pkg.name_bn}
                </div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#2e7d32', marginBottom: '14px' }}>
                  {pkg.price > 0 ? `৳${pkg.price}` : 'ফ্রি'}
                  {pkg.price > 0 && <span style={{ fontSize: '12px', color: '#999', fontWeight: '400' }}>/মাস</span>}
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', marginBottom: '18px' }}>
                  {(pkg.features_bn || []).map((f, i) => (
                    <li key={i} style={{
                      fontSize: '13px', color: '#444', marginBottom: '8px',
                      display: 'flex', alignItems: 'flex-start', gap: '6px'
                    }}>
                      <span style={{ color: '#2e7d32' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSwitch(pkg)}
                  disabled={isCurrent || switchingId === pkg.id}
                  style={{
                    width: '100%', border: 'none', borderRadius: '8px', padding: '10px',
                    fontSize: '14px', fontWeight: '600', cursor: isCurrent ? 'default' : 'pointer',
                    background: isCurrent ? '#f0f0f0' : '#163a2c',
                    color: isCurrent ? '#999' : 'white',
                  }}
                >
                  {isCurrent ? 'সক্রিয়' : switchingId === pkg.id ? 'পরিবর্তন হচ্ছে...' : 'এই প্যাকেজ নিন'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </SellerNav>
  )
}
