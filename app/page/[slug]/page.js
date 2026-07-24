'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'

export default function ContentPage() {
  const params = useParams()
  const slug = params?.slug
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      if (!slug) return
      setLoading(true)
      setNotFound(false)
      try {
        const rows = await supabaseFetch(`site_pages?select=*&slug=eq.${slug}&is_active=eq.true`)
        if (rows && rows.length > 0) {
          setPage(rows[0])
        } else {
          setNotFound(true)
        }
      } catch (e) {
        console.error(e)
        setNotFound(true)
      }
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <div style={{
        minHeight: '60vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: '#888', fontSize: '14px'
      }}>
        লোড হচ্ছে...
      </div>
    )
  }

  if (notFound || !page) {
    return (
      <div style={{
        minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center', padding: '24px', color: '#888'
      }}>
        <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔍</div>
        <p style={{ marginBottom: '16px' }}>পেজটি খুঁজে পাওয়া যায়নি</p>
        <Link href="/" style={{ color: '#2d6a4f', fontWeight: '600', fontSize: '14px' }}>← হোমে ফিরে যান</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 20px 60px' }}>
      <Link href="/" style={{ color: '#2d6a4f', fontSize: '13px', fontWeight: '600' }}>← হোমে ফিরে যান</Link>
      <h1 style={{
        fontSize: '26px', fontWeight: '700', color: '#163a2c',
        margin: '16px 0 20px'
      }}>{page.title}</h1>
      <div style={{
        fontSize: '15px', lineHeight: '1.8', color: '#333', whiteSpace: 'pre-wrap'
      }}>
        {page.content || 'এই পেজের কন্টেন্ট শীঘ্রই যুক্ত হবে।'}
      </div>
    </div>
  )
}
