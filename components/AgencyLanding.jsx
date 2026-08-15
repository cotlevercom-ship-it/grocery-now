const CSS = `
  .cl-agency { --ink: #101114; --surface: #1a1b20; --paper: #fafafa; --card: #ffffff;
    --line: #ecebe8; --accent: #ff5c72; --accent-deep: #e0435a; --mint: #1fbf9f;
    --text-muted: #85868c; --text-soft: #c9cacf;
    background: var(--paper); color: var(--ink); font-family: 'Hind Siliguri', sans-serif; -webkit-font-smoothing: antialiased; }
  .cl-agency .en { font-family: 'Space Grotesk', sans-serif; }
  .cl-agency .wrap { max-width: 480px; margin: 0 auto; padding: 0 20px; }
  .cl-agency .hero { background: var(--ink); position: relative; overflow: hidden; }
  .cl-agency .hero::before { content: ''; position: absolute; top: -80px; right: -100px; width: 320px; height: 320px; border-radius: 50%; background: radial-gradient(circle, rgba(255,92,114,0.22), transparent 68%); }
  .cl-agency .hero::after { content: ''; position: absolute; bottom: -120px; left: -80px; width: 260px; height: 260px; border-radius: 50%; background: radial-gradient(circle, rgba(31,191,159,0.14), transparent 70%); }
  .cl-agency .brand-row { display: flex; align-items: center; justify-content: space-between; padding: 22px 20px 0; position: relative; }
  .cl-agency .brand-name { color: #fff; font-weight: 700; font-size: 15px; letter-spacing: 0.01em; }
  .cl-agency .brand-dot { color: var(--accent); }
  .cl-agency .brand-cta { font-size: 12.5px; font-weight: 600; color: #fff; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14); padding: 7px 13px; border-radius: 20px; text-decoration: none; }
  .cl-agency .hero-inner { padding: 34px 20px 44px; position: relative; }
  .cl-agency .eyebrow { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 600; color: var(--accent); background: rgba(255,92,114,0.1); border: 1px solid rgba(255,92,114,0.25); padding: 5px 12px; border-radius: 20px; margin-bottom: 20px; letter-spacing: 0.02em; }
  .cl-agency .eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }
  .cl-agency .hero h1 { color: #fff; font-size: 33px; line-height: 1.28; font-weight: 700; margin: 0 0 16px; letter-spacing: -0.01em; }
  .cl-agency .hero h1 .hl { color: var(--accent); }
  .cl-agency .hero p { color: var(--text-soft); font-size: 14.5px; line-height: 1.75; margin: 0 0 28px; max-width: 380px; }
  .cl-agency .cta-row { display: flex; gap: 10px; flex-wrap: wrap; }
  .cl-agency .btn { display: inline-flex; align-items: center; gap: 7px; padding: 14px 22px; border-radius: 12px; font-size: 14.5px; font-weight: 700; text-decoration: none; border: none; cursor: pointer; }
  .cl-agency .btn-primary { background: var(--accent); color: #fff; box-shadow: 0 8px 20px rgba(255,92,114,0.28); }
  .cl-agency .btn-ghost { background: rgba(255,255,255,0.06); color: #fff; border: 1px solid rgba(255,255,255,0.16); }
  .cl-agency .stat-strip { display: flex; margin-top: 32px; gap: 22px; }
  .cl-agency .stat b { display: block; color: #fff; font-size: 20px; font-weight: 700; }
  .cl-agency .stat span { color: var(--text-muted); font-size: 11px; }
  .cl-agency .section { padding: 44px 0 6px; }
  .cl-agency .kicker { font-size: 11.5px; font-weight: 700; letter-spacing: 0.1em; color: var(--accent-deep); text-transform: uppercase; margin-bottom: 10px; }
  .cl-agency .section-title { font-size: 23px; font-weight: 700; margin: 0 0 8px; letter-spacing: -0.01em; }
  .cl-agency .section-sub { color: var(--text-muted); font-size: 13.5px; margin: 0 0 26px; line-height: 1.65; }
  .cl-agency .service-card { background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 20px; margin-bottom: 12px; display: flex; gap: 14px; align-items: flex-start; }
  .cl-agency .service-icon { width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: var(--ink); }
  .cl-agency .service-body h3 { margin: 0 0 5px; font-size: 15px; font-weight: 700; }
  .cl-agency .service-body p { margin: 0; font-size: 12.8px; color: var(--text-muted); line-height: 1.6; }
  .cl-agency .pkg-scroll { display: flex; gap: 12px; overflow-x: auto; padding: 4px 2px 18px; scrollbar-width: none; }
  .cl-agency .pkg-scroll::-webkit-scrollbar { display: none; }
  .cl-agency .pkg-card { min-width: 220px; background: var(--card); border-radius: 18px; border: 1px solid var(--line); padding: 22px 20px; flex-shrink: 0; position: relative; }
  .cl-agency .pkg-card.featured { background: var(--ink); border-color: var(--ink); }
  .cl-agency .pkg-tag { position: absolute; top: -11px; left: 18px; background: var(--accent); color: #fff; font-size: 10px; font-weight: 700; padding: 4px 11px; border-radius: 20px; letter-spacing: 0.02em; }
  .cl-agency .pkg-name { font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
  .cl-agency .pkg-card.featured .pkg-name { color: var(--text-soft); }
  .cl-agency .pkg-price { font-family: 'Space Grotesk', sans-serif; font-size: 27px; font-weight: 700; color: var(--ink); }
  .cl-agency .pkg-card.featured .pkg-price { color: #fff; }
  .cl-agency .pkg-list { list-style: none; padding: 0; margin: 16px 0 20px; }
  .cl-agency .pkg-list li { font-size: 12.3px; color: #4a4b52; padding: 7px 0 7px 20px; position: relative; line-height: 1.5; }
  .cl-agency .pkg-card.featured .pkg-list li { color: var(--text-soft); }
  .cl-agency .pkg-list li::before { content: ''; position: absolute; left: 0; top: 11px; width: 6px; height: 6px; border-radius: 50%; background: var(--mint); }
  .cl-agency .pkg-btn { display: block; text-align: center; width: 100%; padding: 11px; border-radius: 10px; font-size: 13px; font-weight: 700; text-decoration: none; background: var(--ink); color: #fff; }
  .cl-agency .pkg-card.featured .pkg-btn { background: var(--accent); color: #fff; }
  .cl-agency .pkg-note { font-size: 12px; color: var(--text-muted); text-align: center; margin-top: 6px; }
  .cl-agency .why-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 18px; }
  .cl-agency .why-card { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 16px; }
  .cl-agency .why-card .num { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: var(--accent-deep); margin-bottom: 8px; }
  .cl-agency .why-card h4 { margin: 0 0 5px; font-size: 13.5px; font-weight: 700; line-height: 1.4; }
  .cl-agency .why-card p { margin: 0; font-size: 11.8px; color: var(--text-muted); line-height: 1.55; }
  .cl-agency .final-cta { margin: 40px 0 0; background: var(--ink); border-radius: 22px; padding: 32px 24px; text-align: center; position: relative; overflow: hidden; }
  .cl-agency .final-cta::before { content: ''; position: absolute; top: -50px; right: -50px; width: 180px; height: 180px; border-radius: 50%; background: radial-gradient(circle, rgba(255,92,114,0.25), transparent 70%); }
  .cl-agency .final-cta h2 { color: #fff; font-size: 20px; margin: 0 0 8px; position: relative; letter-spacing: -0.01em; }
  .cl-agency .final-cta p { color: var(--text-soft); font-size: 13px; margin: 0 0 22px; position: relative; }
  .cl-agency footer { text-align: center; padding: 30px 20px 44px; color: var(--text-muted); font-size: 11.5px; }
`

