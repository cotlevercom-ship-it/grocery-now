export default function TrustBadges() {
  const items = [
    { icon: '✓', title: 'Verified Merchants', desc: 'Reviewed sellers only' },
    { icon: '🌍', title: 'Cross-Border Shipping', desc: 'DHL, EMS & more' },
    { icon: '📦', title: 'Bulk & MOQ Pricing', desc: 'Tiered wholesale rates' },
    { icon: '🔒', title: 'Secure Payments', desc: 'Protected checkout' },
  ]

  return (
    <div style={{ background: 'white', borderBottom: '1px solid #eee' }}>
      <div className="trust-grid" style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px' }}>
        {items.map(item => (
          <div key={item.title} className="trust-item">
            <span style={{
              width: '32px', height: '32px', borderRadius: '50%', background: '#f5f5f5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', flexShrink: 0, color: '#2d6a4f'
            }}>{item.icon}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#1a1a1a' }}>
                {item.title}
              </div>
              <div style={{ fontSize: '10.5px', color: '#999' }}>
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .trust-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px 10px;
        }
        .trust-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        @media (min-width: 640px) {
          .trust-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>
    </div>
  )
}
