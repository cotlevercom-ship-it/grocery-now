import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'

export const metadata = {
  title: 'Become a Seller — Cot Lever',
  description: 'Bring your shop online with Cot Lever',
}

const faqs = [
  { q: 'Does Cot Lever take a commission on my sales?', a: 'No. Cot Lever never takes a percentage of your sales. You only pay a flat monthly subscription.' },
  { q: 'Can I sell outside my own city?', a: 'Yes. There is no area restriction — your shop is visible to buyers across Bangladesh, and internationally if you offer international delivery.' },
  { q: 'How do I get paid?', a: 'Your subscription is paid via bKash. Orders themselves are settled directly between you and your buyer through your chosen delivery method.' },
  { q: 'Can I offer store pickup instead of delivery?', a: 'Yes. You can enable store pickup with your own address from your seller settings, in addition to or instead of home delivery.' },
]

async function getPackages() {
  try {
    const data = await supabaseFetch('seller_packages?select=*&is_active=eq.true&order=sort_order')
    return data || []
  } catch (e) {
    console.error(e)
    return []
  }
}

export default async function SellerLandingPage() {
  const packages = await getPackages()

  return (
    <div className="seller-landing">
      <style>{`
        .seller-landing {
          --ink: #0a0a0a;
          --paper: #faf9f7;
          --line: #e8e6e2;
          --text: #2a2a2a;
          --muted: #6b6b6b;
          --red: #dc2626;
          --red-dark: #b91c1c;
          font-family: 'Poppins', 'Hind Siliguri', system-ui, sans-serif;
          color: var(--text);
          background: var(--paper);
        }

        .hero { background: var(--ink); color: white; padding: 48px 20px 56px; }
        .hero-inner { max-width: 560px; margin: 0 auto; text-align: center; }
        .brand { font-size: 12px; font-weight: 700; color: var(--red); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 16px; }
        .hero h1 { font-size: clamp(28px, 8vw, 40px); font-weight: 700; line-height: 1.15; letter-spacing: -0.01em; margin: 0 0 14px; }
        .hero p { font-size: 15px; color: rgba(255,255,255,0.7); max-width: 400px; margin: 0 auto 26px; line-height: 1.6; }
        .cta {
          display: inline-block; background: var(--red); color: white;
          padding: 14px 32px; border-radius: 999px; font-weight: 700; font-size: 15px;
          text-decoration: none; width: 100%; max-width: 280px; transition: background 0.15s ease;
        }
        .cta:hover { background: var(--red-dark); }
        .cta:focus-visible { outline: 2px solid white; outline-offset: 3px; }
        .login-link { display: block; margin-top: 16px; color: rgba(255,255,255,0.55); font-size: 13px; text-decoration: underline; text-underline-offset: 3px; }
        .login-link:focus-visible { outline: 2px solid white; outline-offset: 2px; }

        .section { padding: 48px 16px; }
        .section-head { text-align: center; max-width: 460px; margin: 0 auto 32px; }
        .section-title { font-size: clamp(20px, 5vw, 26px); font-weight: 700; letter-spacing: -0.01em; margin: 0 0 8px; }
        .section-sub { font-size: 14px; color: var(--muted); margin: 0; }

        .package-grid {
          display: grid; grid-template-columns: 1fr; gap: 16px;
          max-width: 860px; margin: 0 auto;
        }
        .package-card {
          background: white; border-radius: 14px; border: 1px solid var(--line);
          padding: 28px 24px; text-align: center;
        }
        .package-card.highlight { border: 1.5px solid var(--red); }
        .badge {
          display: inline-block; background: var(--red); color: white; font-size: 10px;
          font-weight: 700; letter-spacing: 0.03em; padding: 3px 10px; border-radius: 4px; margin-bottom: 14px;
        }
        .package-name { font-size: 13px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.03em; }
        .package-price-row { margin: 8px 0 22px; display: flex; align-items: baseline; justify-content: center; gap: 5px; }
        .package-price { font-size: 32px; font-weight: 700; color: var(--ink); }
        .package-period { font-size: 13px; color: var(--muted); }
        .package-features { list-style: none; padding: 18px 0 0; margin: 0 0 22px; border-top: 1px solid var(--line); text-align: left; }
        .package-features li { font-size: 13px; color: var(--text); margin-top: 10px; padding-left: 20px; position: relative; }
        .package-features li::before { content: '✓'; position: absolute; left: 0; color: var(--red); font-weight: 700; }
        .package-btn {
          display: block; text-align: center; padding: 12px; border-radius: 999px;
          text-decoration: none; font-weight: 700; font-size: 14px;
          background: var(--red); color: white; transition: background 0.15s ease;
        }
        .package-btn:hover { background: var(--red-dark); }
        .package-btn:focus-visible { outline: 2px solid var(--red); outline-offset: 2px; }

        .faq-list { max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: 10px; }
        .faq-item { background: white; border: 1px solid var(--line); border-radius: 10px; padding: 4px 18px; }
        .faq-item summary { padding: 16px 0; font-size: 14px; font-weight: 700; color: var(--ink); cursor: pointer; list-style: none; }
        .faq-item summary::-webkit-details-marker { display: none; }
        .faq-item summary::after { content: '+'; float: right; color: var(--red); font-weight: 700; }
        .faq-item[open] summary::after { content: '−'; }
        .faq-answer { font-size: 13px; color: var(--muted); line-height: 1.65; padding-bottom: 16px; }

        .cta-band { background: var(--red); color: white; padding: 44px 20px; text-align: center; }
        .cta-band h2 { font-size: clamp(20px, 5vw, 26px); font-weight: 700; margin: 0 0 20px; }
        .cta-band .cta { background: white; color: var(--red); }
        .cta-band .cta:hover { background: #f5f5f5; }

        footer { padding: 26px 20px; text-align: center; font-size: 13px; color: var(--muted); background: var(--paper); }
        .footer-title { font-weight: 700; font-size: 15px; color: var(--ink); margin-bottom: 4px; }
        .footer-copy { margin-top: 10px; font-size: 12px; color: #a0a0a0; }

        @media (min-width: 640px) {
          .hero { padding: 72px 20px 80px; }
          .cta { width: auto; }
          .cta-band .cta { width: auto; }
          .section { padding: 64px 20px; }
          .package-grid { grid-template-columns: repeat(${Math.min(packages.length, 2)}, 1fr); max-width: ${packages.length > 1 ? '600px' : '380px'}; }
        }
        @media (prefers-reduced-motion: reduce) { .cta { transition: none; } }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />

      <section className="hero">
        <div className="hero-inner">
          <div className="brand">Cot Lever Seller Program</div>
          <h1>Bring Your Shop Online</h1>
          <p>Reach buyers directly across Bangladesh and worldwide — no commission, ever. Just a simple monthly plan.</p>
          <a href="#pricing" className="cta">Start Selling</a>
          <Link href="/seller/login" className="login-link">Already have an account? Log in</Link>
        </div>
      </section>

      <section className="section" id="pricing" style={{ background: 'white' }}>
        <div className="section-head">
          <h2 className="section-title">Choose a Package</h2>
          <p className="section-sub">Pick the plan that fits your shop</p>
        </div>
        <div className="package-grid">
          {packages.map((p, i) => (
            <div key={p.id} className={`package-card ${i === packages.length - 1 && packages.length > 1 ? 'highlight' : ''}`}>
              {i === packages.length - 1 && packages.length > 1 && <div className="badge">Most Popular</div>}
              <div className="package-name">{p.name_bn}</div>
              <div className="package-price-row">
                <span className="package-price">{p.price > 0 ? `৳${p.price}` : 'Free'}</span>
                {p.price > 0 && <span className="package-period">/month</span>}
              </div>
              {p.features_bn?.length > 0 && (
                <ul className="package-features">
                  {p.features_bn.map((f, idx) => <li key={idx}>{f}</li>)}
                </ul>
              )}
              <Link href={`/seller/create?pkg=${p.id}`} className="package-btn">Get Started</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Common Questions</h2>
        </div>
        <div className="faq-list">
          {faqs.map(f => (
            <details key={f.q} className="faq-item">
              <summary>{f.q}</summary>
              <div className="faq-answer">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <h2>Ready to open your shop?</h2>
        <a href="#pricing" className="cta">Start Selling</a>
      </section>

      <footer>
        <div className="footer-title">Cot Lever</div>
        <div>Sell across Bangladesh and beyond</div>
        <div className="footer-copy">© 2026 Cot Lever. All rights reserved.</div>
      </footer>
    </div>
  )
}