const WA = 'https://wa.me/8801734570112'

export default function AgencyLanding() {
  return (
    <div className="cl-agency">
      <style>{CSS}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700;800&display=swap" rel="stylesheet" />

      <div className="hero">
        <div className="brand-row">
          <div className="brand-name en">COT LEVER<span className="brand-dot">.</span></div>
          <a href={WA} className="brand-cta">Contact</a>
        </div>
        <div className="hero-inner">
          <span className="eyebrow"><span className="eyebrow-dot"></span>DIGITAL GROWTH AGENCY</span>
          <h1>We take your <span className="hl">business</span> online.</h1>
          <p>Websites, Facebook Pages, and WhatsApp Business — built by a local Dhaka team, delivered on time.</p>
          <div className="cta-row">
            <a href="#packages" className="btn btn-primary">View Packages</a>
            <a href={WA} className="btn btn-ghost">Message on WhatsApp</a>
          </div>
          <div className="stat-strip">
            <div className="stat"><b className="en">3+</b><span>Live products shipped</span></div>
            <div className="stat"><b className="en">7 days</b><span>Website delivery</span></div>
            <div className="stat"><b className="en">0</b><span>Hidden charges</span></div>
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className="section">
          <div className="kicker">Services</div>
          <h2 className="section-title">What we do</h2>
          <p className="section-sub">Take one service, or bundle them all.</p>

          <div className="service-card">
            <div className="service-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff5c72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 21h8M12 18v3"/></svg>
            </div>
            <div className="service-body">
              <h3>Website / Landing Page</h3>
              <p>A mobile-friendly, professional site with a direct WhatsApp order button.</p>
            </div>
          </div>

          <div className="service-card">
            <div className="service-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff5c72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2 7 13H2l1.5 8L13 12l9-9-4-1z"/><path d="M15 5l4 4"/></svg>
            </div>
            <div className="service-body">
              <h3>Facebook Page + Ads Setup</h3>
              <p>Page branding, your first ad campaign setup, and targeting to reach customers in your area.</p>
            </div>
          </div>

          <div className="service-card">
            <div className="service-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff5c72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </div>
            <div className="service-body">
              <h3>WhatsApp Business Setup</h3>
              <p>Business profile, product catalog, auto-reply — instant response the moment someone messages.</p>
            </div>
          </div>
        </div>

        <div className="section" id="packages">
          <div className="kicker">Packages</div>
          <h2 className="section-title">Simple, transparent pricing</h2>
          <p className="section-sub">One-time payment. Ad spend is not included.</p>

          <div className="pkg-scroll">
            <div className="pkg-card">
              <div className="pkg-name">Website</div>
              <div className="pkg-price en">৳8,000</div>
              <ul className="pkg-list">
                <li>Mobile-responsive landing page</li>
                <li>WhatsApp order button</li>
                <li>Up to 3 pages</li>
                <li>7-day delivery</li>
              </ul>
              <a href={WA} className="pkg-btn">Let&apos;s start</a>
            </div>

            <div className="pkg-card featured">
              <div className="pkg-tag">Most popular</div>
              <div className="pkg-name">Complete Package</div>
              <div className="pkg-price en">৳14,000</div>
              <ul className="pkg-list">
                <li>Website + Facebook + WhatsApp</li>
                <li>Bundled — save ৳2,000</li>
                <li>First month of free support</li>
                <li>Full delivery in 10 days</li>
              </ul>
              <a href={WA} className="pkg-btn">Let&apos;s start</a>
            </div>

            <div className="pkg-card">
              <div className="pkg-name">Facebook + WhatsApp</div>
              <div className="pkg-price en">৳7,000</div>
              <ul className="pkg-list">
                <li>Page branding + ads setup</li>
                <li>WhatsApp Business + catalog</li>
                <li>5-day delivery</li>
              </ul>
              <a href={WA} className="pkg-btn">Let&apos;s start</a>
            </div>
          </div>
          <p className="pkg-note">Ongoing support/maintenance available from ৳3,000/month</p>
        </div>

        <div className="section">
          <div className="kicker">Why Us</div>
          <h2 className="section-title">What sets us apart</h2>

          <div className="why-grid">
            <div className="why-card">
              <div className="num en">01</div>
              <h4>We build, not just resell</h4>
              <p>We run our own marketplaces, booking systems, and apps.</p>
            </div>
            <div className="why-card">
              <div className="num en">02</div>
              <h4>Direct contact</h4>
              <p>No call centers — talk to us directly on WhatsApp.</p>
            </div>
            <div className="why-card">
              <div className="num en">03</div>
              <h4>We know the local market</h4>
              <p>bKash, WhatsApp orders, local delivery — what your customers actually use.</p>
            </div>
            <div className="why-card">
              <div className="num en">04</div>
              <h4>Transparent pricing</h4>
              <p>No hidden charges — everything is clear upfront.</p>
            </div>
          </div>
        </div>

        <div className="final-cta">
          <h2>Let&apos;s get started today</h2>
          <p>Message us on WhatsApp for a free consultation</p>
          <a href={WA} className="btn btn-primary">Message on WhatsApp</a>
        </div>

        <footer>© Cot Lever · Dhaka, Bangladesh</footer>
      </div>
    </div>
  )
}
