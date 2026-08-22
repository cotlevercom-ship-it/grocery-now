'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

function timeLabel(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString(undefined, { hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' })
}

export default function AdminPremiumRequestsPage() {
  const [pending, setPending] = useState([])
  const [active, setActive] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [pendingRows, activeRows] = await Promise.all([
        supabaseFetch(`member_profiles?select=user_id,display_name,contact_email,premium_transaction_note,premium_requested_at&premium_status=eq.pending&order=premium_requested_at.asc`),
        supabaseFetch(`member_profiles?select=user_id,display_name,contact_email&is_premium=eq.true&order=display_name.asc`),
      ])
      setPending(pendingRows || [])
      setActive(activeRows || [])
    } catch (e) {
      console.error(e)
      setError('Failed to load')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const approve = async (userId) => {
    setBusyId(userId)
    try {
      await supabaseFetch(`member_profiles?user_id=eq.${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_premium: true, premium_status: 'active' }),
      })
      await load()
    } catch (e) {
      console.error(e)
      alert('Failed to approve')
    }
    setBusyId(null)
  }

  const reject = async (userId) => {
    if (!confirm('Reject this Premium request?')) return
    setBusyId(userId)
    try {
      await supabaseFetch(`member_profiles?user_id=eq.${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ premium_status: 'none' }),
      })
      await load()
    } catch (e) {
      console.error(e)
      alert('Failed to reject')
    }
    setBusyId(null)
  }

  const revoke = async (userId) => {
    if (!confirm('Revoke Premium for this member?')) return
    setBusyId(userId)
    try {
      await supabaseFetch(`member_profiles?user_id=eq.${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_premium: false, premium_status: 'none' }),
      })
      await load()
    } catch (e) {
      console.error(e)
      alert('Failed to revoke')
    }
    setBusyId(null)
  }

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '4px' }}>Premium Requests</h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        Approve or reject bKash payment claims submitted from a member&apos;s account page.
      </p>

      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>Loading...</div>
      ) : error ? (
        <div style={{ color: '#c0392b', fontSize: '14px' }}>{error}</div>
      ) : (
        <>
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e0e0e0', overflow: 'hidden', marginBottom: '28px' }}>
            <div style={{ padding: '12px 16px', fontWeight: '700', fontSize: '13.5px', background: '#fafafa', borderBottom: '1px solid #eee' }}>
              Pending ({pending.length})
            </div>
            {pending.length === 0 ? (
              <div style={{ padding: '20px 16px', color: '#999', fontSize: '13.5px' }}>No pending requests.</div>
            ) : pending.map(p => (
              <div key={p.user_id} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                borderBottom: '1px solid #eee', flexWrap: 'wrap',
              }}>
                <div style={{ flex: '1 1 200px' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: '600' }}>{p.display_name || '(no name)'}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{p.contact_email}</div>
                </div>
                <div style={{ flex: '1 1 160px', fontSize: '12.5px', color: '#555' }}>
                  {p.premium_transaction_note ? <>Txn: <b>{p.premium_transaction_note}</b></> : <span style={{ color: '#aaa' }}>No txn ID given</span>}
                  <div style={{ color: '#999' }}>{timeLabel(p.premium_requested_at)}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => approve(p.user_id)}
                    disabled={busyId === p.user_id}
                    style={{
                      padding: '7px 14px', borderRadius: '6px', border: 'none', background: '#2d6a4f', color: '#fff',
                      fontSize: '12.5px', fontWeight: '700', cursor: 'pointer',
                    }}
                  >Approve</button>
                  <button
                    onClick={() => reject(p.user_id)}
                    disabled={busyId === p.user_id}
                    style={{
                      padding: '7px 14px', borderRadius: '6px', border: '1px solid #e0a0a0', background: '#fff5f5',
                      color: '#c0392b', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer',
                    }}
                  >Reject</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', fontWeight: '700', fontSize: '13.5px', background: '#fafafa', borderBottom: '1px solid #eee' }}>
              Active Premium Members ({active.length})
            </div>
            {active.length === 0 ? (
              <div style={{ padding: '20px 16px', color: '#999', fontSize: '13.5px' }}>No active Premium members yet.</div>
            ) : active.map(p => (
              <div key={p.user_id} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                borderBottom: '1px solid #eee', flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13.5px', fontWeight: '600' }}>{p.display_name || '(no name)'}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{p.contact_email}</div>
                </div>
                <button
                  onClick={() => revoke(p.user_id)}
                  disabled={busyId === p.user_id}
                  style={{
                    padding: '7px 14px', borderRadius: '6px', border: '1px solid #e0a0a0', background: '#fff5f5',
                    color: '#c0392b', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer',
                  }}
                >Revoke</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
