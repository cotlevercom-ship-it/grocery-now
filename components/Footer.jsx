'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'
import Logo from './Logo'

export default function Footer() {
  const [infoPages, setInfoPages] = useState([])
  const [settings, setSettings] = useState({ facebook_url: '' })

  useEffect(() => {
    async function load() {
      try {
        const [pages, settingRows] = await Promise.all([
          supabaseFetch(`site_pages?select=*&is_active=eq.true&order=sort_order`),
          supabaseFetch(`app_settings?select=key,value&key=in.(facebook_url)`),
        ])
        setInfoPages((pages || []).filter(p => p.section === 'info'))
        const map = { facebook_url: '' }
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

  const navPages = [
    { label: 'How It Works', href: '/how-it-works' },
    aboutUs && { label: 'About Us', href: linkHref(aboutUs) },
    contactUs && { label: 'Contact Us', href: linkHref(contactUs) },
    terms && { label: 'Terms of Service', href: linkHref(terms) },
    privacy && { label: 'Privacy Policy', href: linkHref(privacy) },
  ].filter(Boolean)

  return (
    <footer className="site-footer">
      {/* signature: a lever — a fulcrum-balanced bar, the brand's own namesake mechanism */}
      <div className="lever-rule" aria-hidden="true">
        <span className="lever-bar" />
        <span className="lever-pivot" />
      </div>

      <div className="footer-inner">
        <div className="footer-brand">
          <Logo variant="light" size={19} />
          <p className="footer-tag">Where founders find their leverage.</p>
        </div>

        <nav className="footer-nav" aria-label="Footer">
          {navPages.map((p) => (
            <Link key={p.label} href={p.href} className="footer-link">{p.label}</Link>
          ))}
          <Link href="/help" className="footer-link">Help Center</Link>
        </nav>

        {settings.facebook_url && (
          <a
            href={settings.facebook_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Cot Lever on Facebook"
            className="fb-icon"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z"/>
            </svg>
          </a>
        )}
      </div>

      <div className="footer-bottom">
        <p>© 2026 Cot Lever. All rights reserved.</p>
      </div>

      <style jsx>{`
        .site-footer {
          background: #0a0a0a;
          margin-top: 28px;
          color: #e7e5df;
        }
        .lever-rule {
          position: relative;
          height: 1px;
          background: #232320;
          max-width: 1100px;
          margin: 0 auto;
        }
        .lever-bar {
          position: absolute;
          top: -1px;
          left: 8%;
          width: 32%;
          height: 3px;
          background: #f4a300;
          border-radius: 2px;
          transform-origin: right center;
          transform: rotate(-3deg);
        }
        .lever-pivot {
          position: absolute;
          top: -3px;
          left: calc(8% + 32% - 3.5px);
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #0a0a0a;
          border: 1.5px solid #f4a300;
        }
        .footer-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 26px 20px 18px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .footer-tag {
          margin: 0;
          font-size: 12px;
          font-style: italic;
          color: #7a786f;
        }
        .footer-nav {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }
        .footer-link {
          font-size: 13px;
          color: #b6b4ac;
          text-decoration: none;
          width: fit-content;
          line-height: 1.4;
          transition: color 0.15s ease;
        }
        .footer-link:hover {
          color: #f4a300;
        }
        .fb-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #1a1a17;
          color: #b6b4ac;
          flex-shrink: 0;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .fb-icon:hover {
          background: #f4a300;
          color: #0a0a0a;
        }
        .footer-bottom {
          border-top: 1px solid #1c1c19;
          padding: 12px 20px;
          text-align: center;
        }
        .footer-bottom p {
          margin: 0;
          font-size: 11px;
          letter-spacing: 0.02em;
          color: #5c5b53;
        }

        @media (min-width: 720px) {
          .footer-inner {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
            padding: 32px 24px 22px;
          }
          .footer-nav {
            flex-direction: row;
            gap: 28px;
          }
          .fb-icon {
            align-self: center;
          }
        }
      `}</style>
    </footer>
  )
}
