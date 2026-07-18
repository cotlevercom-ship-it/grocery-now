import Link from 'next/link'

export default function AreaSection({ areas }) {
  return (
    <div style={{ padding: '24px 16px 4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ fontSize: '18px' }}>📍</span>
        <p style={{ fontSize: '15px', color: '#163a2c', fontWeight: '700', margin: 0 }}>
          জনপ্রিয় এলাকা
        </p>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '12px'
      }}>
        {areas.map((area) => (
          <Link key={area.id} href={`/shops?area=${area.id}&name=${encodeURIComponent(area.name)}`} className="area-card">
            <div style={{
              padding: '18px 14px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                background: 'linear-gradient(90deg, #163a2c, #f4a300)'
              }} />
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #163a2c 0%, #2d6a4f 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px', fontSize: '20px'
              }}>📍</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                {area.name}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
