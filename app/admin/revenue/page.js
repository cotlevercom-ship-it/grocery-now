'use client'
import { useState, useEffect, useMemo } from 'react'
import { supabaseFetch } from '@/lib/supabase'

export default function AdminRevenuePage() {
  const [requests, setRequests] = useState([])
  const [packages, setPackages] = useState([])
  const [referralMap, setReferralMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [packageFilter, setPackageFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [reqData, pkgData, refData] = await Promise.all([
        supabaseFetch(
          `package_payment_requests?select=*,shops(name,phone),seller_packages(name,price)&order=created_at.desc`
        ),
        supabaseFetch(`seller_packages?select=id,name,price&order=sort_order`),
        supabaseFetch(`referrals?select=shop_id,affiliates(name,phone)`),
      ])
      setRequests(reqData || [])
      setPackages(pkgData || [])
      const map = {}
      ;(refData || []).forEach(r => {
        if (r.shop_id) map[r.shop_id] = r.affiliates?.name || 'Affiliate'
      })
      setReferralMap(map)
    } catch (e) {
      console.error(e)
      setError('Failed to load revenue data')
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const approved = useMemo(() => requests.filter(r => r.status === 'approved'), [requests])
  const pending = useMemo(() => requests.filter(r => r.status === 'pending'), [requests])

  const totalRevenue = useMemo(
    () => approved.reduce((sum, r) => sum + Number(r.amount || 0), 0),
    [approved]
  )

  const thisMonthRevenue = useMemo(() => {
    const now = new Date()
    return approved
      .filter(r => {
        const d = new Date(r.reviewed_at || r.created_at)
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      })
      .reduce((sum, r) => sum + Number(r.amount || 0), 0)
  }, [approved])

  const activePaidShopsCount = useMemo(() => {
    const shopIds = new Set(approved.map(r => r.shop_id))
    return shopIds.size
  }, [approved])

  const pendingAmount = useMemo(
    () => pending.reduce((sum, r) => sum + Number(r.amount || 0), 0),
    [pending]
  )

  const revenueByPackage = useMemo(() => {
    const map = {}
    approved.forEach(r => {
      const name = r.seller_packages?.name || 'Unknown'
      if (!map[name]) map[name] = { name, total: 0, count: 0 }
      map[name].total += Number(r.amount || 0)
      map[name].count += 1
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [approved])

  const revenueBySource = useMemo(() => {
    let affiliateTotal = 0, affiliateCount = 0, directTotal = 0, directCount = 0
    approved.forEach(r => {
      if (referralMap[r.shop_id]) {
        affiliateTotal += Number(r.amount || 0)
        affiliateCount += 1
      } else {
        directTotal += Number(r.amount || 0)
        directCount += 1
      }
    })
    return { affiliateTotal, affiliateCount, directTotal, directCount }
  }, [approved, referralMap])

  const last6Months = useMemo(() => {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleString('en-US', { month: 'short' }),
        total: 0,
      })
    }
    approved.forEach(r => {
      const d = new Date(r.reviewed_at || r.created_at)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      const m = months.find(m => m.key === key)
      if (m) m.total += Number(r.amount || 0)
    })
    return months
  }, [approved])

  const maxMonthTotal = Math.max(1, ...last6Months.map(m => m.total))

  const filteredApproved = useMemo(() => {
    return approved.filter(r => {
      if (packageFilter !== 'all' && String(r.package_id) !== packageFilter) return false
      if (sourceFilter === 'affiliate' && !referralMap[r.shop_id]) return false
      if (sourceFilter === 'direct' && referralMap[r.shop_id]) return false
      const d = new Date(r.reviewed_at || r.created_at)
      if (fromDate && d < new Date(fromDate)) return false
      if (toDate && d > new Date(toDate + 'T23:59:59')) return false
      return true
    })
  }, [approved, packageFilter, sourceFilter, referralMap, fromDate, toDate])

  const handleExportCsv = () => {
    const header = ['Shop', 'Phone', 'Package', 'Amount', 'Source', 'Payer Number', 'Trx ID', 'Date']
    const rows = filteredApproved.map(r => [
      r.shops?.name || '',
      r.shops?.phone || '',
      r.seller_packages?.name || '',
      r.amount || 0,
      referralMap[r.shop_id] ? `Affiliate: ${referralMap[r.shop_id]}` : 'Direct',
      r.payer_number || '',
      r.trx_id || '',
      new Date(r.reviewed_at || r.created_at).toLocaleString('en-US'),
    ])
    const csv = [header, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `revenue-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const cardStyle = {
    background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
    padding: '18px', flex: '1 1 200px', minWidth: 0,
  }
  const labelStyle = { fontSize: '12px', color: '#888', marginBottom: '6px' }
  const valueStyle = { fontSize: '22px', fontWeight: '700', color: '#163a2c' }
  const inputStyle = {
    padding: '9px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px',
  }

  if (loading) {
    return <div style={{ color: '#888', fontSize: '14px' }}>Loading...</div>
  }

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '4px' }}>
        Revenue
      </h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '18px' }}>
        Subscription revenue from approved seller package payments.
      </p>

      {error && (
        <div style={{
          marginBottom: '16px', padding: '10px 12px',
          background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px'
        }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div style={cardStyle}>
          <div style={labelStyle}>Total Revenue</div>
          <div style={valueStyle}>৳{totalRevenue.toLocaleString('en-US')}</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>This Month</div>
          <div style={valueStyle}>৳{thisMonthRevenue.toLocaleString('en-US')}</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Active Paid Shops</div>
          <div style={valueStyle}>{activePaidShopsCount}</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Pending Requests</div>
          <div style={valueStyle}>{pending.length} <span style={{ fontSize: '13px', color: '#f4a300', fontWeight: '600' }}>(৳{pendingAmount.toLocaleString('en-US')})</span></div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#163a2c', marginBottom: '10px' }}>
          Revenue by Package
        </h2>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          {revenueByPackage.length === 0 ? (
            <div style={{ color: '#999', fontSize: '13px' }}>No approved payments yet</div>
          ) : revenueByPackage.map(p => (
            <div key={p.name} style={cardStyle}>
              <div style={labelStyle}>{p.name}</div>
              <div style={valueStyle}>৳{p.total.toLocaleString('en-US')}</div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{p.count} payment{p.count !== 1 ? 's' : ''}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#163a2c', marginBottom: '10px' }}>
          Revenue by Source
        </h2>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <div style={cardStyle}>
            <div style={labelStyle}>Via Affiliate</div>
            <div style={valueStyle}>৳{revenueBySource.affiliateTotal.toLocaleString('en-US')}</div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              {revenueBySource.affiliateCount} payment{revenueBySource.affiliateCount !== 1 ? 's' : ''}
            </div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Direct (No Affiliate)</div>
            <div style={valueStyle}>৳{revenueBySource.directTotal.toLocaleString('en-US')}</div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              {revenueBySource.directCount} payment{revenueBySource.directCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0',
        padding: '20px', marginBottom: '20px'
      }}>
        <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#163a2c', marginBottom: '16px' }}>
          Last 6 Months
        </h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '160px' }}>
          {last6Months.map(m => (
            <div key={m.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                {m.total > 0 ? `৳${m.total.toLocaleString('en-US')}` : ''}
              </div>
              <div style={{
                width: '100%', maxWidth: '46px',
                height: `${Math.max(4, (m.total / maxMonthTotal) * 110)}px`,
                background: 'linear-gradient(180deg, #2d6a4f 0%, #163a2c 100%)',
                borderRadius: '6px 6px 0 0',
              }} />
              <div style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '14px' }}>
        <select style={inputStyle} value={packageFilter} onChange={e => setPackageFilter(e.target.value)}>
          <option value="all">All Packages</option>
          {packages.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select style={inputStyle} value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
          <option value="all">All Sources</option>
          <option value="affiliate">Via Affiliate</option>
          <option value="direct">Direct</option>
        </select>
        <input type="date" style={inputStyle} value={fromDate} onChange={e => setFromDate(e.target.value)} />
        <span style={{ color: '#999', fontSize: '13px' }}>to</span>
        <input type="date" style={inputStyle} value={toDate} onChange={e => setToDate(e.target.value)} />
        <button onClick={handleExportCsv} style={{
          marginLeft: 'auto', background: '#163a2c', color: 'white', border: 'none',
          borderRadius: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
        }}>Export CSV</button>
      </div>

      {filteredApproved.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '50px 20px', color: '#999',
          background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>💰</div>
          <p>No matching payments</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0', overflow: 'hidden', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '720px' }}>
            <thead>
              <tr style={{ background: '#f7f7f7', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px' }}>Shop</th>
                <th style={{ padding: '10px 14px' }}>Package</th>
                <th style={{ padding: '10px 14px' }}>Amount</th>
                <th style={{ padding: '10px 14px' }}>Source</th>
                <th style={{ padding: '10px 14px' }}>Trx ID</th>
                <th style={{ padding: '10px 14px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredApproved.map((r, i) => (
                <tr key={r.id} style={{ borderTop: i > 0 ? '1px solid #eee' : 'none' }}>
                  <td style={{ padding: '10px 14px', fontWeight: '600' }}>{r.shops?.name || 'Unknown'}</td>
                  <td style={{ padding: '10px 14px' }}>{r.seller_packages?.name || '-'}</td>
                  <td style={{ padding: '10px 14px' }}>৳{Number(r.amount || 0).toLocaleString('en-US')}</td>
                  <td style={{ padding: '10px 14px' }}>
                    {referralMap[r.shop_id] ? (
                      <span style={{
                        fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '10px',
                        background: '#e8f5e9', color: '#2d6a4f'
                      }}>{referralMap[r.shop_id]}</span>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#999' }}>Direct</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>{r.trx_id || '-'}</td>
                  <td style={{ padding: '10px 14px', color: '#888' }}>
                    {new Date(r.reviewed_at || r.created_at).toLocaleDateString('en-US')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
