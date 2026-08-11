export default function AdminDashboard() {
  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#163a2c', marginBottom: '4px' }}>Dashboard</h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>
        Cot Lever admin panel.
      </p>
      <div style={{
        background: 'white', borderRadius: '12px', border: '1px solid #e0e0e0',
        padding: '20px', color: '#888', fontSize: '13.5px'
      }}>
        Use the Banners, Pages, Agreements, Help, and Settings sections to manage site content.
      </div>
    </div>
  )
}
