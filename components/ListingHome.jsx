'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'

const TYPES = [
  { value: 'all', label: 'সব', icon: '🔍' },
  { value: 'co_founder', label: 'কো-ফাউন্ডার', icon: '🤝' },
  { value: 'partner', label: 'পার্টনার', icon: '👥' },
  { value: 'investor', label: 'ইনভেস্টর', icon: '💰' },
  { value: 'employee', label: 'কর্মী', icon: '💼' },
  { value: 'supplier', label: 'সাপ্লায়ার', icon: '📦' },
  { value: 'buyer', label: 'বায়ার', icon: '🛒' },
]

const TYPE_LABEL = Object.fromEntries(TYPES.map(t => [t.value, t.label]))

export default function ListingHome() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await supabaseFetch('listings?select=*&status=eq.active&order=created_at.desc')
        setListings(data || [])
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filterType === 'all'
    ? listings
    : listings.filter(l => (l.listing_types || []).includes(filterType))

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 40px)' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #163a2c 0%, #2d6a4f 100%)',
        borderRadius: '16px', padding: 'clamp(24px, 4vw, 44px)', marginBottom: '28px', color: 'white'
      }}>
        <h1 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: '800', marginBottom: '8px' }}>
          ব্যবসার জন্য সঠিক মানুষ খুঁজুন
        </h1>
        <p style={{ fontSize: 'clamp(13px, 1.2vw, 16px)', color: 'rgba(255,255,255,0.85)', maxWidth: '540px', marginBottom: '18px' }}>
          কো-ফাউন্ডার, পার্টনার, ইনভেস্টর, কর্মী, সাপ্লায়ার বা বায়ার — যাই খুঁজুন না কেন, আপনার বিজনেস লিস্ট করুন।
        </p>
        <Link href="/listings/new" style={{
          display: 'inline-block', background: '#f4a300', color: '#0a0a0a',
          borderRadius: '10px', padding: '12px 22px', fontSize: '14px', fontWeight: '700'
        }}>+ আপনার বিজনেস লিস্ট করুন</Link>
      </div>

      {/* Type filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {TYPES.map(t => (
          <button key={t.value} onClick={() => setFilterType(t.value)} style={{
            padding: '8px 16px', borderRadius: '20px', border: '1px solid #ddd',
            fontSize: '13px', fontWeight: '600',
            background: filterType === t.value ? '#163a2c' : 'white',
            color: filterType === t.value ? 'white' : '#444'
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: '#888', fontSize: '14px', textAlign: 'center', padding: '40px' }}>লোড হচ্ছে...</div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px', color: '#999',
          background: 'white', borderRadius: '12px', border: '1px solid #e5e5e5'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏢</div>
          <p>এই মুহূর্তে কোনো লিস্টিং নেই</p>
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(240px,25vw,300px),1fr))',
          gap: 'clamp(12px, 1.4vw, 20px)'
        }}>
          {filtered.map(listing => (
            <Link key={listing.id} href={`/listing/${listing.id}`} style={{
              background: 'white', borderRadius: '12px', border: '1px solid #e5e5e5',
              padding: '18px', display: 'block'
            }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px' }}>
                {listing.business_name}
              </div>
              <div style={{ fontSize: '12.5px', color: '#888', marginBottom: '10px' }}>
                {listing.industry || 'শিল্প উল্লেখ নেই'}{listing.location ? ` · ${listing.location}` : ''}
              </div>
              <p style={{
                fontSize: '12.5px', color: '#555', marginBottom: '12px',
                overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '32px'
              }}>{listing.description || ''}</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {(listing.listing_types || []).map(t => (
                  <span key={t} style={{
                    fontSize: '10.5px', fontWeight: '700', padding: '3px 9px', borderRadius: '6px',
                    background: '#e8f3ee', color: '#2d6a4f'
                  }}>{TYPE_LABEL[t] || t}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
