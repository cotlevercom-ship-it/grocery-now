'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch, createReferralIfNeeded } from '@/lib/supabase'

export default function AdminPackageRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [processingId, setProcessingId] = useState(null)

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const data = await supabaseFetch(
        `package_payment_requests?select=*,shops(name,phone,ref_code),seller_packages(name,price)&order=created_at.desc`
      )
      setRequests(data || [])
    } catch (e) {
      console.error(e)
      setError('Failed to load data')
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleApprove = async (req) => {
    if (!confirm(`Approve the "${req.seller_packages?.name}" package for "${req.shops?.name}"?`)) return
    setProcessingId(req.id)
    try {
      await supabaseFetch(`package_payment_requests?id=eq.${req.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved', reviewed_at: new Date().toISOString() }),
      })
      await supabaseFetch(`shops?id=eq.${req.shop_id}`, {
        method: 'PATCH',
        body: JSON.stringify({ package_id: req.package_id, is_active: true }),
      })
      if (req.shops?.ref_code) {
        await createReferralIfNeeded(req.shop_id, req.shops.ref_code)
      }
      await loadData()
    } catch (e) {
      console.error(e)
      setError('Failed to approve')
    }
    setProcessingId(null)
  }

  const handleReject = async (req) => {
    if (!confirm(`Reject this request from "${req.shops?.name}"?`)) return
    setProcessingId(req.id)
    try {
      await supabaseFetch(`package_payment_requests?id=eq.${req.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'rejected', reviewed_at: new Date().toISOString() }),
      })
      await loadData()
    } catch (e) {
      console.error(e)
      setError('Failed to reject')
    }
    setProcessingId(null)
  }

  const filtered = requests.filter(r => statusFilter === 'all' || r.status === statusFilter)

  const statusBadge = (status) => {
    const map = {
      pending: { bg: '#fff3e0', color: '#f4a300', label: 'Pending' },
      approved: { bg: '#f5f5f5', color: '#2d6a4f', label: 'Approved' },
      rejected: { bg: '#ffebee', color: '#c62828', label: 'Rejected' },
    }
    const s = map[status] || map.pending
    return (
      <span style={{
        fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '10px',
        background: s.bg, color: s.color
      }}>{s.label}</span>
    )
  }

  const inputStyle = {
    padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px', maxWidth: '200px'
  }

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '4px' }}>
        Package Payment Requests
      </h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '18px' }}>
        Verify sellers' bKash Transaction IDs and approve packages.
      </p>

      {error && (
        <div style={{
          marginBottom: '16px', padding: '10px 12px',
          background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
        }}>{error}</div>
      )}

      <select style={{ ...inputStyle, marginBottom: '16px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="all">All</option>
      </select>

      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '50px 20px', color: '#999',
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>💳</div>
          <p>No requests</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          {filtered.map((req, i) => (
            <div key={req.id} style={{
              display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
              borderBottom: i < filtered.length - 1 ? '1px solid #eee' : 'none', flexWrap: 'wrap'
            }}>
              <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                  {req.shops?.name || 'Unknown shop'}
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                  {req.seller_packages?.name} · ৳{req.amount}
                </div>
              </div>
              <div style={{ flex: '1 1 200px', fontSize: '13px', color: '#444' }}>
                <div>Payer Number: <b>{req.payer_number}</b></div>
                <div>Trx ID: <b style={{ fontFamily: 'monospace' }}>{req.trx_id}</b></div>
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                {new Date(req.created_at).toLocaleString('en-US')}
              </div>
              {statusBadge(req.status)}
              {req.status === 'pending' && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleApprove(req)} disabled={processingId === req.id} style={{
                    background: '#f5f5f5', color: '#2d6a4f', border: 'none',
                    borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '600'
                  }}>Approve</button>
                  <button onClick={() => handleReject(req)} disabled={processingId === req.id} style={{
                    background: '#ffebee', color: '#c62828', border: 'none',
                    borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '600'
                  }}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
