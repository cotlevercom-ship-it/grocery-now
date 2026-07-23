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
      <style jsx>{`
        .hero {
          background: linear-gradient(135deg, #163a2c 0%, #2e7d32 100%);
          color: white;
          padding: 44px 20px;
          text-align: center;
        }
        .hero h1 {
          font-size: clamp(24px, 6vw, 32px);
          font-weight: 800;
          margin: 0 0 12px;
          line-height: 1.3;
        }
        .hero p {
          font-size: clamp(14px, 3.5vw, 16px);
          color: #d7e8dc;
          max-width: 480px;
          margin: 0 auto 24px;
        }
        .cta {
          display: inline-block;
          background: #ffca28;
          color: #163a2c;
          padding: 13px 28px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 15px;
          text-decoration: none;
          width: 100%;
          max-width: 320px;
        }
        .login-link {
          display: block;
          margin-top: 14px;
          color: #d7e8dc;
          font-size: 13px;
          text-decoration: underline;
        }

        .section { padding: 36px 16px; }
        .section-title {
          font-size: clamp(18px, 4.5vw, 22px);
          font-weight: 700;
          text-align: center;
          color: #163a2c;
          margin: 0 0 24px;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
          max-width: 1000px;
          margin: 0 auto;
        }
        .feature-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 18px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          text-align: left;
        }
        .feature-icon { font-size: 26px; flex-shrink: 0; }
        .feature-title { font-size: 15px; font-weight: 700; color: #163a2c; margin-bottom: 4px; }
        .feature-desc { font-size: 13px; color: #777; line-height: 1.5; }

        .package-section { background: #f5f7f5; }
        .package-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          max-width: 900px;
          margin: 0 auto;
        }
        .package-card {
          background: white;
          border-radius: 12px;
          padding: 22px 20px;
          border: 1px solid #e0e0e0;
        }
        .package-card.highlight {
          border: 2px solid #2e7d32;
          box-shadow: 0 8px 24px rgba(46,125,50,0.15);
        }
        .badge {
          display: inline-block;
          background: #2e7d32;
          color: white;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 10px;
          margin-bottom: 10px;
        }
        .package-name { font-size: 17px; font-weight: 700; color: #163a2c; }
        .package-price-row { margin: 8px 0 16px; }
        .package-price { font-size: 26px; font-weight: 800; color: #163a2c; }
        .package-period { font-size: 13px; color: #888; }
        .package-features { list-style: none; padding: 0; margin: 0 0 18px; }
        .package-features li { font-size: 13px; color: #555; margin-bottom: 7px; }
        .package-btn {
          display: block;
          text-align: center;
          padding: 11px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
        }
        .package-btn.highlight { background: #2e7d32; color: white; }
        .package-btn.plain { background: #f0f0f0; color: #163a2c; }

        footer {
          background: #163a2c;
          color: #d7e8dc;
          padding: 28px 20px;
          text-align: center;
          font-size: 13px;
        }
        .footer-title { font-weight: 700; font-size: 16px; color: white; margin-bottom: 8px; }
        .footer-copy { margin-top: 14px; color: #8fae95; }

        @media (min-width: 640px) {
          .hero { padding: 60px 20px; }
          .cta { width: auto; }
          .section { padding: 48px 20px; }
          .feature-grid { grid-template-columns: repeat(2, 1fr); }
          .package-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 900px) {
          .feature-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>

      <section className="hero">
        <h1>আপনার দোকান নিয়ে আসুন অনলাইনে</h1>
        <p>GroceryNow এর সাথে যুক্ত হয়ে হাজারো ক্রেতার কাছে আপনার প্রোডাক্ট পৌঁছে দিন</p>
        <Link href="/seller/create" className="cta">
          বিক্রেতা হিসেবে শুরু করুন
        </Link>
        <Link href="/seller/login" className="login-link">
          আগে থেকে অ্যাকাউন্ট আছে? লগইন করুন
        </Link>
      </section>

      <section className="section">
        <h2 className="section-title">কেন GroceryNow বেছে নেবেন</h2>
        <div className="feature-grid">
          {features.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section package-section">
        <h2 className="section-title">প্যাকেজ বেছে নিন</h2>
        <div className="package-grid">
          {packages.map(p => (
            <div key={p.name} className={`package-card ${p.highlight ? 'highlight' : ''}`}>
              {p.highlight && <div className="badge">জনপ্রিয়</div>}
              <div className="package-name">{p.name}</div>
              <div className="package-price-row">
                <span className="package-price">{p.price}</span>
                <span className="package-period">{p.period}</span>
              </div>
              <ul className="package-features">
                {p.features.map(feat => (
                  <li key={feat}>✓ {feat}</li>
                ))}
              </ul>
              <Link
                href="/seller/create"
                className={`package-btn ${p.highlight ? 'highlight' : 'plain'}`}
              >
                শুরু করুন
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer>
        <div className="footer-title">GroceryNow</div>
        <div>আপনার এলাকার সেরা গ্রোসারি প্ল্যাটফর্ম</div>
        <div className="footer-copy">© 2026 GroceryNow. সর্বস্বত্ব সংরক্ষিত।</div>
      </footer>
    </div>
  )
}
