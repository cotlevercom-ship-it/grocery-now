'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'

export default function Footer() {
  const pathname = usePathname()
  const [facebookUrl, setFacebookUrl] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const rows = await supabaseFetch('app_settings?select=key,value&key=eq.facebook_url')
        setFacebookUrl(rows?.[0]?.value || '')
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [])

  if (pathname?.startsWith('/admin')) return null

  const year = new Date().getFullYear()

  return (
    <footer style={{
      background: theme.surface, color: '#EDEAE0', marginTop: '40px',
      padding: 'clamp(20px, 4vw, 44px) clamp(16px, 3vw, 56px) 18px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontFamily: theme.fontDisplay, fontSize: '18px', fontWeight: '600', marginBottom: '5px' }}>
            Cot<span style={{ color: theme.brass }}>Lever</span>
          </div>
          <p style={{ fontSize: '12px', lineHeight: '1.45', color: 'rgba(237,234,224,0.6)', maxWidth: '320px' }}>
            A business-matching directory for founders in Bangladesh.
          </p>
        </div>

        <div className="footer-links-grid">
          <div>
            <div style={{ fontFamily: theme.fontMono, fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(237,234,224,0.5)', marginBottom: '8px' }}>Platform</div>
            <FooterLink href="/about">About Us</FooterLink>
            <FooterLink href="/contact">Contact Us</FooterLink>
            {facebookUrl && (
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook" style={{
                display: 'inline-flex', marginTop: '4px', color: 'rgba(237,234,224,0.8)',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
                  <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.23 10.44 22v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22C18.34 21.23 22 17.08 22 12.06Z" />
                </svg>
              </a>
            )}
          </div>

          <div>
            <div style={{ fontFamily: theme.fontMono, fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(237,234,224,0.5)', marginBottom: '8px' }}>Legal</div>
            <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
            <FooterLink href="/terms">Terms & Conditions</FooterLink>
            <FooterLink href="/payment-policy">Payment Policy</FooterLink>
            <FooterLink href="/user-agreement">User Agreement</FooterLink>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px', margin: '0 auto', paddingTop: '12px',
        fontSize: '11px', color: 'rgba(237,234,224,0.45)',
      }}>
        © {year} Cot Lever · Meeting Ground, Uttara Model Town, Dhaka
      </div>
    </footer>
  )
}

function FooterLink({ href, children }) {
  return (
    <Link href={href} style={{
      display: 'block', fontSize: '12.5px', color: 'rgba(237,234,224,0.8)',
      marginBottom: '6px', textDecoration: 'none',
    }}>{children}</Link>
  )
}
