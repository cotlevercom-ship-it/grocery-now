import Link from 'next/link'

export const metadata = {
  title: 'Become a Seller — Cot Lever',
  description: 'Bring your shop online with Cot Lever',
}

const steps = [
  { title: 'Open an account', desc: 'Complete registration in a few minutes with your shop name, location, and details' },
  { title: 'Add products', desc: 'List products with prices, photos, and stock from your own dashboard' },
  { title: 'Start receiving orders', desc: 'Buyers will find your shop, and orders will come in real time' },
]

const packages = [
  {
    name: 'Basic',
    price: '৳0',
    period: '/month',
    features: ['Up to 15 products', 'Order management', 'Basic shop profile'],
    highlight: false,
  },
  {
    name: 'Premium',
    price: '৳499',
    period: '/month',
    features: ['Unlimited product listings', 'Order management', 'Chance to be a featured shop', 'Priority support'],
    highlight: true,
  },
]

export default function SellerLandingPage() {
  return (
    <div className="seller-landing">
      <style>{`
        .seller-landing {
          --ink: #1a1a1a;
          --text: #3d3d3d;
          --muted: #767676;
          --line: #e5e5e5;
          --bg: #ffffff;
          --bg-soft: #fafafa;
          --accent: #1f6f43;
          --accent-dark: #17532f;
          font-family: 'Hind Siliguri', system-ui, sans-serif;
          color: var(--ink);
          background: var(--bg);
        }

        /* Hero */
        .hero {
          padding: 56px 20px 48px;
          text-align: center;
          border-bottom: 1px solid var(--line);
        }
        .hero-inner { max-width: 520px; margin: 0 auto; }
        .brand {
          font-size: 13px;
          font-weight: 700;
          color: var(--accent);
          letter-spacing: 0.02em;
          margin-bottom: 14px;
        }
        .hero h1 {
          font-size: clamp(24px, 6vw, 32px);
          font-weight: 700;
          line-height: 1.4;
          color: var(--ink);
          margin: 0 0 12px;
        }
        .hero p {
          font-size: 15px;
          color: var(--muted);
          max-width: 420px;
          margin: 0 auto 26px;
          line-height: 1.65;
        }
        .cta {
          display: inline-block;
          background: var(--accent);
          color: white;
          padding: 13px 28px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 15px;
          text-decoration: none;
          width: 100%;
          max-width: 280px;
          transition: background 0.15s ease;
        }
        .cta:hover { background: var(--accent-dark); }
        .cta:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
        .login-link {
          display: block;
          margin-top: 14px;
          color: var(--muted);
          font-size: 13px;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .login-link:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

        /* Sections */
        .section { padding: 40px 16px; }
        .section-soft { background: var(--bg-soft); }
        .section-head { text-align: center; max-width: 460px; margin: 0 auto 28px; }
        .section-title {
          font-size: clamp(19px, 4vw, 23px);
          font-weight: 700;
          color: var(--ink);
          margin: 0 0 6px;
        }
        .section-sub { font-size: 14px; color: var(--muted); margin: 0; }

        /* Steps */
        .steps { max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: 22px; }
        .step { display: flex; gap: 14px; align-items: flex-start; }
        .step-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--accent);
          flex-shrink: 0; margin-top: 7px;
        }
        .step-title { font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 3px; }
        .step-desc { font-size: 13px; color: var(--muted); line-height: 1.6; max-width: 480px; }

        /* Packages */
        .package-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          max-width: 860px;
          margin: 0 auto;
        }
        .package-card {
          background: white;
          border-radius: 8px;
          border: 1px solid var(--line);
          padding: 24px 22px;
        }
        .package-card.highlight { border: 1.5px solid var(--accent); }
        .badge {
          display: inline-block;
          background: var(--accent);
          color: white;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.03em;
          padding: 3px 10px;
          border-radius: 4px;
          margin-bottom: 12px;
        }
        .package-name { font-size: 13px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.03em; }
        .package-price-row { margin: 8px 0 18px; display: flex; align-items: baseline; gap: 5px; }
        .package-price { font-size: 28px; font-weight: 700; color: var(--ink); }
        .package-period { font-size: 13px; color: var(--muted); }
        .package-features { list-style: none; padding: 16px 0 0; margin: 0 0 20px; border-top: 1px solid var(--line); }
        .package-features li { font-size: 13px; color: var(--text); margin-top: 10px; padding-left: 20px; position: relative; }
        .package-features li::before {
          content: '✓';
          position: absolute; left: 0; color: var(--accent); font-weight: 700;
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
        .package-btn.highlight { background: var(--accent); color: white; }
        .package-btn.highlight:hover { background: var(--accent-dark); }
        .package-btn.plain { background: var(--bg-soft); color: var(--ink); border: 1px solid var(--line); }
        .package-btn.plain:hover { background: #f0f0f0; }
        .package-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

        footer {
          border-top: 1px solid var(--line);
          padding: 26px 20px;
          text-align: center;
          font-size: 13px;
          color: var(--muted);
        }
        .footer-title { font-weight: 700; font-size: 15px; color: var(--ink); margin-bottom: 4px; }
        .footer-copy { margin-top: 10px; font-size: 12px; color: #a0a0a0; }

        @media (min-width: 640px) {
          .hero { padding: 72px 20px 64px; }
          .cta { width: auto; }
          .section { padding: 56px 20px; }
          .package-grid { grid-template-columns: repeat(2, 1fr); max-width: 600px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cta { transition: none; }
        }
      `}</style>

      <section className="hero">
        <div className="hero-inner">
          <div className="brand">Cot Lever Seller Program</div>
          <h1>Bring Your Shop Online</h1>
          <p>Join Cot Lever and reach thousands of buyers directly — sell across Bangladesh and worldwide, no commission, subscription-based plans only</p>
          <Link href="/seller/login" className="login-link">Already have an account? Log in</Link>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">How to Get Started</h2>
          <p className="section-sub">Three steps, from opening your shop to your first order</p>
        </div>
        <div className="steps">
          {steps.map(s => (
            <div key={s.title} className="step">
              <div className="step-dot" />
              <div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-soft">
        <div className="section-head">
          <h2 className="section-title">Choose a Package</h2>
          <p className="section-sub">Switch plans anytime to match the size of your shop</p>
        </div>
        <div className="package-grid">
          {packages.map(p => (
            <div key={p.name} className={`package-card ${p.highlight ? 'highlight' : ''}`}>
              {p.highlight && <div className="badge">Most Popular</div>}
              <div className="package-name">{p.name}</div>
              <div className="package-price-row">
                <span className="package-price">{p.price}</span>
                <span className="package-period">{p.period}</span>
              </div>
              <ul className="package-features">
                {p.features.map(feat => <li key={feat}>{feat}</li>)}
              </ul>
              <Link href={`/seller/create?plan=${p.highlight ? 'premium' : 'free'}`} className={`package-btn ${p.highlight ? 'highlight' : 'plain'}`}>
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer>
        <div className="footer-title">Cot Lever</div>
        <div>The best grocery platform in your area</div>
        <div className="footer-copy">© 2026 Cot Lever. All rights reserved.</div>
      </footer>
    </div>
  )
}
