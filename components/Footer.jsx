'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'

const COLORS = {
  ink: '#0f2a20',
  forest: '#163a2c',
  forestMid: '#1f5b41',
  gold: '#d99a1b',
  goldSoft: '#f4e3c1',
  cream: '#faf8f4',
  line: '#e7e2d8',
  textMuted: '#6b7b74',
}

const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M15 8.5H13.5C12.9 8.5 12.5 8.9 12.5 9.5V11.5H15L14.6 14H12.5V21H9.5V14H7.5V11.5H9.5V9.2C9.5 6.9 11 5.5 13.1 5.5H15V8.5Z" fill="currentColor" />
  </svg>
)
const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 3C7.3 3 3.5 6.8 3.5 11.5C3.5 13 3.9 14.4 4.6 15.6L3.5 20L8 18.9C9.1 19.5 10.5 19.9 12 19.9C16.7 19.9 20.5 16.1 20.5 11.4C20.5 6.8 16.7 3 12 3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M9 10.3C9.2 11.6 10.4 13.1 12.1 13.6C12.5 13.7 13 13.5 13.3 13L13.6 12.5L15.2 13.2C15.2 13.9 14.7 14.5 14 14.7C12.2 15.2 9.4 13.5 8.5 11.6C8.1 10.9 8.4 10.2 8.9 9.8L9.4 9.4L9 10.3Z" fill="currentColor" />
  </svg>
)
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M4.5 7L12 12.5L19.5 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function Footer() {
  const [infoPages, setInfoPages] = useState([])
  const [partnerPages, setPartnerPages] = useState([])
  const [settings, setSettings] = useState({ contact_email: '', whatsapp_number: '', facebook_url: '' })

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

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="brand-row">
          <div className="brand-mark">
            <span className="brand-badge">🧺</span>
            <span className="brand-name">GroceryNow</span>
          </div>
          <p className="brand-tagline">আপনার এলাকার সেরা গ্রোসারি, ঘরে বসেই।</p>
        </div>

        <div className="card-grid">
          {infoPages.length > 0 && (
            <div className="footer-card">
              <div className="card-title">Info</div>
              {infoPages.map(p => (
                <Link key={p.id} href={linkHref(p)} className="footer-link">{p.title}</Link>
              ))}
            </div>
          )}

          {partnerPages.length > 0 && (
            <div className="footer-card">
              <div className="card-title">Partner With Us</div>
              {partnerPages.map(p => (
                <Link key={p.id} href={linkHref(p)} className="footer-link">{p.title}</Link>
              ))}
            </div>
          )}

          {hasSocial && (
            <div className="footer-card">
              <div className="card-title">Social</div>
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

          <div className="footer-card cta-card">
            <div className="card-title">বিক্রেতা হতে চান?</div>
            <p className="cta-text">নিজের এলাকায় দোকান খুলে অর্ডার নেওয়া শুরু করুন।</p>
            <Link href="/seller" className="cta-btn">দোকান খুলুন →</Link>
          </div>
        </div>

        <div className="footer-bottom">
          © ২০২৬ GroceryNow। সর্বস্বত্ব সংরক্ষিত।
        </div>
      </div>

      <style jsx>{`
        .site-footer {
          background: linear-gradient(160deg, ${COLORS.ink} 0%, ${COLORS.forestMid} 100%);
          margin-top: 32px;
          padding: 40px 20px 24px;
        }
        .footer-inner {
          max-width: 980px;
          margin: 0 auto;
        }
        .brand-row {
          text-align: center;
          margin-bottom: 28px;
        }
        .brand-mark {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .brand-badge {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: ${COLORS.gold};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }
        .brand-name {
          color: ${COLORS.cream};
          font-weight: 700;
          font-size: 17px;
        }
        .brand-tagline {
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          margin: 8px 0 0;
        }
        .card-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        .footer-card {
          background: ${COLORS.cream};
          border-radius: 14px;
          padding: 18px 20px;
        }
        .card-title {
          color: ${COLORS.forest};
          font-weight: 700;
          font-size: 13px;
          margin-bottom: 12px;
        }
        .footer-link {
          display: block;
          font-size: 13px;
          color: ${COLORS.textMuted};
          text-decoration: none;
          margin-bottom: 9px;
          transition: color 0.15s ease;
          width: fit-content;
        }
        .footer-link:hover {
          color: ${COLORS.forestMid};
        }
        .social-row {
          display: flex;
          gap: 8px;
        }
        .social-icon {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: white;
          border: 1px solid ${COLORS.line};
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${COLORS.forest};
          text-decoration: none;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .social-icon:hover {
          background: ${COLORS.forest};
          color: ${COLORS.cream};
        }
        .cta-card {
          background: ${COLORS.gold};
        }
        .cta-card .card-title {
          color: ${COLORS.ink};
        }
        .cta-text {
          font-size: 12px;
          color: rgba(15,42,32,0.75);
          margin: 0 0 14px;
          line-height: 1.5;
        }
        .cta-btn {
          display: inline-block;
          background: ${COLORS.ink};
          color: ${COLORS.cream};
          font-size: 13px;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 999px;
          text-decoration: none;
          transition: background 0.15s ease;
        }
        .cta-btn:hover {
          background: ${COLORS.forestMid};
        }
        .footer-bottom {
          text-align: center;
          margin-top: 24px;
          font-size: 11.5px;
          color: rgba(255,255,255,0.5);
        }

        @media (max-width: 760px) {
          .card-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 480px) {
          .card-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  )
}
