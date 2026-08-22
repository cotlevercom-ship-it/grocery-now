'use client'
import { useState, useEffect } from 'react'
import { getSession, supabaseFetch } from '@/lib/supabase'

const DEPARTMENTS = [
  { value: 'members', label: 'Members' },
  { value: 'feed', label: 'Feed' },
  { value: 'resources', label: 'Resources' },
  { value: 'banners', label: 'Banners' },
  { value: 'pages', label: 'Page Management' },
  { value: 'agreements', label: 'Agreements' },
  { value: 'help', label: 'Help Center' },
  { value: 'settings', label: 'Settings' },
  { value: 'super_admin', label: 'Super Admin (full access)' },
]

const roleLabel = (role) => DEPARTMENTS.find(d => d.value === role)?.label || role

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [myUserId, setMyUserId] = useState(null)

  const [email, setEmail] = useState('')
  const [role, setRole] = useState('members')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const rows = await supabaseFetch('admin_users?select=*&order=created_at.asc')
      setAdmins(rows || [])
    } catch (e) {
      console.error(e)
      setError('Failed to load admin users')
    }
    setLoading(false)
  }

  useEffect(() => {
    setMyUserId(getSession()?.user?.id || null)
    load()
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setAdding(true)
    setAddError('')
    try {
      const res = await fetch('/api/admin/add-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add admin')
      setEmail('')
      setRole('members')
      await load()
    } catch (e) {
      setAddError(e.message)
    }
    setAdding(false)
  }

  const handleRemove = async (admin) => {
    if (admin.user_id === myUserId) {
      alert("You can't remove your own admin access.")
      return
    }
    if (!confirm(`Remove admin access for ${admin.email}?`)) return
    try {
      await supabaseFetch(`admin_users?id=eq.${admin.id}`, { method: 'DELETE' })
      await load()
    } catch (e) {
      console.error(e)
      alert('Failed to remove')
    }
  }

  const handleRoleChange = async (admin, newRole) => {
    try {
      await supabaseFetch(`admin_users?id=eq.${admin.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      })
      await load()
    } catch (e) {
      console.error(e)
      alert('Failed to update department')
    }
  }

  return (
    <div style={{ maxWidth: '760px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '6px' }}>Admin Users</h1>
      <p style={{ fontSize: '13.5px', color: '#666', marginBottom: '24px' }}>
        Give an employee access to just one department, or grant Super Admin for full access.
        The employee must already have a Cot Lever account (they sign up normally first).
      </p>

      <form onSubmit={handleAdd} style={{
        display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end',
        background: '#fff', padding: '16px', borderRadius: '10px', marginBottom: '28px', border: '1px solid #e5e5e5',
      }}>
        <div style={{ flex: '1 1 220px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>Employee's email</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="employee@example.com"
            style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
          />
        </div>
        <div style={{ flex: '1 1 180px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>Department</label>
          <select
            value={role} onChange={e => setRole(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
          >
            {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <button type="submit" disabled={adding} style={{
          padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2d6a4f', color: '#fff',
          fontWeight: '700', fontSize: '13.5px', cursor: adding ? 'default' : 'pointer', opacity: adding ? 0.7 : 1,
        }}>{adding ? 'Adding...' : 'Add Admin'}</button>
        {addError && <div style={{ width: '100%', fontSize: '12.5px', color: '#c0392b' }}>{addError}</div>}
      </form>

      {loading ? (
        <div style={{ color: '#666', fontSize: '14px' }}>Loading...</div>
      ) : error ? (
        <div style={{ color: '#c0392b', fontSize: '14px' }}>{error}</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e5e5e5', overflow: 'hidden' }}>
          {admins.map((a, i) => (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
              borderTop: i > 0 ? '1px solid #eee' : 'none', flexWrap: 'wrap',
            }}>
              <div style={{ flex: '1 1 200px', fontSize: '13.5px', fontWeight: '600' }}>{a.email}</div>
              <select
                value={a.role || 'super_admin'}
                onChange={e => handleRoleChange(a, e.target.value)}
                disabled={a.user_id === myUserId}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }}
              >
                {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
              <button
                onClick={() => handleRemove(a)}
                disabled={a.user_id === myUserId}
                style={{
                  padding: '6px 14px', borderRadius: '6px', border: '1px solid #e0a0a0', background: '#fff5f5',
                  color: '#c0392b', fontSize: '12.5px', fontWeight: '600',
                  cursor: a.user_id === myUserId ? 'not-allowed' : 'pointer', opacity: a.user_id === myUserId ? 0.5 : 1,
                }}
              >Remove</button>
            </div>
          ))}
          {admins.length === 0 && (
            <div style={{ padding: '20px 16px', color: '#999', fontSize: '13.5px' }}>No admin users yet.</div>
          )}
        </div>
      )}
    </div>
  )
}
