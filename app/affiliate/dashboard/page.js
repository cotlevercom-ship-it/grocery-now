'use client'
import { useState, useEffect } from 'react'
import { supabaseFetch, hashPin } from '@/lib/supabase'

const SESSION_KEY = 'affiliate_session'

function getAffiliateSession() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

function saveAffiliateSession(affiliate) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(affiliate))
}

function clearAffiliateSession() {
  localStorage.removeItem(SESSION_KEY)
}

export default function AffiliateDashboardPage() {
  const [affiliate, setAffiliate] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)

  // login form state
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  // dashboard data
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(false)
  const [minWithdraw, setMinWithdraw] = useState(100)
  const [bkashNumber, setBkashNumber] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const session = getAffiliateSession()
    if (session) setAffiliate(session)
    setCheckingSession(false)
  }, [])

  useEffect(() => {
    if (affiliate) loadDashboard()
  }, [affiliate])

  async function loadDashboard() {
    setLoading(true)
    try {
      const [refRows, minRows] = await Promise.all([
        supabaseFetch(`referrals?select=*,shops(name)&affiliate_id=eq.${affiliate.id}&order=created_at.desc`),
        supabaseFetch(`app_settings?select=value&key=eq.affiliate_min_withdraw`),
      ])
      setReferrals(refRows || [])
      setMinWithdraw(Number(minRows?.[0]?.value) || 100)
    } catch (e) {
      console.error(e)
      setMessage('তথ্য লোড করতে সমস্যা হয়েছে')
    }
    setLoading(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    setLoggingIn(true)
    try {
      const pinHash = await hashPin(pin)
      const rows = await supabaseFetch(`affiliates?select=*&phone=eq.${phone}&pin_hash=eq.${pinHash}`)
      const found = rows?.[0]
      if (!found) {
        setLoginError('ফোন নম্বর অথবা পিন ভুল')
        setLoggingIn(false)
        return
      }
      saveAffiliateSession(found)
      setAffiliate(found)
    } catch (e) {
      console.error(e)
      setLoginError('লগইন করতে সমস্যা হয়েছে')
    }
    setLoggingIn(false)
  }

  const handleLogout = () => {
    clearAffiliateSession()
    setAffiliate(null)
    setReferrals([])
  }

  const handleRequestWithdraw = async (e) => {
    e.preventDefault()
    setMessage('')
    if (!bkashNumber || bkashNumber.length < 11) {
      setMessage('সঠিক বিকাশ নম্বর দিন')
      return
    }
    const pendingRefs = referrals.filter(r => r.status === 'pending')
    const total = pendingRefs.reduce((s, r) => s + Number(r.bonus_amount || 0), 0)
    if (total < minWithdraw) {
      setMessage(`উইথড্র করতে কমপক্ষে ৳${minWithdraw} পেন্ডিং থাকতে হবে`)
      return
    }
    setRequesting(true)
    try {
      const wd = await supabaseFetch('withdrawal_requests', {
        method: 'POST',
        body: JSON.stringify({
          affiliate_id: affiliate.id,
          bkash_number: bkashNumber,
          total_amount: total,
          status: 'requested',
        }),
      })
      const wdId = wd?.[0]?.id
      await Promise.all(pendingRefs.map(r =>
        supabaseFetch(`referrals?id=eq.${r.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'requested', withdrawal_request_id: wdId }),
        })
      ))
      setMessage('উইথড্র রিকোয়েস্ট পাঠানো হয়েছে')
      await loadDashboard()
    } catch (e) {
      console.error(e)
      setMessage('উইথড্র রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে')
    }
    setRequesting(false)
  }

  const inputStyle = {
    padding: '12px 14px', borderRadius: '8px', border: '1px solid #ddd',
    fontSize: '15px', boxSizing: 'border-box', width: '100%'
  }

  const btnStyle = {
    background: '#163a2c', color: 'white', border: 'none', borderRadius: '8px',
    padding: '12px 16px', fontSize: '15px', fontWeight: '600', width: '100%'
  }

  if (checkingSession) {
    return <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888' }}>লোড হচ্ছে...</div>
  }

  if (!affiliate) {
    return (
      <div style={{ maxWidth: '380px', margin: '40px auto', padding: '0 20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#163a2c', marginBottom: '20px', textAlign: 'center' }}>
          অ্যাফিলিয়েট ড্যাশবোর্ড
        </h1>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="tel"
            placeholder="ফোন নম্বর"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="password"
            inputMode="numeric"
            placeholder="৪ সংখ্যার পিন"
            value={pin}
            onChange={e => setPin(e.target.value)}
            maxLength={4}
            style={inputStyle}
            required
          />
          {loginError && (
            <div style={{ color: '#c62828', fontSize: '13px' }}>{loginError}</div>
          )}
          <button type="submit" disabled={loggingIn} style={btnStyle}>
            {loggingIn ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
          </button>
        </form>
      </div>
    )
  }

  const pending = referrals.filter(r => r.status === 'pending')
  const requested = referrals.filter(r => r.status === 'requested')
  const paid = referrals.filter(r => r.status === 'paid')
  const totalPending = pending.reduce((s, r) => s + Number(r.bonus_amount || 0), 0)
  const totalRequested = requested.reduce((s, r) => s + Number(r.bonus_amount || 0), 0)
  const totalPaid = paid.reduce((s, r) => s + Number(r.bonus_amount || 0), 0)
  const canWithdraw = totalPending >= minWithdraw

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#163a2c' }}>{affiliate.name}</h1>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#c62828', fontSize: '13px' }}>
          লগআউট
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <div style={{ flex: 1, background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: '#888' }}>পেন্ডিং</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#f4a300' }}>৳{totalPending}</div>
        </div>
        <div style={{ flex: 1, background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: '#888' }}>চাওয়া হয়েছে</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#1565c0' }}>৳{totalRequested}</div>
        </div>
        <div style={{ flex: 1, background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: '#888' }}>পেইড</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#2d6a4f' }}>৳{totalPaid}</div>
        </div>
      </div>

      <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', color: '#163a2c' }}>উইথড্র করুন</h2>
        {canWithdraw ? (
          <form onSubmit={handleRequestWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="tel"
              placeholder="বিকাশ নম্বর"
              value={bkashNumber}
              onChange={e => setBkashNumber(e.target.value)}
              style={inputStyle}
              required
            />
            <button type="submit" disabled={requesting} style={btnStyle}>
              {requesting ? 'পাঠানো হচ্ছে...' : `৳${totalPending} উইথড্র রিকোয়েস্ট পাঠান`}
            </button>
          </form>
        ) : (
          <p style={{ fontSize: '13px', color: '#888' }}>
            উইথড্র করতে কমপক্ষে ৳{minWithdraw} পেন্ডিং থাকতে হবে (এখন ৳{totalPending})
          </p>
        )}
        {message && <p style={{ fontSize: '13px', color: '#163a2c', marginTop: '8px' }}>{message}</p>}
      </div>

      <h2 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', color: '#163a2c' }}>রেফারেল হিস্টোরি</h2>
      {loading ? (
        <p style={{ color: '#888', fontSize: '13px' }}>লোড হচ্ছে...</p>
      ) : referrals.length === 0 ? (
        <p style={{ color: '#888', fontSize: '13px' }}>এখনো কোনো রেফারেল নেই</p>
      ) : (
        <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
          {referrals.map((r, i) => (
            <div key={r.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 14px', borderBottom: i < referrals.length - 1 ? '1px solid #eee' : 'none'
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>{r.shops?.name || 'অজানা দোকান'}</div>
                <div style={{ fontSize: '11px', color: '#999' }}>{new Date(r.created_at).toLocaleDateString('bn-BD')}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: '700' }}>৳{r.bonus_amount}</div>
                <div style={{ fontSize: '11px', color: r.status === 'paid' ? '#2d6a4f' : r.status === 'requested' ? '#1565c0' : '#f4a300' }}>
                  {r.status === 'paid' ? 'পেইড' : r.status === 'requested' ? 'চাওয়া হয়েছে' : 'পেন্ডিং'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
