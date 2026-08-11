'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch, uploadImage } from '@/lib/supabase'

const CATEGORIES = [
  { value: 'novel', label: 'Novel' },
  { value: 'fiction', label: 'Fiction' },
  { value: 'non-fiction', label: 'Non-fiction' },
  { value: 'magazine', label: 'Magazine' },
  { value: 'academic', label: 'Academic' },
]
const CONDITIONS = [
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
]

const emptyForm = {
  title: '', author: '', category: 'novel', condition: 'good',
  price: '', stock: 1, description: '', image_url: '', is_active: true,
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploading, setUploading] = useState(false)

  const [deletingId, setDeletingId] = useState(null)

  async function loadBooks() {
    setLoading(true)
    setError('')
    try {
      const data = await supabaseFetch('books?select=*&order=created_at.desc')
      setBooks(data || [])
    } catch (e) {
      console.error(e)
      setError('Failed to load books')
    }
    setLoading(false)
  }

  useEffect(() => { loadBooks() }, [])

  const openAddForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setImageFile(null)
    setImagePreview('')
    setError('')
    setShowForm(true)
  }

  const openEditForm = (book) => {
    setEditingId(book.id)
    setForm({
      title: book.title || '',
      author: book.author || '',
      category: book.category || 'novel',
      condition: book.condition || 'good',
      price: book.price ?? '',
      stock: book.stock ?? 1,
      description: book.description || '',
      image_url: book.image_url || '',
      is_active: !!book.is_active,
    })
    setImageFile(null)
    setImagePreview(book.image_url || '')
    setError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setImageFile(null)
    setImagePreview('')
  }

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) { setError('বইয়ের নাম দিন'); return }
    if (!form.price || Number(form.price) <= 0) { setError('সঠিক দাম দিন'); return }

    setSubmitting(true)
    try {
      let imageUrl = form.image_url
      if (imageFile) {
        setUploading(true)
        imageUrl = await uploadImage(imageFile, 'books')
        setUploading(false)
      }

      const payload = {
        title: form.title.trim(),
        author: form.author.trim() || null,
        category: form.category,
        condition: form.condition,
        price: Number(form.price),
        stock: Number(form.stock) || 0,
        description: form.description.trim() || null,
        image_url: imageUrl || null,
        is_active: !!form.is_active,
      }

      if (editingId) {
        await supabaseFetch(`books?id=eq.${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
      } else {
        await supabaseFetch('books', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      }

      closeForm()
      await loadBooks()
    } catch (e) {
      console.error(e)
      setError('সেভ করতে সমস্যা হয়েছে')
    }
    setSubmitting(false)
    setUploading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('এই বইটি ডিলিট করবেন?')) return
    setDeletingId(id)
    try {
      await supabaseFetch(`books?id=eq.${id}`, { method: 'DELETE' })
      await loadBooks()
    } catch (e) {
      console.error(e)
      setError('ডিলিট করতে সমস্যা হয়েছে')
    }
    setDeletingId(null)
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
  }
  const labelStyle = {
    fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px', fontWeight: '500'
  }

  const filteredBooks = filterCategory === 'all' ? books : books.filter(b => b.category === filterCategory)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', margin: 0 }}>Books</h1>
        {!showForm && (
          <button onClick={openAddForm} style={{
            background: '#163a2c', color: 'white', border: 'none', borderRadius: '8px',
            padding: '10px 18px', fontSize: '14px', fontWeight: '600'
          }}>+ New Book</button>
        )}
      </div>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        বই যোগ করুন, এডিট করুন বা ডিলিট করুন।
      </p>

      {error && (
        <div style={{
          maxWidth: '600px', marginBottom: '16px', padding: '10px 12px',
          background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
        }}>{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
          padding: '20px', marginBottom: '24px', maxWidth: '600px'
        }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#163a2c', marginBottom: '16px' }}>
            {editingId ? 'বই এডিট করুন' : 'নতুন বই যোগ করুন'}
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>বইয়ের ছবি</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '70px', height: '96px', borderRadius: '8px', background: '#f5f5f5',
                border: '1px solid #ddd', display: 'flex', alignItems: 'center',
                justifyContent: 'center', overflow: 'hidden', flexShrink: 0
              }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : '📕'}
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: '13px' }} />
            </div>
            {uploading && <div style={{ fontSize: '12px', color: '#2d6a4f', marginTop: '6px' }}>ছবি আপলোড হচ্ছে...</div>}
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>বইয়ের নাম *</label>
            <input style={inputStyle} value={form.title} onChange={e => handleFieldChange('title', e.target.value)} placeholder="বইয়ের নাম" />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>লেখক</label>
            <input style={inputStyle} value={form.author} onChange={e => handleFieldChange('author', e.target.value)} placeholder="লেখকের নাম" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>ক্যাটেগরি</label>
              <select style={inputStyle} value={form.category} onChange={e => handleFieldChange('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>কন্ডিশন</label>
              <select style={inputStyle} value={form.condition} onChange={e => handleFieldChange('condition', e.target.value)}>
                {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>দাম (৳) *</label>
              <input type="number" style={inputStyle} value={form.price} onChange={e => handleFieldChange('price', e.target.value)} placeholder="150" />
            </div>
            <div>
              <label style={labelStyle}>স্টক (কপি সংখ্যা)</label>
              <input type="number" style={inputStyle} value={form.stock} onChange={e => handleFieldChange('stock', e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>বিবরণ (ঐচ্ছিক)</label>
            <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} value={form.description} onChange={e => handleFieldChange('description', e.target.value)} placeholder="বইয়ের সংক্ষিপ্ত বিবরণ..." />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#444' }}>
              <input type="checkbox" checked={form.is_active} onChange={e => handleFieldChange('is_active', e.target.checked)} />
              সাইটে দেখানো হবে (Active)
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={submitting} style={{
              background: submitting ? '#9ca3af' : '#163a2c', color: 'white', border: 'none',
              borderRadius: '8px', padding: '10px 22px', fontSize: '14px', fontWeight: '600'
            }}>
              {submitting ? 'সেভ হচ্ছে...' : (editingId ? 'আপডেট করুন' : 'যোগ করুন')}
            </button>
            <button type="button" onClick={closeForm} style={{
              background: '#f0f0f0', color: '#555', border: 'none',
              borderRadius: '8px', padding: '10px 22px', fontSize: '14px'
            }}>বাতিল</button>
          </div>
        </form>
      )}

      {!showForm && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button onClick={() => setFilterCategory('all')} style={{
            padding: '6px 14px', borderRadius: '20px', border: '1px solid #ddd', fontSize: '12.5px',
            background: filterCategory === 'all' ? '#163a2c' : 'white',
            color: filterCategory === 'all' ? 'white' : '#444'
          }}>সব ({books.length})</button>
          {CATEGORIES.map(c => {
            const count = books.filter(b => b.category === c.value).length
            return (
              <button key={c.value} onClick={() => setFilterCategory(c.value)} style={{
                padding: '6px 14px', borderRadius: '20px', border: '1px solid #ddd', fontSize: '12.5px',
                background: filterCategory === c.value ? '#163a2c' : 'white',
                color: filterCategory === c.value ? 'white' : '#444'
              }}>{c.label} ({count})</button>
            )
          })}
        </div>
      )}

      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>লোড হচ্ছে...</div>
      ) : filteredBooks.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '50px 20px', color: '#999',
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>📚</div>
          <p>কোনো বই যোগ করা হয়নি</p>
        </div>
      ) : (
        <div style={{
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0', overflow: 'hidden'
        }}>
          {filteredBooks.map((book, i) => (
            <div key={book.id} style={{
              display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
              borderBottom: i < filteredBooks.length - 1 ? '1px solid #eee' : 'none', flexWrap: 'wrap'
            }}>
              <div style={{
                width: '46px', height: '62px', borderRadius: '6px', background: '#f5f5f5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0
              }}>
                {book.image_url ? (
                  <img src={book.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : '📕'}
              </div>

              <div style={{ flex: 1, minWidth: '140px' }}>
                <div style={{ fontSize: '13.5px', color: '#1a1a1a', fontWeight: '600' }}>
                  {book.title}
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                  {book.author || 'লেখক অজানা'} · {CATEGORIES.find(c => c.value === book.category)?.label} · স্টক: {book.stock}
                </div>
              </div>

              <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#163a2c', minWidth: '60px' }}>
                ৳{book.price}
              </div>

              <span style={{
                fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px',
                background: '#f5f5f5',
                color: book.is_active ? '#2d6a4f' : '#999'
              }}>{book.is_active ? 'Active' : 'Off'}</span>

              <button onClick={() => openEditForm(book)} style={{
                background: '#f5f5f5', color: '#2d6a4f', border: 'none',
                borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
              }}>Edit</button>
              <button onClick={() => handleDelete(book.id)} disabled={deletingId === book.id} style={{
                background: '#ffebee', color: '#c62828', border: 'none',
                borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
              }}>
                {deletingId === book.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
