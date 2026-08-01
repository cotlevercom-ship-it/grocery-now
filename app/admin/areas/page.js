'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

export default function AdminAreasPage() {
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [newName, setNewName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  const [deletingId, setDeletingId] = useState(null)

  async function loadAreas() {
    setLoading(true)
    setError('')
    try {
      const data = await supabaseFetch('areas?select=*&order=name')
      setAreas(data || [])
    } catch (e) {
      console.error(e)
      setError('এলাকা লোড করতে সমস্যা হয়েছে')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadAreas()
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    if (!newName.trim()) {
      setError('এলাকার নাম দিন')
      return
    }
    setSubmitting(true)
    try {
      await supabaseFetch('areas', {
        method: 'POST',
        body: JSON.stringify({ name: newName.trim() }),
      })
      setNewName('')
      await loadAreas()
    } catch (e) {
      console.error(e)
      setError('এলাকা যোগ করতে সমস্যা হয়েছে')
    }
    setSubmitting(false)
  }

  const startEdit = (area) => {
    setEditingId(area.id)
    setEditName(area.name)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
  }

  const saveEdit = async (id) => {
    if (!editName.trim()) return
    setSavingEdit(true)
    try {
      await supabaseFetch(`areas?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: editName.trim() }),
      })
      setEditingId(null)
      setEditName('')
      await loadAreas()
    } catch (e) {
      console.error(e)
      setError('এলাকা আপডেট করতে সমস্যা হয়েছে')
    }
    setSavingEdit(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('এই এলাকাটি মুছে ফেলতে চান?')) return
    setDeletingId(id)
    try {
      await supabaseFetch(`areas?id=eq.${id}`, { method: 'DELETE' })
      await loadAreas()
    } catch (e) {
      console.error(e)
      setError('এলাকা মুছতে সমস্যা হয়েছে। এই এলাকায় দোকান থাকলে আগে সেগুলো সরান।')
    }
    setDeletingId(null)
  }

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '8px' }}>
        এলাকা
      </h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>
        যেসব এলাকায় সার্ভিস দেওয়া হয় সেগুলো এখান থেকে যোগ/পরিবর্তন/মুছে ফেলা যাবে।
      </p>

      {/* Add form */}
      <form onSubmit={handleAdd} style={{
        background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
        padding: '16px', marginBottom: '24px', display: 'flex', gap: '10px', maxWidth: '480px'
      }}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="নতুন এলাকার নাম (যেমন: ধানমন্ডি)"
          style={{
            flex: 1, padding: '10px 12px', borderRadius: '8px',
            border: '1px solid #ddd', fontSize: '14px'
          }}
        />
        <button
          type="submit"
          disabled={submitting}
          style={{
            background: submitting ? '#9ca3af' : '#163a2c', color: 'white',
            padding: '10px 20px', borderRadius: '8px', fontSize: '14px',
            fontWeight: '600', border: 'none', whiteSpace: 'nowrap'
          }}>
          {submitting ? 'যোগ হচ্ছে...' : '+ যোগ করুন'}
        </button>
      </form>

      {error && (
        <div style={{
          maxWidth: '480px', marginBottom: '16px', padding: '10px 12px',
          background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
        }}>{error}</div>
      )}

      {/* Areas list */}
      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>লোড হচ্ছে...</div>
      ) : areas.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '50px 20px', color: '#999',
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>📍</div>
          <p>এখনো কোনো এলাকা যোগ করা হয়নি</p>
        </div>
      ) : (
        <div style={{
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
          overflow: 'hidden', maxWidth: '640px'
        }}>
          {areas.map((area, i) => (
            <div key={area.id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 16px',
              borderBottom: i < areas.length - 1 ? '1px solid #eee' : 'none'
            }}>
              <span style={{ fontSize: '18px' }}>📍</span>

              {editingId === area.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{
                      flex: 1, padding: '8px 10px', borderRadius: '6px',
                      border: '1px solid #ddd', fontSize: '14px'
                    }}
                  />
                  <button
                    onClick={() => saveEdit(area.id)}
                    disabled={savingEdit}
                    style={{
                      background: '#163a2c', color: 'white', border: 'none',
                      borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '600'
                    }}>সেভ</button>
                  <button
                    onClick={cancelEdit}
                    style={{
                      background: '#f0f0f0', color: '#555', border: 'none',
                      borderRadius: '6px', padding: '7px 14px', fontSize: '12px'
                    }}>বাতিল</button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1, fontSize: '14px', fontWeight: '500', color: '#1a1a1a' }}>
                    {area.name}
                  </span>
                  <button
                    onClick={() => startEdit(area)}
                    style={{
                      background: '#f5f5f5', color: '#2d6a4f', border: 'none',
                      borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                    }}>এডিট</button>
                  <button
                    onClick={() => handleDelete(area.id)}
                    disabled={deletingId === area.id}
                    style={{
                      background: '#ffebee', color: '#c62828', border: 'none',
                      borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500'
                    }}>
                    {deletingId === area.id ? 'মুছছে...' : 'মুছুন'}
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
