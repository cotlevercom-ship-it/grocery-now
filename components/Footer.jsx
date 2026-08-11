'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'
import Logo from './Logo'

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
  const findInfo = (slug) => infoPages.find(p => p.slug === slug)
  const aboutUs = findInfo('about-us')
  const contactUs = findInfo('contact-us')
  const privacy = findInfo('privacy-policy')
  const terms = findInfo('terms-and-conditions')
  const whatsappHref = settings.whatsapp_number
    ? `https://wa.me/88${settings.whatsapp_number.replace(/^0/, '')}`
    : ''

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo variant="dark" size={20} />
            <p className="tagline">List it. Buyers message you directly.</p>
          </div>

          <div className="footer-columns">
            <div className="footer-col">
              <span className="col-label">About</span>
              {aboutUs && <Link href={linkHref(aboutUs)} className="footer-link">About Us</Link>}
              {partnerPages.map(p => (
                <Link key={p.id} href={linkHref(p)} className="footer-link">{p.title}</Link>
              ))}
            </div>

            <div className="footer-col">
              <span className="col-label">Contact</span>
              {contactUs && <Link href={linkHref(contactUs)} className="footer-link">Contact Us</Link>}
              {settings.contact_email && (
                <a href={`mailto:${settings.contact_email}`} className="footer-link">{settings.contact_email}</a>
              )}
              {whatsappHref && (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="footer-link">WhatsApp</a>
              )}
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="footer-link">Facebook</a>
              )}
            </div>

            <div className="footer-col">
              <span className="col-label">Legal</span>
              <Link href="/help" className="footer-link">Help Center</Link>
              {privacy && <Link href={linkHref(privacy)} className="footer-link">Privacy Policy</Link>}
              {terms && <Link href={linkHref(terms)} className="footer-link">Terms of Service</Link>}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Cot Lever. All rights reserved.</p>
        </div>
      </div>

      <style jsx>{`
        .site-footer {
          background: #f7f6f3;
          margin-top: 20px;
        }
        .footer-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 20px 0;
        }
        .footer-top {
          display: flex;
          flex-direction: column;
          gap: 32px;
          padding-bottom: 28px;
        }
        .footer-brand {
          max-width: 320px;
        }
        .tagline {
          margin: 8px 0 0;
          font-size: 13px;
          color: #8a8a85;
          line-height: 1.5;
        }
        .footer-columns {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .col-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #a3a39d;
          margin-bottom: 2px;
        }
        .footer-link {
          font-size: 13.5px;
          color: #3a3a36;
          text-decoration: none;
          width: fit-content;
        }
        .footer-link:hover {
          color: #f4a300;
        }
        .footer-bottom {
          border-top: 1px solid #e4e2dc;
          padding: 16px 0;
          text-align: center;
        }
        .footer-bottom p {
          margin: 0;
          font-size: 12.5px;
          color: #a3a39d;
        }

        @media (min-width: 720px) {
          .footer-top {
            flex-direction: row;
            justify-content: space-between;
            gap: 40px;
          }
          .footer-columns {
            gap: 56px;
            flex-shrink: 0;
          }
        }
      `}</style>
    </footer>
  )
}
