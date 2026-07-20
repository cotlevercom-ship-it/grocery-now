import Link from 'next/link'

export default function Footer() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #163a2c 0%, #2d6a4f 100%)',
      color: 'rgba(255,255,255,0.75)',
      padding: '28px 16px',
      marginTop: '24px',
      textAlign: 'center',
      fontSize: '13px'
    }}>
      <div style={{ color: '#faf7f0', fontWeight: '700', fontSize: '16px', marginBottom: '8px' }}>
        🧺 GroceryNow
      </div>
      <div>আপনার এলাকার সেরা গ্রোসারি, ঘরে বসেই</div>

      <Link href="/seller" style={{
        display: 'inline-block', marginTop: '16px', color: '#faf7f0',
        border: '1px solid rgba(255,255,255,0.35)', borderRadius: '20px',
        padding: '8px 18px', fontSize: '13px', fontWeight: '600',
        textDecoration: 'none'
      }}>
        🏪 Start Your Shop
      </Link>

      <div style={{ marginTop: '14px', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
        © ২০২৬ GroceryNow। সর্বস্বত্ব সংরক্ষিত।
      </div>
    </div>
  )
}
