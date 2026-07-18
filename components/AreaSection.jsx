import Link from 'next/link'

export default function AreaSection({ areas }) {
  return (
    <div style={{ padding: '20px 16px 4px' }}>
      <p style={{ fontSize: '13px', color: '#666', marginBottom: '14px', fontWeight: '600' }}>
        📍 জনপ্রিয় এলাকা
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {areas.map((area) => (
          <Link key={area.id} href={`/shops?area=${area.id}&name=${encodeURIComponent(area.name)}`} className="area-card">
            <div style={{ padding: '16px 12px', textAlign: 'center' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: '#e8f5e9', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 8px', fontSize: '20px'
              }}>📍</div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a' }}>{area.name}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
