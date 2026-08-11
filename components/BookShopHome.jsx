'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'
import { addToCart } from '@/lib/cart'

const CATEGORIES = [
  { value: 'all', label: 'সব বই' },
  { value: 'novel', label: 'উপন্যাস' },
  { value: 'fiction', label: 'ফিকশন' },
  { value: 'non-fiction', label: 'নন-ফিকশন' },
  { value: 'magazine', label: 'ম্যাগাজিন' },
  { value: 'academic', label: 'একাডেমিক' },
]

const CONDITION_LABEL = { 'like-new': 'নতুনের মতো', good: 'ভালো', fair: 'মোটামুটি' }

export default function BookShopHome() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [addedId, setAddedId] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await supabaseFetch('books?select=*&is_active=eq.true&stock=gt.0&order=created_at.desc')
        setBooks(data || [])
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = category === 'all' ? books : books.filter(b => b.category === category)

  const handleAdd = (e, book) => {
    e.preventDefault()
    addToCart(book, 1)
    setAddedId(book.id)
    setTimeout(() => setAddedId(null), 1200)
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 40px)' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #163a2c 0%, #2d6a4f 100%)',
        borderRadius: '16px', padding: 'clamp(24px, 4vw, 44px)', marginBottom: '28px',
        color: 'white'
      }}>
        <h1 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: '800', marginBottom: '8px' }}>
          পুরাতন বই, নতুন গল্প
        </h1>
        <p style={{ fontSize: 'clamp(13px, 1.2vw, 16px)', color: 'rgba(255,255,255,0.85)', maxWidth: '520px' }}>
          সাশ্রয়ী দামে পুরাতন বই — উপন্যাস, ফিকশন, নন-ফিকশন, ম্যাগাজিন ও একাডেমিক বই এক জায়গায়।
        </p>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => (
          <button key={c.value} onClick={() => setCategory(c.value)} style={{
            padding: '8px 16px', borderRadius: '20px', border: '1px solid #ddd',
            fontSize: '13px', fontWeight: '600',
            background: category === c.value ? '#163a2c' : 'white',
            color: category === c.value ? 'white' : '#444'
          }}>{c.label}</button>
        ))}
      </div>

      {/* Book grid */}
      {loading ? (
        <div style={{ color: '#888', fontSize: '14px', textAlign: 'center', padding: '40px' }}>লোড হচ্ছে...</div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px', color: '#999',
          background: 'white', borderRadius: '12px', border: '1px solid #e5e5e5'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>📚</div>
          <p>এই মুহূর্তে কোনো বই নেই</p>
        </div>
      ) : (
        <div className="book-grid">
          {filtered.map(book => (
            <Link key={book.id} href={`/book/${book.id}`} className="book-card">
              <div className="book-card-image">
                {book.image_url ? (
                  <img src={book.image_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : <span style={{ fontSize: '32px' }}>📕</span>}
              </div>
              <div style={{ padding: '12px' }}>
                <div style={{
                  fontSize: '13.5px', fontWeight: '700', color: '#1a1a1a',
                  overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '36px'
                }}>{book.title}</div>
                <div style={{ fontSize: '11.5px', color: '#888', marginTop: '3px' }}>
                  {book.author || 'লেখক অজানা'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                  <span style={{
                    fontSize: '10px', padding: '2px 7px', borderRadius: '6px',
                    background: '#f0f0f0', color: '#666'
                  }}>{CONDITION_LABEL[book.condition] || book.condition}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#163a2c' }}>৳{book.price}</span>
                  <button onClick={(e) => handleAdd(e, book)} style={{
                    background: addedId === book.id ? '#2d6a4f' : '#f4a300',
                    color: addedId === book.id ? 'white' : '#0a0a0a',
                    borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: '700'
                  }}>
                    {addedId === book.id ? '✓ যোগ হয়েছে' : 'কার্টে যোগ'}
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style jsx>{`
        .book-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(clamp(140px, 15vw, 190px), 1fr));
          gap: clamp(12px, 1.4vw, 20px);
        }
        .book-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e5e5e5;
          display: block;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .book-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(22, 58, 44, 0.1);
        }
        .book-card-image {
          height: clamp(200px, 26vw, 320px);
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  )
}
