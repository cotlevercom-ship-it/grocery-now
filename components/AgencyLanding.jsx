const CSS = `
  .cl-agency { --ink: #0f3d3e; --ink-soft: #275457; --paper: #faf6ef; --paper-dim: #f1ead9;
    --marigold: #e6a039; --marigold-deep: #c97f1f; --rickshaw: #c1432e; --line: #ddd2b8; --text-muted: #5b6461;
    background: var(--paper); color: var(--ink); font-family: 'Hind Siliguri', sans-serif; -webkit-font-smoothing: antialiased; }
  .cl-agency .en { font-family: 'Space Grotesk', sans-serif; }
  .cl-agency .wrap { max-width: 480px; margin: 0 auto; padding: 0 20px; }
  .cl-agency .hero { background: linear-gradient(160deg, var(--ink) 0%, #133f40 55%, #1a4d4e 100%); padding: 28px 0 0; position: relative; overflow: hidden; }
  .cl-agency .hero::before { content: ''; position: absolute; top: -60px; right: -60px; width: 220px; height: 220px; border-radius: 50%; background: radial-gradient(circle, rgba(230,160,57,0.25), transparent 70%); }
  .cl-agency .brand-row { display: flex; align-items: center; gap: 8px; padding: 0 20px; margin-bottom: 26px; }
  .cl-agency .brand-mark { width: 30px; height: 30px; border-radius: 8px; background: var(--marigold); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--ink); font-size: 15px; }
  .cl-agency .brand-name { color: #fff; font-weight: 700; font-size: 15px; letter-spacing: 0.02em; }
  .cl-agency .hero-inner { padding: 8px 20px 40px; position: relative; }
  .cl-agency .eyebrow { display: inline-block; font-size: 12px; font-weight: 600; color: var(--marigold); background: rgba(230,160,57,0.14); border: 1px solid rgba(230,160,57,0.35); padding: 5px 12px; border-radius: 20px; margin-bottom: 16px; }
  .cl-agency .hero h1 { color: #fff; font-size: 30px; line-height: 1.35; font-weight: 700; margin: 0 0 14px; }
  .cl-agency .hero h1 span { color: var(--marigold); }
  .cl-agency .hero p { color: rgba(255,255,255,0.72); font-size: 14.5px; line-height: 1.7; margin: 0 0 26px; max-width: 380px; }
  .cl-agency .cta-row { display: flex; gap: 10px; flex-wrap: wrap; }
  .cl-agency .btn { display: inline-flex; align-items: center; gap: 7px; padding: 13px 22px; border-radius: 10px; font-size: 14.5px; font-weight: 700; text-decoration: none; border: none; cursor: pointer; }
  .cl-agency .btn-primary { background: var(--marigold); color: var(--ink); }
  .cl-agency .btn-ghost { background: transparent; color: #fff; border: 1.5px solid rgba(255,255,255,0.3); }
  .cl-agency .stat-strip { display: flex; margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 18px; }
  .cl-agency .stat { flex: 1; }
  .cl-agency .stat b { display: block; color: var(--marigold); font-size: 18px; font-family: 'Space Grotesk', sans-serif; }
  .cl-agency .stat span { color: rgba(255,255,255,0.6); font-size: 11.5px; }
  .cl-agency .section { padding: 40px 0 8px; }
  .cl-agency .section-label { font-size: 12px; font-weight: 700; letter-spacing: 0.08em; color: var(--rickshaw); text-transform: uppercase; margin-bottom: 8px; }
  .cl-agency .section-title { font-size: 22px; font-weight: 700; margin: 0 0 6px; }
  .cl-agency .section-sub { color: var(--text-muted); font-size: 13.5px; margin: 0 0 24px; line-height: 1.6; }
  .cl-agency .service-card { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 20px; margin-bottom: 14px; display: flex; gap: 14px; align-items: flex-start; box-shadow: 0 2px 10px rgba(15,61,62,0.04); }
  .cl-agency .service-icon { width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 19px; }
  .cl-agency .ic-1 { background: #fbe9df; }
  .cl-agency .ic-2 { background: #e3eef0; }
  .cl-agency .ic-3 { background: #fdf1de; }
  .cl-agency .service-body h3 { margin: 0 0 5px; font-size: 15.5px; font-weight: 700; }
  .cl-agency .service-body p { margin: 0; font-size: 13px; color: var(--text-muted); line-height: 1.6; }
  .cl-agency .pkg-scroll { display: flex; gap: 12px; overflow-x: auto; padding: 4px 0 18px; scrollbar-width: none; }
  .cl-agency .pkg-scroll::-webkit-scrollbar { display: none; }
  .cl-agency .pkg-card { min-width: 235px; background: #fff; border-radius: 16px; border: 1px solid var(--line); padding: 20px; flex-shrink: 0; position: relative; }
  .cl-agency .pkg-card.featured { border: 2px solid var(--marigold); background: linear-gradient(180deg, #fffaf0 0%, #ffffff 100%); }
  .cl-agency .pkg-tag { position: absolute; top: -11px; left: 16px; background: var(--rickshaw); color: #fff; font-size: 10.5px; font-weight: 700; padding: 4px 10px; border-radius: 20px; }
  .cl-agency .pkg-name { font-size: 14px; font-weight: 700; color: var(--text-muted); margin-bottom: 4px; }
  .cl-agency .pkg-price { font-family: 'Space Grotesk', sans-serif; font-size: 26px; font-weight: 700; color: var(--ink); }
  .cl-agency .pkg-list { list-style: none; padding: 0; margin: 14px 0 18px; }
  .cl-agency .pkg-list li { font-size: 12.5px; color: var(--ink-soft); padding: 6px 0 6px 20px; position: relative; line-height: 1.5; border-bottom: 1px dashed #eee2c9; }
  .cl-agency .pkg-list li:last-child { border: none; }
  .cl-agency .pkg-list li::before { content: '✓'; position: absolute; left: 0; color: var(--marigold-deep); font-weight: 700; }
  .cl-agency .pkg-btn { display: block; text-align: center; width: 100%; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 700; text-decoration: none; background: var(--ink); color: #fff; }
  .cl-agency .pkg-card.featured .pkg-btn { background: var(--marigold); color: var(--ink); }
  .cl-agency .why-row { display: flex; gap: 12px; margin-bottom: 12px; }
  .cl-agency .why-num { font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 700; color: var(--marigold-deep); width: 24px; flex-shrink: 0; padding-top: 2px; }
  .cl-agency .why-text h4 { margin: 0 0 3px; font-size: 14px; font-weight: 700; }
  .cl-agency .why-text p { margin: 0; font-size: 12.5px; color: var(--text-muted); line-height: 1.6; }
  .cl-agency .final-cta { margin: 36px 0 0; background: var(--ink); border-radius: 20px; padding: 30px 24px; text-align: center; position: relative; overflow: hidden; }
  .cl-agency .final-cta::after { content: ''; position: absolute; bottom: -40px; left: -40px; width: 160px; height: 160px; border-radius: 50%; background: radial-gradient(circle, rgba(193,67,46,0.25), transparent 70%); }
  .cl-agency .final-cta h2 { color: #fff; font-size: 19px; margin: 0 0 8px; position: relative; }
  .cl-agency .final-cta p { color: rgba(255,255,255,0.65); font-size: 13px; margin: 0 0 20px; position: relative; }
  .cl-agency footer { text-align: center; padding: 28px 20px 40px; color: var(--text-muted); font-size: 11.5px; }
`

