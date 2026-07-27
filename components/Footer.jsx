'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'

const COLORS = {
  ink: '#1a1a1a',
  gold: '#d99a1b',
  textMuted: '#6b6b6b',
  line: '#e7e2d8',
  bg: '#f7f5f1',
}

const FacebookIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M15 8.5H13.5C12.9 8.5 12.5 8.9 12.5 9.5V11.5H15L14.6 14H12.5V21H9.5V14H7.5V11.5H9.5V9.2C9.5 6.9 11 5.5 13.1 5.5H15V8.5Z" fill="currentColor" />
  </svg>
)
const WhatsAppIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M12 3C7.3 3 3.5 6.8 3.5 11.5C3.5 13 3.9 14.4 4.6 15.6L3.5 20L8 18.9C9.1 19.5 10.5 19.9 12 19.9C16.7 19.9 20.5 16.1 20.5 11.4C20.5 6.8 16.7 3 12 3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M9 10.3C9.2 11.6 10.4 13.1 12.1 13.6C12.5 13.7 13 13.5 13.3 13L13.6 12.5L15.2 13.2C15.2 13.9 14.7 14.5 14 14.7C12.2 15.2 9.4 13.5 8.5 11.6C8.1 10.9 8.4 10.2 8.9 9.8L9.4 9.4L9 10.3Z" fill="currentColor" />
  </svg>
)
const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M4.5 7L12 12.5L19.5 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function Footer() {
  const [infoPages, setInfoPages] = useState([])
  const [partnerPages, setPartnerPages] = useState([])
  const [settings, setSettings] = useState({ contact_email: '', whatsapp_number: '', facebook_url: '' })
  const [activeDot, setActiveDot] = useState(0)
  const scrollRef = useRef(null)

  useEffect(() => {
    async function load() {
      try {
        const [pages, settingRows] = await Promise.all([
          supabaseFetch(`site_pages?select=*&is_active=eq.true&order=sort_order`),
          supabaseFetch(`app_settings?select=key,value&key=in.(contact_email,whatsapp_number,facebook_url)`),
        ])
        setInfoPages((pages || []).filter(p => p.section === 'info'))
        setPartnerPages((pages || []).filter(p => p.section === 'partner'))
        const map = { contact_email: '', whatsapp_number: '', facebook_url: '' }
        ;(settingRows || []).forEach(r => { map[r.key] = r.value || '' })
        setSettings(map)
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [])

  const linkHref = (p) => p.link_type === 'external' ? p.external_url : `/page/${p.slug}`
  const whatsappHref = settings.whatsapp_number
    ? `https://wa.me/88${settings.whatsapp_number.replace(/^0/, '')}`
    : ''
  const hasSocial = settings.facebook_url || whatsappHref || settings.contact_email

  const columns = []
  if (infoPages.length > 0) {
    columns.push({ title: 'About Cot Lever', items: infoPages.map(p => ({ label: p.title, href: linkHref(p) })) })
  }
  if (partnerPages.length > 0) {
    columns.push({ title: 'Partner With Us', items: partnerPages.map(p => ({ label: p.title, href: linkHref(p) })) })
  } else {
    columns.push({
      title: 'Want to Sell?',
      items: [{ label: 'Open a Store →', href: '/seller' }],
    })
  }

  const totalCols = columns.length + (hasSocial ? 1 : 0)

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    const colWidth = el.firstChild ? el.firstChild.offsetWidth + 12 : 1
    setActiveDot(Math.round(el.scrollLeft / colWidth))
  }

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="col-scroll" ref={scrollRef} onScroll={handleScroll}>
          {columns.map((col, i) => (
            <div className="footer-card" style={totalCols === 1 ? { width: '100%' } : undefined} key={i}>
              <div className="card-title">{col.title}</div>
              <div className="link-list">
                {col.items.map((item, j) => (
                  <Link
                    key={j}
                    href={item.href}
                    className="footer-link"
                    style={{ display: 'block', width: '100%', marginBottom: '14px' }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {hasSocial && (
            <div className="footer-card" style={totalCols === 1 ? { width: '100%' } : undefined}>
              <div className="card-title">Contact</div>
              <div className="social-row">
                {settings.facebook_url && (
                  <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
                    <FacebookIcon />
                  </a>
                )}
                {whatsappHref && (
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="WhatsApp">
                    <WhatsAppIcon />
                  </a>
                )}
                {settings.contact_email && (
                  <a href={`mailto:${settings.contact_email}`} className="social-icon" aria-label="Email">
                    <MailIcon />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {totalCols > 1 && (
          <div className="dots">
            {columns.map((_, i) => (
              <span key={i} className={`dot ${i === activeDot ? 'active' : ''}`} />
            ))}
          </div>
        )}

        <div className="footer-bottom">
          <div className="brand-row">
            <span className="brand-badge">🛒</span>
            <span className="brand-name">COT LEVER</span>
          </div>
          <div className="bottom-text">
            <span>© 2026 <span className="gold-text">Cot Lever</span> — All rights reserved.</span>
            <span className="pay-line">bKash · Cash on Delivery</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .site-footer {
          background: ${COLORS.bg};
          border-top: 1px solid ${COLORS.line};
          margin-top: 32px;
          padding: 28px 16px 20px;
        }
        .footer-inner {
          max-width: 980px;
          margin: 0 auto;
        }
        .col-scroll {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .col-scroll::-webkit-scrollbar {
          display: none;
        }
        .footer-card {
          flex: 0 0 auto;
          scroll-snap-align: start;
          width: calc(50% - 6px);
          min-width: 190px;
          background: #fff;
          border: 1px solid ${COLORS.line};
          border-radius: 14px;
          padding: 18px 18px 6px;
        }
        .card-title {
          color: ${COLORS.gold};
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 0.3px;
          margin-bottom: 14px;
        }
        .link-list {
          display: flex;
          flex-direction: column;
        }
        .footer-link {
          display: block;
          font-size: 14px;
          color: ${COLORS.textMuted};
          text-decoration: none;
          margin-bottom: 14px;
          width: fit-content;
        }
        .footer-link:hover {
          color: ${COLORS.ink};
        }
        .social-row {
          display: flex;
          gap: 8px;
        }
        .social-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${COLORS.bg};
          border: 1px solid ${COLORS.line};
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${COLORS.ink};
          text-decoration: none;
        }
        .dots {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin: 14px 0 20px;
        }
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${COLORS.line};
        }
        .dot.active {
          background: ${COLORS.gold};
        }
        .footer-bottom {
          border-top: 1px solid ${COLORS.line};
          padding-top: 18px;
        }
        .brand-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }
        .brand-badge {
          font-size: 18px;
        }
        .brand-name {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: 0.5px;
          color: ${COLORS.ink};
        }
        .bottom-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 12.5px;
          color: ${COLORS.textMuted};
        }
        .gold-text {
          color: ${COLORS.gold};
        }
        .pay-line {
          font-size: 12px;
          color: ${COLORS.textMuted};
        }

        @media (min-width: 640px) {
          .col-scroll {
            overflow-x: visible;
          }
          .footer-card {
            width: auto;
            flex: 1;
          }
          .dots {
            display: none;
          }
        }
      `}</style>
    </footer>
  )
}
