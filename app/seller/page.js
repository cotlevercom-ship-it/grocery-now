import Link from 'next/link'

export const metadata = {
  title: 'বিক্রেতা হন — GroceryNow',
  description: 'আপনার দোকান অনলাইনে নিয়ে আসুন GroceryNow এর সাথে',
}

const steps = [
  { n: '০১', title: 'অ্যাকাউন্ট খুলুন', desc: 'দোকানের নাম, এলাকা ও তথ্য দিয়ে কয়েক মিনিটে রেজিস্ট্রেশন সম্পন্ন করুন' },
  { n: '০২', title: 'প্রোডাক্ট যোগ করুন', desc: 'নিজের ড্যাশবোর্ড থেকে দাম, ছবি ও স্টক দিয়ে প্রোডাক্ট তালিকাভুক্ত করুন' },
  { n: '০৩', title: 'অর্ডার পেতে শুরু করুন', desc: 'এলাকার ক্রেতারা আপনার দোকান খুঁজে পাবে, অর্ডার আসবে রিয়েল-টাইমে' },
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
    <div className="seller-landing">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Tiro+Bangla&display=swap" />
      <style>{`
        .seller-landing {
          --ink: #12271d;
          --forest: #163a2c;
          --leaf: #2e7d32;
          --papaya: #e2792e;
          --papaya-dark: #c4611c;
          --paper: #faf7f0;
          --line: #e6ded0;
          --muted: #7a7568;
          font-family: 'Hind Siliguri', sans-serif;
        }
        .display {
          font-family: 'Tiro Bangla', serif;
        }
        .mono {
          font-family: ui-monospace, 'SF Mono', Consolas, monospace;
        }

        /* Hero */
        .hero {
          background: linear-gradient(160deg, var(--forest) 0%, var(--leaf) 100%);
          color: white;
          padding: 52px 20px 60px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.08) 1.5px, transparent 1.5px);
          background-size: 22px 22px;
          opacity: 0.5;
        }
        .hero-inner { position: relative; max-width: 560px; margin: 0 auto; }
        .eyebrow {
          display: inline-block;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: #ffe0b8;
          background: rgba(226,121,46,0.18);
          border: 1px solid rgba(226,121,46,0.4);
          padding: 5px 14px;
          border-radius: 20px;
          margin-bottom: 18px;
        }
        .hero h1 {
          font-size: clamp(26px, 6.5vw, 38px);
          font-weight: 400;
          line-height: 1.35;
          margin: 0 0 14px;
        }
        .hero h1 em {
          font-style: normal;
          color: #ffcb96;
          border-bottom: 2px solid var(--papaya);
        }
        .hero p {
          font-size: clamp(14px, 3.5vw, 16px);
          color: #dcebe0;
          max-width: 460px;
          margin: 0 auto 28px;
          line-height: 1.6;
        }
        .cta {
          display: inline-block;
          background: var(--papaya);
          color: white;
          padding: 14px 30px;
          border-radius: 9px;
          font-weight: 700;
          font-size: 15px;
          text-decoration: none;
          width: 100%;
          max-width: 300px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.18);
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .cta:hover { background: var(--papaya-dark); transform: translateY(-1px); }
        .cta:focus-visible { outline: 2px solid white; outline-offset: 3px; }
        .login-link {
          display: block;
          margin-top: 16px;
          color: #dcebe0;
          font-size: 13px;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .login-link:focus-visible { outline: 2px solid white; outline-offset: 2px; }

        /* Sections */
        .section { padding: 44px 16px; background: var(--paper); }
        .section-head { text-align: center; max-width: 480px; margin: 0 auto 32px; }
        .section-title {
          font-size: clamp(20px, 4.5vw, 26px);
          font-weight: 400;
          color: var(--ink);
          margin: 0 0 8px;
        }
        .section-sub { font-size: 14px; color: var(--muted); margin: 0; }

        /* Steps */
        .steps { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 0; }
        .step {
          display: flex;
          gap: 18px;
          align-items: flex-start;
          padding: 20px 4px;
          border-top: 1px solid var(--line);
        }
        .step:last-child { border-bottom: 1px solid var(--line); }
        .step-num {
          font-family: ui-monospace, 'SF Mono', Consolas, monospace;
          font-size: 14px;
          font-weight: 700;
          color: var(--papaya);
          flex-shrink: 0;
          padding-top: 2px;
        }
        .step-title { font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
        .step-desc { font-size: 13px; color: var(--muted); line-height: 1.6; max-width: 480px; }

        /* Packages */
        .package-section { background: white; }
        .package-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          max-width: 900px;
          margin: 0 auto;
        }
        .package-card {
          background: var(--paper);
          border-radius: 4px;
          padding: 0;
          border: 1px solid var(--line);
          position: relative;
          overflow: hidden;
        }
        .package-card.highlight { border: 1px solid var(--leaf); box-shadow: 0 10px 28px rgba(22,58,44,0.12); }
        .ticket-edge {
          height: 10px;
          background-image: radial-gradient(circle at 8px 0, transparent 6px, var(--paper) 6.5px);
          background-size: 16px 10px;
          background-repeat: repeat-x;
        }
        .package-card.highlight .ticket-edge {
          background-image: radial-gradient(circle at 8px 0, transparent 6px, var(--paper) 6.5px);
        }
        .package-body { padding: 22px 22px 24px; }
        .badge {
          display: inline-block;
          background: var(--papaya);
          color: white;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          padding: 3px 10px;
          border-radius: 10px;
          margin-bottom: 12px;
        }
        .package-name { font-size: 14px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
        .package-price-row { margin: 8px 0 18px; display: flex; align-items: baseline; gap: 6px; }
        .package-price { font-family: ui-monospace, 'SF Mono', Consolas, monospace; font-size: 30px; font-weight: 700; color: var(--ink); }
        .package-period { font-size: 13px; color: var(--muted); }
        .package-features { list-style: none; padding: 0; margin: 0 0 20px; border-top: 1px dashed var(--line); padding-top: 16px; }
        .package-features li { font-size: 13px; color: #4a4638; margin-bottom: 9px; padding-left: 18px; position: relative; }
        .package-features li::before {
          content: '✓';
          position: absolute; left: 0; color: var(--leaf); font-weight: 700;
        }
        .package-btn {
          display: block;
          text-align: center;
          padding: 11px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 700;
          font-size: 14px;
          transition: background 0.15s ease;
        }
        .package-btn.highlight { background: var(--leaf); color: white; }
        .package-btn.highlight:hover { background: #256b2a; }
        .package-btn.plain { background: white; color: var(--ink); border: 1px solid var(--line); }
        .package-btn.plain:hover { background: #f2ede1; }
        .package-btn:focus-visible { outline: 2px solid var(--leaf); outline-offset: 2px; }

        footer {
          background: var(--forest);
          color: #cfe0d3;
          padding: 30px 20px;
          text-align: center;
          font-size: 13px;
        }
        .footer-title { font-family: 'Tiro Bangla', serif; font-weight: 400; font-size: 18px; color: white; margin-bottom: 6px; }
        .footer-copy { margin-top: 14px; color: #7fa088; font-size: 12px; }

        @media (min-width: 640px) {
          .hero { padding: 76px 20px 88px; }
          .cta { width: auto; }
          .section { padding: 64px 20px; }
          .package-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cta { transition: none; }
        }
      `}</style>

      <section className="hero">
        <div className="hero-inner">
          <span className="eyebrow">GroceryNow বিক্রেতা প্রোগ্রাম</span>
          <h1 className="display">
            আপনার দোকান নিয়ে আসুন <em>অনলাইনে</em>
          </h1>
          <p>GroceryNow-তে যুক্ত হয়ে আপনার এলাকার হাজারো ক্রেতার কাছে সরাসরি প্রোডাক্ট পৌঁছে দিন</p>
          <Link href="/seller/create" className="cta">বিক্রেতা হিসেবে শুরু করুন</Link>
          <Link href="/seller/login" className="login-link">আগে থেকে অ্যাকাউন্ট আছে? লগইন করুন</Link>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title display">কীভাবে শুরু করবেন</h2>
          <p className="section-sub">তিনটা ধাপ, দোকান খোলা থেকে প্রথম অর্ডার পর্যন্ত</p>
        </div>
        <div className="steps">
          {steps.map(s => (
            <div key={s.n} className="step">
              <div className="step-num mono">{s.n}</div>
              <div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section package-section">
        <div className="section-head">
          <h2 className="section-title display">প্যাকেজ বেছে নিন</h2>
          <p className="section-sub">দোকানের আকার অনুযায়ী প্ল্যান বদলাতে পারবেন যেকোনো সময়</p>
        </div>
        <div className="package-grid">
          {packages.map(p => (
            <div key={p.name} className={`package-card ${p.highlight ? 'highlight' : ''}`}>
              <div className="ticket-edge" />
              <div className="package-body">
                {p.highlight && <div className="badge">সবচেয়ে জনপ্রিয়</div>}
                <div className="package-name">{p.name}</div>
                <div className="package-price-row">
                  <span className="package-price">{p.price}</span>
                  <span className="package-period">{p.period}</span>
                </div>
                <ul className="package-features">
                  {p.features.map(feat => <li key={feat}>{feat}</li>)}
                </ul>
                <Link href="/seller/create" className={`package-btn ${p.highlight ? 'highlight' : 'plain'}`}>
                  শুরু করুন
                </Link>
              </div>
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