const WA = 'https://wa.me/8801734570112'

export default function AgencyLanding() {
  return (
    <div className="cl-agency">
      <style>{CSS}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />

      <div className="hero">
        <div className="brand-row">
          <div className="brand-mark en">CL</div>
          <div className="brand-name en">COT LEVER</div>
        </div>
        <div className="hero-inner">
          <span className="eyebrow">ডিজিটাল গ্রোথ পার্টনার</span>
          <h1>আপনার দোকান বা ব্যবসাকে <span>অনলাইনে</span> নিয়ে আসি, নতুন কাস্টমার এনে দেই।</h1>
          <p>ওয়েবসাইট, ফেসবুক পেজ আর হোয়াটসঅ্যাপ বিজনেস — সবকিছু একসাথে, ঢাকার লোকাল টিম দিয়ে বানানো, সহজ কিস্তিতে।</p>
          <div className="cta-row">
            <a href="#packages" className="btn btn-primary">প্যাকেজ দেখুন</a>
            <a href={WA} className="btn btn-ghost">হোয়াটসঅ্যাপে কথা বলুন</a>
          </div>
          <div className="stat-strip">
            <div className="stat"><b className="en">3+</b><span>নিজের বানানো লাইভ প্রোডাক্ট</span></div>
            <div className="stat"><b className="en">৭ দিন</b><span>ওয়েবসাইট ডেলিভারি</span></div>
            <div className="stat"><b className="en">০</b><span>হিডেন চার্জ</span></div>
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className="section">
          <div className="section-label">সার্ভিস</div>
          <h2 className="section-title">আমরা কী কী করি</h2>
          <p className="section-sub">প্রতিটা সার্ভিস আলাদাভাবেও নেওয়া যায়, একসাথেও।</p>

          <div className="service-card">
            <div className="service-icon ic-1">🌐</div>
            <div className="service-body">
              <h3>ওয়েবসাইট / ল্যান্ডিং পেজ</h3>
              <p>মোবাইল-ফ্রেন্ডলি প্রফেশনাল সাইট, প্রোডাক্ট বা সার্ভিস শোকেস, সরাসরি হোয়াটসঅ্যাপে অর্ডার বাটন সহ।</p>
            </div>
          </div>

          <div className="service-card">
            <div className="service-icon ic-2">📣</div>
            <div className="service-body">
              <h3>ফেসবুক পেজ + অ্যাড সেটআপ</h3>
              <p>প্রফেশনাল পেজ ব্র্যান্ডিং, প্রথম অ্যাড ক্যাম্পেইন সেটআপ ও টার্গেটিং — আপনার এলাকার কাস্টমার পর্যন্ত পৌঁছানো।</p>
            </div>
          </div>

          <div className="service-card">
            <div className="service-icon ic-3">💬</div>
            <div className="service-body">
              <h3>হোয়াটসঅ্যাপ বিজনেস সেটআপ</h3>
              <p>বিজনেস প্রোফাইল, প্রোডাক্ট ক্যাটালগ, অটো-রিপ্লাই — কাস্টমার মেসেজ করলেই সাথে সাথে রেসপন্স।</p>
            </div>
          </div>
        </div>

        <div className="section" id="packages">
          <div className="section-label">প্যাকেজ</div>
          <h2 className="section-title">সহজ, স্বচ্ছ দাম</h2>
          <p className="section-sub">এককালীন পেমেন্ট, লুকানো কোনো চার্জ নেই। অ্যাড বাজেট এতে ধরা নেই।</p>

          <div className="pkg-scroll">
            <div className="pkg-card">
              <div className="pkg-name">ওয়েবসাইট</div>
              <div className="pkg-price en">৳৮,০০০</div>
              <ul className="pkg-list">
                <li>মোবাইল-রেসপন্সিভ ল্যান্ডিং পেজ</li>
                <li>WhatsApp অর্ডার বাটন</li>
                <li>৩টা পর্যন্ত পেজ</li>
                <li>৭ দিনে ডেলিভারি</li>
              </ul>
              <a href={WA} className="pkg-btn">নিতে চাই</a>
            </div>

            <div className="pkg-card featured">
              <div className="pkg-tag">সবচেয়ে জনপ্রিয়</div>
              <div className="pkg-name">কমপ্লিট প্যাকেজ</div>
              <div className="pkg-price en">৳১৪,০০০</div>
              <ul className="pkg-list">
                <li>ওয়েবসাইট + ফেসবুক + হোয়াটসঅ্যাপ</li>
                <li>সব একসাথে, ২,০০০ টাকা সাশ্রয়</li>
                <li>প্রথম মাস ফ্রি সাপোর্ট</li>
                <li>১০ দিনে সম্পূর্ণ ডেলিভারি</li>
              </ul>
              <a href={WA} className="pkg-btn">নিতে চাই</a>
            </div>

            <div className="pkg-card">
              <div className="pkg-name">ফেসবুক + হোয়াটসঅ্যাপ</div>
              <div className="pkg-price en">৳৭,০০০</div>
              <ul className="pkg-list">
                <li>পেজ ব্র্যান্ডিং + অ্যাড সেটআপ</li>
                <li>হোয়াটসঅ্যাপ বিজনেস + ক্যাটালগ</li>
                <li>৫ দিনে ডেলিভারি</li>
              </ul>
              <a href={WA} className="pkg-btn">নিতে চাই</a>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' }}>চলমান সাপোর্ট/মেইনটেন্যান্স চাইলে মাসিক ৳৩,০০০ থেকে শুরু</p>
        </div>

        <div className="section">
          <div className="section-label">কেন আমরা</div>
          <h2 className="section-title">অন্য এজেন্সির চেয়ে আলাদা</h2>
          <div style={{ marginTop: '20px' }}>
            <div className="why-row">
              <div className="why-num en">01</div>
              <div className="why-text">
                <h4>নিজের হাতে বানানো, বিক্রি করা না</h4>
                <p>আমরা নিজেরাই মার্কেটপ্লেস, বুকিং সিস্টেম, ও অ্যাপ বানিয়ে চালাই — টেমপ্লেট বিক্রি করি না।</p>
              </div>
            </div>
            <div className="why-row">
              <div className="why-num en">02</div>
              <div className="why-text">
                <h4>সরাসরি যোগাযোগ, এজেন্সি নয় পার্টনার</h4>
                <p>কোনো কল সেন্টার বা মিডলম্যান নেই — সরাসরি হোয়াটসঅ্যাপে কথা বলুন।</p>
              </div>
            </div>
            <div className="why-row">
              <div className="why-num en">03</div>
              <div className="why-text">
                <h4>বাংলাদেশের বাজার বুঝে কাজ করি</h4>
                <p>বিকাশ, হোয়াটসঅ্যাপ অর্ডার, লোকাল ডেলিভারি — যা আপনার কাস্টমার আসলে ব্যবহার করে।</p>
              </div>
            </div>
          </div>
        </div>

        <div className="final-cta">
          <h2>আজই শুরু করি</h2>
          <p>ফ্রি কনসালটেশনের জন্য হোয়াটসঅ্যাপে মেসেজ দিন</p>
          <a href={WA} className="btn btn-primary">হোয়াটসঅ্যাপে মেসেজ দিন</a>
        </div>

        <footer>
          © Cot Lever · Dhaka, Bangladesh
        </footer>
      </div>
    </div>
  )
}
