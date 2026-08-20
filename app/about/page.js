'use client'
import Link from 'next/link'
import { theme } from '@/lib/theme'

export default function AboutPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: `linear-gradient(rgba(23,10,9,0.35), rgba(23,10,9,0.55)), url(/marketing/about-us-bg.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          marginLeft: 'clamp(20px, 24vw, 420px)',
          marginRight: 'clamp(20px, 8vw, 120px)',
          paddingTop: 'clamp(220px, 34vh, 420px)',
          paddingBottom: '60px',
        }}
      >
        <Link
          href="/"
          style={{
            color: theme.brass,
            fontSize: '13px',
            fontWeight: '700',
            textDecoration: 'none',
            background: 'rgba(23,10,9,0.55)',
            padding: '6px 12px',
            borderRadius: '6px',
          }}
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
