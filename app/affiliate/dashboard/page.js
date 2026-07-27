'use client'
import { useState, useEffect } from 'react'
import { hashPin } from '@/lib/supabase'

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
      const params = new URLSearchParams({ affiliate_id: affiliate.id, session_token: affiliate.session_token })
      const res = await fetch(`/api/affiliate/dashboard?${params}`)
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          clearAffiliateSession()
          setAffiliate(null)
          setLoading(false)
          return
        }
        throw new Error(data.error || 'Failed to load data')
      }
      setReferrals(data.referrals || [])
      setMinWithdraw(data.min_withdraw || 100)
    } catch (e) {
      console.error(e)
      setMessage('Failed to load data')
    }
    setLoading(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    setLoggingIn(true)
    try {
      const pinHash = await hashPin(pin)
      const res = await fetch('/api/affiliate/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pinHash }),
      })
      const data = await res.json()
      if (!res.ok) {
        setLoginError(data.error || 'Login failed')
        setLoggingIn(false)
        return
      }
      saveAffiliateSession(data)
      setAffiliate(data)
    } catch (e) {
      console.error(e)
      setLoginError('Login failed')
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
      setMessage('Enter a valid bKash number')
      return
    }
    setRequesting(true)
    try {
      const res = await fetch('/api/affiliate/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affiliate_id: affiliate.id,
          session_token: affiliate.session_token,
          bkash_number: bkashNumber,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error || 'Failed to send withdrawal request')
        setRequesting(false)
        return
      }
      setMessage('Withdrawal request sent')
      await loadDashboard()
    } catch (e) {
      console.error(e)
      setMessage('Failed to send withdrawal request')
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
    return <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888' }}>Loading...</div>
  }

  if (!affiliate) {
    return (
      <div style={{ maxWidth: '380px', margin: '40px auto', padding: '0 20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#163a2c', marginBottom: '20px', textAlign: 'center' }}>
          Affiliate Dashboard
        </h1>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="password"
            inputMode="numeric"
            placeholder="4-digit PIN"
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
            {loggingIn ? 'Logging in...' : 'Login'}
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
          Logout
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <div style={{ flex: 1, background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: '#888' }}>Pending</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#f4a300' }}>৳{totalPending}</div>
        </div>
        <div style={{ flex: 1, background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: '#888' }}>Requested</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#1565c0' }}>৳{totalRequested}</div>
        </div>
        <div style={{ flex: 1, background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: '#888' }}>Paid</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#2d6a4f' }}>৳{totalPaid}</div>
        </div>
      </div>

      <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', color: '#163a2c' }}>Withdraw</h2>
        {canWithdraw ? (
          <form onSubmit={handleRequestWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="tel"
              placeholder="bKash number"
              value={bkashNumber}
              onChange={e => setBkashNumber(e.target.value)}
              style={inputStyle}
              required
            />
            <button type="submit" disabled={requesting} style={btnStyle}>
              {requesting ? 'Sending...' : `Request Withdrawal of ৳${totalPending}`}
            </button>
          </form>
        ) : (
          <p style={{ fontSize: '13px', color: '#888' }}>
            You need at least ৳{minWithdraw} pending to withdraw (currently ৳{totalPending})
          </p>
        )}
        {message && <p style={{ fontSize: '13px', color: '#163a2c', marginTop: '8px' }}>{message}</p>}
      </div>

      <h2 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', color: '#163a2c' }}>Referral History</h2>
      {loading ? (
        <p style={{ color: '#888', fontSize: '13px' }}>Loading...</p>
      ) : referrals.length === 0 ? (
        <p style={{ color: '#888', fontSize: '13px' }}>No referrals yet</p>
      ) : (
        <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
          {referrals.map((r, i) => (
            <div key={r.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 14px', borderBottom: i < referrals.length - 1 ? '1px solid #eee' : 'none'
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>{r.shops?.name || 'Unknown store'}</div>
                <div style={{ fontSize: '11px', color: '#999' }}>{new Date(r.created_at).toLocaleDateString('en-GB')}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: '700' }}>৳{r.bonus_amount}</div>
                <div style={{ fontSize: '11px', color: r.status === 'paid' ? '#2d6a4f' : r.status === 'requested' ? '#1565c0' : '#f4a300' }}>
                  {r.status === 'paid' ? 'Paid' : r.status === 'requested' ? 'Requested' : 'Pending'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
