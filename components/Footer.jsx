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
      background: theme.ink, color: '#EDEAE0', marginTop: '60px',
      padding: 'clamp(32px, 5vw, 56px) clamp(16px, 3vw, 56px) 24px',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px',
        paddingBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.12)',
      }}>
        <div>
          <div style={{ fontFamily: theme.fontDisplay, fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>
            Cot<span style={{ color: theme.brass }}>Lever</span>
          </div>
          <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'rgba(237,234,224,0.65)', maxWidth: '220px' }}>
            A business-matching directory for founders in Bangladesh.
          </p>
        </div>

        <div>
          <div style={{ fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(237,234,224,0.5)', marginBottom: '12px' }}>Platform</div>
          <FooterLink href="/">Browse Listings</FooterLink>
          <FooterLink href="/listings/new">List Your Business</FooterLink>
          <FooterLink href="/how-it-works">How It Works</FooterLink>
        </div>

        <div>
          <div style={{ fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(237,234,224,0.5)', marginBottom: '12px' }}>Resources</div>
          <FooterLink href="/resources">Articles</FooterLink>
          <FooterLink href="/about?tab=about-us">About Us</FooterLink>
          <FooterLink href="/about?tab=contact-us">Contact</FooterLink>
        </div>

        <div>
          <div style={{ fontFamily: theme.fontMono, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(237,234,224,0.5)', marginBottom: '12px' }}>Legal</div>
          <FooterLink href="/about?tab=privacy-policy">Privacy Policy</FooterLink>
          <FooterLink href="/about?tab=terms-and-conditions">Terms & Conditions</FooterLink>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px', margin: '0 auto', paddingTop: '20px',
        fontSize: '12px', color: 'rgba(237,234,224,0.45)',
      }}>
        © {year} Cot Lever · Meeting Ground, Uttara Model Town, Dhaka
      </div>
    </footer>
  )
}

function FooterLink({ href, children }) {
  return (
    <Link href={href} style={{
      display: 'block', fontSize: '13.5px', color: 'rgba(237,234,224,0.8)',
      marginBottom: '9px', textDecoration: 'none',
    }}>{children}</Link>
  )
}
