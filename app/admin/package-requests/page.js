'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

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
        `package_payment_requests?select=*,shops(name,phone),seller_packages(name_bn,price)&order=created_at.desc`
      )
      setRequests(data || [])
    } catch (e) {
      console.error(e)
      setError('তথ্য লোড করতে সমস্যা হয়েছে')
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleApprove = async (req) => {
    if (!confirm(`"${req.shops?.name}" দোকানের জন্য "${req.seller_packages?.name_bn}" প্যাকেজ অনুমোদন করবেন?`)) return
    setProcessingId(req.id)
    try {
      await supabaseFetch(`package_payment_requests?id=eq.${req.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved', reviewed_at: new Date().toISOString() }),
      })
      await supabaseFetch(`shops?id=eq.${req.shop_id}`, {
        method: 'PATCH',
        body: JSON.stringify({ package_id: req.package_id }),
      })
      await loadData()
    } catch (e) {
      console.error(e)
      setError('অনুমোদন করতে সমস্যা হয়েছে')
    }
    setProcessingId(null)
  }

  const handleReject = async (req) => {
    if (!confirm(`"${req.shops?.name}" দোকানের এই রিকোয়েস্ট বাতিল করবেন?`)) return
    setProcessingId(req.id)
    try {
      await supabaseFetch(`package_payment_requests?id=eq.${req.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'rejected', reviewed_at: new Date().toISOString() }),
      })
      await loadData()
    } catch (e) {
      console.error(e)
      setError('বাতিল করতে সমস্যা হয়েছে')
    }
    setProcessingId(null)
  }

  const filtered = requests.filter(r => statusFilter === 'all' || r.status === statusFilter)

  const statusBadge = (status) => {
    const map = {
      pending: { bg: '#fff3e0', color: '#f4a300', label: 'অপেক্ষমাণ' },
      approved: { bg: '#e8f5e9', color: '#2d6a4f', label: 'অনুমোদিত' },
      rejected: { bg: '#ffebee', color: '#c62828', label: 'বাতিল' },
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
        প্যাকেজ পেমেন্ট রিকোয়েস্ট
      </h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '18px' }}>
        সেলারদের bKash Transaction ID যাচাই করে প্যাকেজ অনুমোদন করুন।
      </p>

      {error && (
        <div style={{
          marginBottom: '16px', padding: '10px 12px',
          background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
        }}>{error}</div>
      )}

      <select style={{ ...inputStyle, marginBottom: '16px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
        <option value="pending">অপেক্ষমাণ</option>
        <option value="approved">অনুমোদিত</option>
        <option value="rejected">বাতিল</option>
        <option value="all">সব</option>
      </select>

      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>লোড হচ্ছে...</div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '50px 20px', color: '#999',
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>💳</div>
          <p>কোনো রিকোয়েস্ট নেই</p>
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
                  {req.shops?.name || 'অজানা দোকান'}
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                  {req.seller_packages?.name_bn} · ৳{req.amount}
                </div>
              </div>
              <div style={{ flex: '1 1 200px', fontSize: '13px', color: '#444' }}>
                <div>পেয়ার নাম্বার: <b>{req.payer_number}</b></div>
                <div>Trx ID: <b style={{ fontFamily: 'monospace' }}>{req.trx_id}</b></div>
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                {new Date(req.created_at).toLocaleString('bn-BD')}
              </div>
              {statusBadge(req.status)}
              {req.status === 'pending' && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleApprove(req)} disabled={processingId === req.id} style={{
                    background: '#e8f5e9', color: '#2d6a4f', border: 'none',
                    borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '600'
                  }}>অনুমোদন</button>
                  <button onClick={() => handleReject(req)} disabled={processingId === req.id} style={{
                    background: '#ffebee', color: '#c62828', border: 'none',
                    borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '600'
                  }}>বাতিল</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
