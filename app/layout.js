import './globals.css'
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SiteAuthGate from '@/components/SiteAuthGate'

// Self-hosted via Next.js font optimization instead of a render-blocking
// <link> to fonts.googleapis.com — removes the extra DNS/connect/fetch
// round-trips that were delaying First/Largest Contentful Paint.
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
})
const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-sans',
  display: 'swap',
})
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL('https://cotlever.com'),
  title: 'Cot Lever',
  description: 'Find a co-founder, partner, or share holder — list your business today.',
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'QJp1bORijOwPPOcGwBZha1t5o18CeiNHiUGexTwIf28',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body>
        <div className="app-container">
          <Navbar />
          <SiteAuthGate>{children}</SiteAuthGate>
          <Footer />
        </div>
      </body>
    </html>
  )
}
