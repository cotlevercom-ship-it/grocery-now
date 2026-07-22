import Link from 'next/link'

export const metadata = {
  title: 'বিক্রেতা হন — GroceryNow',
  description: 'আপনার দোকান অনলাইনে নিয়ে আসুন GroceryNow এর সাথে',
}

const features = [
  { icon: '🚀', title: 'সহজ সেটআপ', desc: 'মাত্র কয়েক মিনিটে আপনার দোকান অনলাইনে চালু করুন' },
  { icon: '📦', title: 'সহজ প্রোডাক্ট ম্যানেজমেন্ট', desc: 'নিজের ড্যাশবোর্ড থেকে প্রোডাক্ট যোগ, বাদ ও আপডেট করুন' },
  { icon: '🧾', title: 'রিয়েল-টাইম অর্ডার', desc: 'নতুন অর্ডার সাথে সাথে দেখুন ও ট্র্যাক করুন' },
  { icon: '📈', title: 'বিক্রয় বাড়ান', desc: 'আপনার এলাকার হাজারো ক্রেতার কাছে পৌঁছান' },
]

const packages = [
  {
    name: 'ফ্রি',
    price: '৳০',
    period: '/মাস',
    features: ['২০টি পর্যন্ত প্রোডাক্ট', 'বেসিক ড্যাশবোর্ড', 'ইমেইল সাপোর্ট'],
    highlight: false,
  },
  {
    name: 'বেসিক',
    price: '৳৪৯৯',
    period: '/মাস',
    features: ['১০০টি পর্যন্ত প্রোডাক্ট', 'অর্ডার অ্যানালিটিক্স', 'অগ্রাধিকার সাপোর্ট', 'প্রোমো ব্যানার'],
    highlight: true,
  },
  {
    name: 'প্রিমিয়াম',
    price: '৳৯৯৯',
    period: '/মাস',
    features: ['আনলিমিটেড প্রোডাক্ট', 'অ্যাডভান্সড অ্যানালিটিক্স', '২৪/৭ সাপোর্ট', 'হোমপেজে ফিচার্ড'],
    highlight: false,
  },
]

export default function SellerLandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #163a2c 0%, #2e7d32 100%)',
        color: 'white', padding: '60px 20px', textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 12px' }}>
          আপনার দোকান নিয়ে আসুন অনলাইনে
        </h1>
        <p style={{ fontSize: '16px', color: '#d7e8dc', maxWidth: '520px', margin: '0 auto 28px' }}>
          GroceryNow এর সাথে যুক্ত হয়ে হাজারো ক্রেতার কাছে আপনার প্রোডাক্ট পৌঁছে দিন
        </p>
        <Link href="/seller/create" style={{
          display: 'inline-block', background: '#ffca28', color: '#163a2c',
          padding: '14px 32px', borderRadius: '8px', fontWeight: '700',
          fontSize: '15px', textDecoration: 'none',
        }}>
          বিক্রেতা হিসেবে শুরু করুন
        </Link>
        <div style={{ marginTop: '16px' }}>
          <Link href="/seller/login" style={{ color: '#d7e8dc', fontSize: '14px', textDecoration: 'underline' }}>
            আগে থেকে অ্যাকাউন্ট আছে? লগইন করুন
          </Link>
        </div>
      </section>

      {/* Feature Section */}
      <section style={{ padding: '48px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', textAlign: 'center', color: '#163a2c', marginBottom: '32px' }}>
          কেন GroceryNow বেছে নেবেন
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
          {features.map(f => (
            <div key={f.title} style={{
              background: 'white', border: '1px solid #e0e0e0', borderRadius: '12px',
              padding: '24px', flex: '1 1 220px', maxWidth: '240px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{f.icon}</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#163a2c', marginBottom: '6px' }}>{f.title}</div>
              <div style={{ fontSize: '13px', color: '#777' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Package Section */}
      <section style={{ padding: '48px 20px', background: '#f5f7f5' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', textAlign: 'center', color: '#163a2c', marginBottom: '32px' }}>
          প্যাকেজ বেছে নিন
        </h2>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', maxWidth: '900px', margin: '0 auto',
        }}>
          {packages.map(p => (
            <div key={p.name} style={{
              background: 'white', borderRadius: '12px', padding: '28px 24px',
              flex: '1 1 240px', maxWidth: '260px',
              border: p.highlight ? '2px solid #2e7d32' : '1px solid #e0e0e0',
              boxShadow: p.highlight ? '0 8px 24px rgba(46,125,50,0.15)' : 'none',
            }}>
              {p.highlight && (
                <div style={{
                  display: 'inline-block', background: '#2e7d32', color: 'white',
                  fontSize: '11px', fontWeight: '700', padding: '3px 10px',
                  borderRadius: '10px', marginBottom: '10px',
                }}>
                  জনপ্রিয়
                </div>
              )}
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#163a2c' }}>{p.name}</div>
              <div style={{ margin: '10px 0 18px' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: '#163a2c' }}>{p.price}</span>
                <span style={{ fontSize: '13px', color: '#888' }}>{p.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
                {p.features.map(feat => (
                  <li key={feat} style={{ fontSize: '13px', color: '#555', marginBottom: '8px' }}>
                    ✓ {feat}
                  </li>
                ))}
              </ul>
              <Link href="/seller/create" style={{
                display: 'block', textAlign: 'center', padding: '10px',
                borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px',
                background: p.highlight ? '#2e7d32' : '#f0f0f0',
                color: p.highlight ? 'white' : '#163a2c',
              }}>
                শুরু করুন
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Section */}
      <footer style={{
        background: '#163a2c', color: '#d7e8dc', padding: '32px 20px', textAlign: 'center', fontSize: '13px',
      }}>
        <div style={{ fontWeight: '700', fontSize: '16px', color: 'white', marginBottom: '8px' }}>GroceryNow</div>
        <div>আপনার এলাকার সেরা গ্রোসারি প্ল্যাটফর্ম</div>
        <div style={{ marginTop: '16px', color: '#8fae95' }}>© 2026 GroceryNow. সর্বস্বত্ব সংরক্ষিত।</div>
      </footer>
    </div>
  )
}
