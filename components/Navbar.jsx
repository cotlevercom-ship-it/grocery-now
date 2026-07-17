'use client'

export default function Navbar() {
  return (
    <>
      <div className="navbar-bar" style={{
        background: 'linear-gradient(135deg, #163a2c 0%, #2d6a4f 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        padding: '12px 16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '9px',
            background: '#f4a300', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '17px', flexShrink: 0,
          }}>🧺</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
            <span className="navbar-logo-text" style={{
              color: '#faf7f0', fontWeight: '700',
              letterSpacing: '-0.02em', whiteSpace: 'nowrap',
            }}>GroceryNow</span>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#7ee787', flexShrink: 0,
              animation: 'dotPulse 2s ease-in-out infinite',
            }} />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes dotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </>
  )
}
