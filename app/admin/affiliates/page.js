'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState([])
  const [referrals, setReferrals] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [processingId, setProcessingId] = useState(null)
  const [bonusAmount, setBonusAmount] = useState('')
  const [minWithdraw, setMinWithdraw] = useState('')
  const [savingSettings, setSavingSettings] = useState(false)

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [affRows, refRows, wdRows, bonusRows, minRows] = await Promise.all([
        supabaseFetch(`affiliates?select=*&order=created_at.desc`),
        supabaseFetch(`referrals?select=*,affiliates(name,phone,referral_code),shops(name)&order=created_at.desc`),
        supabaseFetch(`withdrawal_requests?select=*,affiliates(name,phone,referral_code)&order=created_at.desc`),
        supabaseFetch(`app_settings?select=value&key=eq.affiliate_bonus_amount`),
        supabaseFetch(`app_settings?select=value&key=eq.affiliate_min_withdraw`),
      ])
      setAffiliates(affRows || [])
      setReferrals(refRows || [])
      setWithdrawals(wdRows || [])
      setBonusAmount(bonusRows?.[0]?.value || '0')
      setMinWithdraw(minRows?.[0]?.value || '100')
    } catch (e) {
      console.error(e)
      setError('তথ্য লোড করতে সমস্যা হয়েছে')
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  // Approve a withdrawal request: mark it paid, then flip every referral
  // bundled into it to paid as well.
  const handleApproveWithdrawal = async (wd) => {
    if (!confirm(`"${wd.affiliates?.name}"-কে ৳${wd.total_amount} পেইড মার্ক করবেন? (বিকাশ: ${wd.bkash_number})`)) return
    setProcessingId(`wd-${wd.id}`)
    try {
      await supabaseFetch(`withdrawal_requests?id=eq.${wd.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'paid', paid_at: new Date().toISOString() }),
      })
      await supabaseFetch(`referrals?withdrawal_request_id=eq.${wd.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'paid', paid_at: new Date().toISOString() }),
      })
      await loadData()
    } catch (e) {
      console.error(e)
      setError('উইথড্র অ্যাপ্রুভ করতে সমস্যা হয়েছে')
    }
    setProcessingId(null)
  }

  // Fallback for referrals that never went through the withdraw flow —
  // mark a single pending referral paid directly.
  const handleDirectMarkPaid = async (ref) => {
    if (!confirm(`"${ref.affiliates?.name}"-এর ৳${ref.bonus_amount} সরাসরি পেইড মার্ক করবেন?`)) return
    setProcessingId(`ref-${ref.id}`)
    try {
      await supabaseFetch(`referrals?id=eq.${ref.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'paid', paid_at: new Date().toISOString() }),
      })
      await loadData()
    } catch (e) {
      console.error(e)
      setError('আপডেট করতে সমস্যা হয়েছে')
    }
    setProcessingId(null)
  }

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      await Promise.all([
        supabaseFetch(`app_settings?key=eq.affiliate_bonus_amount`, {
          method: 'PATCH',
          body: JSON.stringify({ value: String(Number(bonusAmount) || 0) }),
        }),
        supabaseFetch(`app_settings?key=eq.affiliate_min_withdraw`, {
          method: 'PATCH',
          body: JSON.stringify({ value: String(Number(minWithdraw) || 0) }),
        }),
      ])
    } catch (e) {
      console.error(e)
      setError('সেটিংস সেভ করতে সমস্যা হয়েছে')
    }
    setSavingSettings(false)
  }

  const filteredReferrals = referrals.filter(r => statusFilter === 'all' || r.status === statusFilter)
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'requested')
  const totalPending = referrals.filter(r => r.status === 'pending').reduce((s, r) => s + Number(r.bonus_amount || 0), 0)
  const totalRequested = referrals.filter(r => r.status === 'requested').reduce((s, r) => s + Number(r.bonus_amount || 0), 0)
  const totalPaid = referrals.filter(r => r.status === 'paid').reduce((s, r) => s + Number(r.bonus_amount || 0), 0)

  const inputStyle = {
    padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
  }

  const statusBadge = (status) => {
    const map = {
      pending: { bg: '#fff3e0', color: '#f4a300', label: 'পেন্ডিং' },
      requested: { bg: '#e3f2fd', color: '#1565c0', label: 'উইথড্র চাওয়া হয়েছে' },
      paid: { bg: '#e8f5e9', color: '#2d6a4f', label: 'পেইড' },
    }
    const s = map[status] || map.pending
    return (
      <span style={{
        fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '10px',
        background: s.bg, color: s.color, whiteSpace: 'nowrap'
      }}>{s.label}</span>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '4px' }}>
        অ্যাফিলিয়েট
      </h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '18px' }}>
        রেফারেল দিয়ে নতুন সেলার আসলে কে কত বোনাস পাবে তা এখান থেকে দেখুন ও পরিশোধ করুন।
      </p>

      {error && (
        <div style={{
          marginBottom: '16px', padding: '10px 12px',
          background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
        }}>{error}</div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div style={{ flex: '1 1 150px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ fontSize: '12px', color: '#888' }}>মোট অ্যাফিলিয়েট</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#163a2c' }}>{affiliates.length}</div>
        </div>
        <div style={{ flex: '1 1 150px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ fontSize: '12px', color: '#888' }}>পেন্ডিং বোনাস</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#f4a300' }}>৳{totalPending}</div>
        </div>
        <div style={{ flex: '1 1 150px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ fontSize: '12px', color: '#888' }}>উইথড্র চাওয়া হয়েছে</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#1565c0' }}>৳{totalRequested}</div>
        </div>
        <div style={{ flex: '1 1 150px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ fontSize: '12px', color: '#888' }}>পরিশোধিত বোনাস</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#2d6a4f' }}>৳{totalPaid}</div>
        </div>
      </div>

      <div style={{
        background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px',
        padding: '14px 16px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap',
        gap: '10px', alignItems: 'center'
      }}>
        <label style={{ fontSize: '13px', color: '#444', fontWeight: '600' }}>প্রতি রেফারেলে বোনাস (৳)</label>
        <input
          type="number"
          value={bonusAmount}
          onChange={e => setBonusAmount(e.target.value)}
          style={{ ...inputStyle, width: '110px' }}
        />
        <label style={{ fontSize: '13px', color: '#444', fontWeight: '600' }}>মিনিমাম উইথড্র (৳)</label>
        <input
          type="number"
          value={minWithdraw}
          onChange={e => setMinWithdraw(e.target.value)}
          style={{ ...inputStyle, width: '110px' }}
        />
        <button onClick={handleSaveSettings} disabled={savingSettings} style={{
          background: '#163a2c', color: 'white', border: 'none', borderRadius: '8px',
          padding: '9px 16px', fontSize: '13px', fontWeight: '600'
        }}>{savingSettings ? 'সেভ হচ্ছে...' : 'সেভ করুন'}</button>
      </div>

      {/* ---------- Withdraw Requests ---------- */}
      <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#163a2c', marginBottom: '10px' }}>
        উইথড্র রিকোয়েস্ট {pendingWithdrawals.length > 0 && `(${pendingWithdrawals.length})`}
      </h2>

      {loading ? (
        <div style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>লোড হচ্ছে...</div>
      ) : pendingWithdrawals.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '30px 20px', color: '#999',
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0', marginBottom: '24px'
        }}>
          <p style={{ fontSize: '13px' }}>কোনো উইথড্র রিকোয়েস্ট নেই</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0', overflow: 'hidden', marginBottom: '24px' }}>
          {pendingWithdrawals.map((wd, i) => (
            <div key={wd.id} style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', padding: '14px 16px',
              borderBottom: i < pendingWithdrawals.length - 1 ? '1px solid #eee' : 'none'
            }}>
              <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                  {wd.affiliates?.name || 'অজানা'}
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                  {wd.affiliates?.phone} · কোড: {wd.affiliates?.referral_code}
                </div>
              </div>
              <div style={{ fontSize: '13px', color: '#444' }}>
                বিকাশ: <b>{wd.bkash_number}</b>
              </div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#163a2c', minWidth: '70px' }}>
                ৳{wd.total_amount}
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                {new Date(wd.created_at).toLocaleDateString('bn-BD')}
              </div>
              <button onClick={() => handleApproveWithdrawal(wd)} disabled={processingId === `wd-${wd.id}`} style={{
                background: '#e8f5e9', color: '#2d6a4f', border: 'none',
                borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap'
              }}>{processingId === `wd-${wd.id}` ? '...' : 'পেইড মার্ক করুন'}</button>
            </div>
          ))}
        </div>
      )}

      {/* ---------- All Referrals ---------- */}
      <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#163a2c', marginBottom: '10px' }}>
        রেফারেলসমূহ
      </h2>

      <select style={{ ...inputStyle, marginBottom: '16px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
        <option value="pending">পেন্ডিং</option>
        <option value="requested">উইথড্র চাওয়া হয়েছে</option>
        <option value="paid">পেইড</option>
        <option value="all">সব</option>
      </select>

      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>লোড হচ্ছে...</div>
      ) : filteredReferrals.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '50px 20px', color: '#999',
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>🤝</div>
          <p>কোনো রেফারেল নেই</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          {filteredReferrals.map((ref, i) => (
            <div key={ref.id} style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', padding: '14px 16px',
              borderBottom: i < filteredReferrals.length - 1 ? '1px solid #eee' : 'none'
            }}>
              <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                  {ref.affiliates?.name || 'অজানা'}
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                  {ref.affiliates?.phone} · কোড: {ref.affiliates?.referral_code}
                </div>
              </div>
              <div style={{ flex: '1 1 160px', fontSize: '13px', color: '#444' }}>
                দোকান: <b>{ref.shops?.name || 'অজানা'}</b>
              </div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#163a2c', minWidth: '70px' }}>
                ৳{ref.bonus_amount}
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                {new Date(ref.created_at).toLocaleDateString('bn-BD')}
              </div>
              {statusBadge(ref.status)}
              {ref.status === 'pending' && (
                <button onClick={() => handleDirectMarkPaid(ref)} disabled={processingId === `ref-${ref.id}`} style={{
                  background: '#f5f5f5', color: '#555', border: '1px solid #ddd',
                  borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap'
                }}>{processingId === `ref-${ref.id}` ? '...' : 'সরাসরি পেইড মার্ক করুন'}</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
