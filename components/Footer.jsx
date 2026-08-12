'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { theme } from '@/lib/theme'

export default function Footer() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null

  const year = new Date().getFullYear()

  return (
    <footer style={{
      background: theme.ink, color: '#EDEAE0', marginTop: '40px',
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
            <FooterLink href="/">Browse Listings</FooterLink>
            <FooterLink href="/listings/new">List Your Business</FooterLink>
            <FooterLink href="/how-it-works">How It Works</FooterLink>
          </div>

          <div>
            <div style={{ fontFamily: theme.fontMono, fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(237,234,224,0.5)', marginBottom: '8px' }}>Resources</div>
            <FooterLink href="/resources">Articles</FooterLink>
            <FooterLink href="/about?tab=about-us">About Us</FooterLink>
            <FooterLink href="/about?tab=contact-us">Contact</FooterLink>
          </div>

          <div>
            <div style={{ fontFamily: theme.fontMono, fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(237,234,224,0.5)', marginBottom: '8px' }}>Legal</div>
            <FooterLink href="/about?tab=privacy-policy">Privacy Policy</FooterLink>
            <FooterLink href="/about?tab=terms-and-conditions">Terms & Conditions</FooterLink>
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
