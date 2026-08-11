'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'
import { addToCart } from '@/lib/cart'

const CONDITION_LABEL = { 'like-new': 'নতুনের মতো', good: 'ভালো', fair: 'মোটামুটি' }
const CATEGORY_LABEL = {
  novel: 'উপন্যাস', fiction: 'ফিকশন', 'non-fiction': 'নন-ফিকশন',
  magazine: 'ম্যাগাজিন', academic: 'একাডেমিক'
}

export default function BookDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await supabaseFetch(`books?select=*&id=eq.${id}`)
        setBook(data?.[0] || null)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    if (id) load()
  }, [id])

  const handleAdd = () => {
    if (!book) return
    addToCart(book, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const handleBuyNow = () => {
    if (!book) return
    addToCart(book, qty)
    router.push('/cart')
  }

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>লোড হচ্ছে...</div>
  }

  if (!book) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
        বইটি পাওয়া যায়নি। <Link href="/" style={{ color: '#2d6a4f', fontWeight: '600' }}>হোমে ফিরে যান</Link>
      </div>
    )
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 40px)', maxWidth: '900px', margin: '0 auto' }}>
      <Link href="/" style={{ fontSize: '13px', color: '#666', display: 'inline-block', marginBottom: '16px' }}>← সব বইয়ে ফিরে যান</Link>

      <div style={{ display: 'flex', gap: 'clamp(16px, 3vw, 32px)', flexWrap: 'wrap' }}>
        <div style={{
          width: 'clamp(160px, 30vw, 260px)', height: 'clamp(220px, 40vw, 340px)',
          borderRadius: '12px', background: '#f5f5f5', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
        }}>
          {book.image_url ? (
            <img src={book.image_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : <span style={{ fontSize: '48px' }}>📕</span>}
        </div>

        <div style={{ flex: 1, minWidth: '240px' }}>
          <span style={{
            fontSize: '11px', fontWeight: '700', color: '#2d6a4f',
            background: '#e8f3ee', padding: '3px 10px', borderRadius: '6px'
          }}>{CATEGORY_LABEL[book.category] || book.category}</span>

          <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: '800', margin: '10px 0 4px' }}>
            {book.title}
          </h1>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '14px' }}>
            {book.author || 'লেখক অজানা'}
          </div>

          <div style={{ fontSize: 'clamp(22px, 2.5vw, 28px)', fontWeight: '800', color: '#163a2c', marginBottom: '10px' }}>
            ৳{book.price}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', background: '#f0f0f0', color: '#555' }}>
              কন্ডিশন: {CONDITION_LABEL[book.condition] || book.condition}
            </span>
            <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', background: '#f0f0f0', color: '#555' }}>
              স্টক: {book.stock} কপি
            </span>
          </div>

          {book.description && (
            <p style={{ fontSize: '14px', color: '#444', lineHeight: '1.6', marginBottom: '20px' }}>
              {book.description}
            </p>
          )}

          {book.stock > 0 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', color: '#555' }}>পরিমাণ:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px' }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ padding: '8px 14px', background: 'white', fontSize: '14px' }}>−</button>
                  <span style={{ padding: '0 14px', fontSize: '14px', fontWeight: '600' }}>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(book.stock, q + 1))} style={{ padding: '8px 14px', background: 'white', fontSize: '14px' }}>+</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={handleAdd} style={{
                  background: added ? '#2d6a4f' : '#f4a300',
                  color: added ? 'white' : '#0a0a0a',
                  borderRadius: '10px', padding: '12px 22px', fontSize: '14px', fontWeight: '700'
                }}>
                  {added ? '✓ কার্টে যোগ হয়েছে' : 'কার্টে যোগ করুন'}
                </button>
                <button onClick={handleBuyNow} style={{
                  background: '#163a2c', color: 'white',
                  borderRadius: '10px', padding: '12px 22px', fontSize: '14px', fontWeight: '700'
                }}>এখনই কিনুন</button>
              </div>
            </>
          ) : (
            <div style={{ color: '#c62828', fontSize: '14px', fontWeight: '600' }}>স্টকে নেই</div>
          )}
        </div>
      </div>
    </div>
  )
}
