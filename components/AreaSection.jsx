import Link from 'next/link'

export default function AreaSection({ areas }) {
  return (
    <div style={{ padding: '28px 16px 8px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '18px' }}>
        <p style={{
          fontSize: '16px',
          color: '#163a2c',
          fontWeight: '800',
          margin: 0,
          letterSpacing: '0.2px'
        }}>
          জনপ্রিয় এলাকা
        </p>
        <span style={{ fontSize: '12px', color: '#8a8a8a', fontWeight: '500' }}>
          আপনার এলাকা বেছে নিন
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))',
        gap: '10px'
      }}>
        {areas.map((area) => (
          <Link
            key={area.id}
            href={`/shops?area=${area.id}&name=${encodeURIComponent(area.name)}`}
            style={{ textDecoration: 'none' }}
          >
            <div
              className="area-tag"
              style={{
                position: 'relative',
                background: '#fbf8f2',
                border: '1px solid #e4dfd2',
                borderRadius: '10px',
                padding: '14px 12px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 14px 100%, 0 calc(100% - 14px))',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              {/* corner punch-hole, like a market token */}
              <span style={{
                position: 'absolute',
                bottom: '5px',
                left: '5px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#fff',
                border: '1px solid #e4dfd2'
              }} />

              <span style={{
                flexShrink: 0,
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: '#163a2c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 22s7-7.58 7-12.5A7 7 0 0 0 5 9.5C5 14.42 12 22 12 22Z"
                    fill="#f4a300"
                  />
                  <circle cx="12" cy="9.5" r="2.5" fill="#163a2c" />
                </svg>
              </span>

              <span style={{
                fontSize: '13px',
                fontWeight: '700',
                color: '#1a1a1a',
                lineHeight: '1.3'
              }}>
                {area.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}