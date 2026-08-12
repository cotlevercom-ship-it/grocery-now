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
      background: theme.ink, color: '#EDEAE0', marginTop: '48px',
      padding: 'clamp(24px, 4vw, 48px) clamp(16px, 3vw, 56px) 20px',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '22px 20px',
        paddingBottom: '22px', borderBottom: '1px solid rgba(255,255,255,0.12)',
      }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ fontFamily: theme.fontDisplay, fontSize: '19px', fontWeight: '600', marginBottom: '6px' }}>
            Cot<span style={{ color: theme.brass }}>Lever</span>
          </div>
          <p style={{ fontSize: '12.5px', lineHeight: '1.5', color: 'rgba(237,234,224,0.65)', maxWidth: '280px' }}>
            A business-matching directory for founders in Bangladesh.
          </p>
        </div>

        <div>
          <div style={{ fontFamily: theme.fontMono, fontSize: '10.5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(237,234,224,0.5)', marginBottom: '9px' }}>Platform</div>
          <FooterLink href="/">Browse Listings</FooterLink>
          <FooterLink href="/listings/new">List Your Business</FooterLink>
          <FooterLink href="/how-it-works">How It Works</FooterLink>
        </div>

        <div>
          <div style={{ fontFamily: theme.fontMono, fontSize: '10.5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(237,234,224,0.5)', marginBottom: '9px' }}>Resources</div>
          <FooterLink href="/resources">Articles</FooterLink>
          <FooterLink href="/about?tab=about-us">About Us</FooterLink>
          <FooterLink href="/about?tab=contact-us">Contact</FooterLink>
        </div>

        <div>
          <div style={{ fontFamily: theme.fontMono, fontSize: '10.5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(237,234,224,0.5)', marginBottom: '9px' }}>Legal</div>
          <FooterLink href="/about?tab=privacy-policy">Privacy Policy</FooterLink>
          <FooterLink href="/about?tab=terms-and-conditions">Terms & Conditions</FooterLink>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px', margin: '0 auto', paddingTop: '14px',
        fontSize: '11.5px', color: 'rgba(237,234,224,0.45)',
      }}>
        © {year} Cot Lever · Meeting Ground, Uttara Model Town, Dhaka
      </div>
    </footer>
  )
}

function FooterLink({ href, children }) {
  return (
    <Link href={href} style={{
      display: 'block', fontSize: '13px', color: 'rgba(237,234,224,0.8)',
      marginBottom: '7px', textDecoration: 'none',
    }}>{children}</Link>
  )
}
