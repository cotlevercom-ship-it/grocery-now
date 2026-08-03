export default function TrustBadges() {
  const items = [
    { icon: '✓', title: 'Verified Merchants', desc: 'Reviewed sellers only' },
    { icon: '🌍', title: 'Cross-Border Shipping', desc: 'DHL, EMS & more' },
    { icon: '📦', title: 'Bulk & MOQ Pricing', desc: 'Tiered wholesale rates' },
    { icon: '🔒', title: 'Secure Payments', desc: 'Protected checkout' },
  ]

  return (
    <div style={{ background: 'white', borderBottom: '1px solid #eee' }}>
      <div style={{
        maxWidth: '1100px', margin: '0 auto', padding: '14px 16px',
        display: 'flex', gap: '10px', overflowX: 'auto', scrollbarWidth: 'none'
      }}>
        {items.map(item => (
          <div key={item.title} style={{
            flex: '1 1 0', minWidth: '150px', display: 'flex', alignItems: 'center',
            gap: '10px', padding: '8px 10px'
          }}>
            <span style={{
              width: '30px', height: '30px', borderRadius: '50%', background: '#f5f5f5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', flexShrink: 0, color: '#2d6a4f'
            }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#1a1a1a', whiteSpace: 'nowrap' }}>
                {item.title}
              </div>
              <div style={{ fontSize: '10.5px', color: '#999', whiteSpace: 'nowrap' }}>
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
