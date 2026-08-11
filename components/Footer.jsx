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

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-left">
            <Logo variant="dark" size={20} />
            <nav className="footer-link-row">
              {aboutUs && <Link href={linkHref(aboutUs)} className="footer-link">About Us</Link>}
              {contactUs && <Link href={linkHref(contactUs)} className="footer-link">Contact Us</Link>}
              {terms && <Link href={linkHref(terms)} className="footer-link">Terms of Service</Link>}
              {privacy && <Link href={linkHref(privacy)} className="footer-link">Privacy Policy</Link>}
            </nav>
          </div>

          <div className="footer-right">
            {settings.facebook_url && (
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Cot Lever on Facebook" className="fb-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z"/>
                </svg>
              </a>
            )}
            <Link href="/help" className="footer-link">Help Center</Link>
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
          padding: 32px 20px 0;
        }
        .footer-top {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding-bottom: 24px;
        }
        .footer-left {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .footer-link-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 18px;
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
        .footer-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .fb-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #ececea;
          color: #3a3a36;
          flex-shrink: 0;
        }
        .fb-icon:hover {
          background: #0a0a0a;
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
            align-items: center;
          }
        }
      `}</style>
    </footer>
  )
}
