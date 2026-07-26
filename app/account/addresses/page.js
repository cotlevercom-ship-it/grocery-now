'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch } from '@/lib/supabase'

export default function AddressesPage() {
  const router = useRouter()
  const [loaded, setLoaded] = useState(false)
  const [userId, setUserId] = useState(null)
  const [addresses, setAddresses] = useState([])

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [label, setLabel] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadAddresses = async (uid) => {
    try {
      const rows = await supabaseFetch(`user_addresses?select=*&user_id=eq.${uid}&order=is_default.desc,created_at.desc`)
      setAddresses(rows || [])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    async function init() {
      const session = getSession()
      if (!session?.user?.id) {
        router.replace('/login?next=/account/addresses')
        return
      }
      setUserId(session.user.id)
      await loadAddresses(session.user.id)
      setLoaded(true)
    }
    init()
  }, [router])

  const resetForm = () => {
    setEditingId(null)
    setLabel('')
    setAddress('')
    setPhone('')
    setError('')
  }

  const openAddForm = () => {
    resetForm()
    setShowForm(true)
  }

  const openEditForm = (addr) => {
    setEditingId(addr.id)
    setLabel(addr.label || '')
    setAddress(addr.address || '')
    setPhone(addr.phone || '')
    setError('')
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    if (!address.trim()) {
      setError('Please enter an address')
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await supabaseFetch(`user_addresses?id=eq.${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            label: label.trim() || null,
            address: address.trim(),
            phone: phone.trim() || null,
          }),
        })
      } else {
        const isFirst = addresses.length === 0
        await supabaseFetch('user_addresses', {
          method: 'POST',
          body: JSON.stringify({
            user_id: userId,
            label: label.trim() || null,
            address: address.trim(),
            phone: phone.trim() || null,
            is_default: isFirst,
          }),
        })
      }
      await loadAddresses(userId)
      setShowForm(false)
      resetForm()
    } catch (err) {
      console.error(err)
      setError('Failed to save, please try again')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    try {
      await supabaseFetch(`user_addresses?id=eq.${id}`, { method: 'DELETE' })
      await loadAddresses(userId)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSetDefault = async (id) => {
    try {
      await supabaseFetch(`user_addresses?user_id=eq.${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_default: false }),
      })
      await supabaseFetch(`user_addresses?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_default: true }),
      })
      await loadAddresses(userId)
    } catch (e) {
      console.error(e)
    }
  }

  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#999', fontSize: '14px' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', paddingBottom: '40px' }}>
      {/* Topbar */}
      <div style={{
        background: '#0a0a0a', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/account">
            <div style={{ color: 'white', fontSize: '22px', lineHeight: 1 }}>←</div>
          </Link>
          <div style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>My Addresses</div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }}>

        {/* Address list */}
        <div style={{ margin: '16px 16px 0' }}>
          {addresses.length === 0 && !showForm && (
            <div style={{
              background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
              padding: '28px 16px', textAlign: 'center', color: '#999'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📍</div>
              <div style={{ fontSize: '13px' }}>No address saved</div>
            </div>
          )}

          {addresses.map(addr => (
            <div key={addr.id} style={{
              background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
              padding: '14px', marginBottom: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a1a' }}>{addr.label || 'Address'}</span>
                    {addr.is_default && (
                      <span style={{
                        fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px',
                        background: '#fde8e8', color: '#b91c1c'
                      }}>Default</span>
                    )}
                  </div>
                  <div style={{ fontSize: '13px', color: '#555', lineHeight: 1.4 }}>{addr.address}</div>
                  {addr.phone && <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{addr.phone}</div>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f0f0f0' }}>
                {!addr.is_default && (
                  <button onClick={() => handleSetDefault(addr.id)} style={{
                    fontSize: '12px', color: '#b91c1c', background: 'none', border: 'none',
                    fontWeight: '600', cursor: 'pointer', padding: 0
                  }}>Set as Default</button>
                )}
                <button onClick={() => openEditForm(addr)} style={{
                  fontSize: '12px', color: '#555', background: 'none', border: 'none',
                  fontWeight: '600', cursor: 'pointer', padding: 0
                }}>Edit</button>
                <button onClick={() => handleDelete(addr.id)} style={{
                  fontSize: '12px', color: '#c62828', background: 'none', border: 'none',
                  fontWeight: '600', cursor: 'pointer', padding: 0
                }}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        {!showForm && (
          <div style={{ padding: '0 16px' }}>
            <button onClick={openAddForm} style={{
              width: '100%', background: 'white', color: '#b91c1c', border: '1px dashed #b91c1c',
              borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
            }}>+ Add New Address</button>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSave} style={{ padding: '0 16px' }}>
            <div style={{
              background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0', padding: '16px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#1a1a1a' }}>
                {editingId ? 'Edit Address' : 'New Address'}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Label (optional)</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Home, Office"
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Full Address *</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House/flat number, road, area name"
                  rows={3}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box',
                    resize: 'none', fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ marginBottom: '4px' }}>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Phone Number (optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="If different for this address"
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
                  }}
                />
              </div>

              {error && (
                <div style={{
                  margin: '12px 0 0', padding: '10px 12px', background: '#ffebee',
                  color: '#c62828', borderRadius: '8px', fontSize: '13px'
                }}>{error}</div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button type="submit" disabled={saving} style={{
                  flex: 1, background: saving ? '#999' : '#0a0a0a', color: 'white',
                  padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', border: 'none'
                }}>{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => { setShowForm(false); resetForm() }} style={{
                  flex: 1, background: 'white', color: '#555', border: '1px solid #ddd',
                  padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '600'
                }}>Cancel</button>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}
