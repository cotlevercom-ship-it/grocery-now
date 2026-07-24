'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch } from '@/lib/supabase'

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState([])
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [processingId, setProcessingId] = useState(null)
  const [bonusAmount, setBonusAmount] = useState('')
  const [savingBonus, setSavingBonus] = useState(false)

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [affRows, refRows, settingRows] = await Promise.all([
        supabaseFetch(`affiliates?select=*&order=created_at.desc`),
        supabaseFetch(`referrals?select=*,affiliates(name,phone,referral_code),shops(name)&order=created_at.desc`),
        supabaseFetch(`app_settings?select=value&key=eq.affiliate_bonus_amount`),
      ])
      setAffiliates(affRows || [])
      setReferrals(refRows || [])
      setBonusAmount(settingRows?.[0]?.value || '0')
    } catch (e) {
      console.error(e)
      setError('তথ্য লোড করতে সমস্যা হয়েছে')
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleMarkPaid = async (ref) => {
    if (!confirm(`"${ref.affiliates?.name}"-কে ৳${ref.bonus_amount} পেইড মার্ক করবেন?`)) return
    setProcessingId(ref.id)
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

  const handleSaveBonus = async () => {
    setSavingBonus(true)
    try {
      await supabaseFetch(`app_settings?key=eq.affiliate_bonus_amount`, {
        method: 'PATCH',
        body: JSON.stringify({ value: String(Number(bonusAmount) || 0) }),
      })
    } catch (e) {
      console.error(e)
      setError('বোনাস পরিমাণ সেভ করতে সমস্যা হয়েছে')
    }
    setSavingBonus(false)
  }

  const filtered = referrals.filter(r => statusFilter === 'all' || r.status === statusFilter)
  const totalPending = referrals.filter(r => r.status === 'pending').reduce((s, r) => s + Number(r.bonus_amount || 0), 0)
  const totalPaid = referrals.filter(r => r.status === 'paid').reduce((s, r) => s + Number(r.bonus_amount || 0), 0)

  const inputStyle = {
    padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box'
  }

  const statusBadge = (status) => {
    const map = {
      pending: { bg: '#fff3e0', color: '#f4a300', label: 'পেন্ডিং' },
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
        <div style={{ flex: '1 1 160px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ fontSize: '12px', color: '#888' }}>মোট অ্যাফিলিয়েট</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#163a2c' }}>{affiliates.length}</div>
        </div>
        <div style={{ flex: '1 1 160px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ fontSize: '12px', color: '#888' }}>পেন্ডিং বোনাস</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#f4a300' }}>৳{totalPending}</div>
        </div>
        <div style={{ flex: '1 1 160px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ fontSize: '12px', color: '#888' }}>পরিশোধিত বোনাস</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#2d6a4f' }}>৳{totalPaid}</div>
        </div>
      </div>

      <div style={{
        background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px',
        padding: '14px 16px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap',
        gap: '10px', alignItems: 'center'
      }}>
        <label style={{ fontSize: '13px', color: '#444', fontWeight: '600' }}>প্রতি রেফারেলে বোনাস (৳)</label>
        <input
          type="number"
          value={bonusAmount}
          onChange={e => setBonusAmount(e.target.value)}
          style={{ ...inputStyle, width: '120px' }}
        />
        <button onClick={handleSaveBonus} disabled={savingBonus} style={{
          background: '#163a2c', color: 'white', border: 'none', borderRadius: '8px',
          padding: '9px 16px', fontSize: '13px', fontWeight: '600'
        }}>{savingBonus ? 'সেভ হচ্ছে...' : 'সেভ করুন'}</button>
        <span style={{ fontSize: '12px', color: '#999' }}>নতুন রেফারেলের ক্ষেত্রে এই পরিমাণ প্রযোজ্য হবে</span>
      </div>

      <select style={{ ...inputStyle, marginBottom: '16px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
        <option value="pending">পেন্ডিং</option>
        <option value="paid">পেইড</option>
        <option value="all">সব</option>
      </select>

      {loading ? (
        <div style={{ color: '#888', fontSize: '14px' }}>লোড হচ্ছে...</div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '50px 20px', color: '#999',
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>🤝</div>
          <p>কোনো রেফারেল নেই</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          {filtered.map((ref, i) => (
            <div key={ref.id} style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', padding: '14px 16px',
              borderBottom: i < filtered.length - 1 ? '1px solid #eee' : 'none'
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
                <button onClick={() => handleMarkPaid(ref)} disabled={processingId === ref.id} style={{
                  background: '#e8f5e9', color: '#2d6a4f', border: 'none',
                  borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap'
                }}>{processingId === ref.id ? '...' : 'পেইড মার্ক করুন'}</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
