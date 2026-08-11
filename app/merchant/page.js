'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSession, supabaseFetch } from '@/lib/supabase'

const COLORS = {
  forest: '#0a0a0a',
  gold: '#f4a300',
  textMuted: '#6b7b74',
  line: '#e7e2d8',
}

export default function MerchantLandingPage() {
  return (
    <Suspense fallback={null}>
      <MerchantLandingInner />
    </Suspense>
  )
}

function MerchantLandingInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref') || ''
  const createHref = refCode ? `/merchant/create?ref=${encodeURIComponent(refCode)}` : '/merchant/create'

  const [checking, setChecking] = useState(true)
  const [ctaHref, setCtaHref] = useState(`/login?next=${encodeURIComponent(createHref)}`)
  const [ctaLabel, setCtaLabel] = useState('Get Started — It\'s Free')

  useEffect(() => {
    async function check() {
      const session = getSession()
      if (!session?.user) {
        setChecking(false)
        return
      }
      try {
        const shops = await supabaseFetch(`shops?select=id&owner_id=eq.${session.user.id}`)
        if (shops && shops.length > 0) {
          setCtaHref('/merchant/dashboard')
          setCtaLabel('Go to My Shop →')
        } else {
          setCtaHref(createHref)
          setCtaLabel('Add Your Shop — It\'s Free')
        }
      } catch (e) {
        console.error(e)
      }
      setChecking(false)
    }
    check()
  }, [createHref])

  return (
    <div className="merchant-landing">
      <div className="hero-bg" />
      <div className="hero-overlay" />

      <Link href="/" className="top-back">← Back to Home</Link>

      <div className="landing-content">
        <span className="eyebrow">Sell on Cot Lever</span>
        <h1>List Your Shop.<br />Buyers Message You Directly.</h1>
        <p>No commission, no checkout to manage — just list your products or services and buyers reach out on WhatsApp or email when they're interested.</p>

        <ul className="pitch-list">
          <li>
            <span className="pitch-icon">📦</span>
            <div>
              <strong>List products or services</strong>
              <span>Add as many listings as you want, completely free right now</span>
            </div>
          </li>
          <li>
            <span className="pitch-icon">💬</span>
            <div>
              <strong>Buyers contact you directly</strong>
              <span>WhatsApp or email — you handle the sale your way</span>
            </div>
          </li>
          <li>
            <span className="pitch-icon">📊</span>
            <div>
              <strong>See who's interested</strong>
              <span>Track inquiries and your most-contacted listings from your dashboard</span>
            </div>
          </li>
        </ul>

        <button
          type="button"
          disabled={checking}
          onClick={() => router.push(ctaHref)}
          className="cta-btn"
        >{checking ? 'Please wait...' : ctaLabel}</button>

        <div className="already-note">
          Already have a shop? Just <Link href="/login">log in</Link> — your shop lives on your regular Cot Lever account.
        </div>
      </div>

      <style jsx>{`
        .merchant-landing {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 90px 5vw 60px;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 30% 20%, #2a2a2a 0%, #000000 60%);
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 26px 26px;
          mask-image: radial-gradient(circle at 20% 30%, black, transparent 70%);
        }
        .top-back {
          position: absolute;
          top: 24px;
          left: 5vw;
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          z-index: 2;
        }
        .landing-content {
          position: relative;
          z-index: 1;
          max-width: 600px;
          color: white;
        }
        .eyebrow {
          display: inline-block;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: ${COLORS.gold};
          margin-bottom: 14px;
        }
        .landing-content h1 {
          font-size: clamp(30px, 4.6vw, 48px);
          font-weight: 800;
          line-height: 1.12;
          margin: 0 0 16px;
        }
        .landing-content p {
          font-size: 15px;
          line-height: 1.6;
          color: rgba(255,255,255,0.72);
          max-width: 460px;
          margin: 0 0 30px;
        }
        .pitch-list {
          list-style: none;
          margin: 0 0 34px;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .pitch-list li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .pitch-icon {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        .pitch-list strong {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: white;
          margin-bottom: 2px;
        }
        .pitch-list span {
          display: block;
          font-size: 12.5px;
          line-height: 1.5;
          color: rgba(255,255,255,0.6);
        }
        .cta-btn {
          background: ${COLORS.gold};
          color: #0a0a0a;
          border: none;
          border-radius: 10px;
          padding: 15px 28px;
          font-size: 15px;
          font-weight: 800;
        }
        .cta-btn:disabled {
          opacity: 0.6;
        }
        .already-note {
          margin-top: 18px;
          font-size: 13px;
          color: rgba(255,255,255,0.6);
        }
        .already-note a {
          color: ${COLORS.gold};
          font-weight: 700;
          text-decoration: none;
        }

        @media (max-width: 720px) {
          .merchant-landing { padding: 80px 20px 50px; }
        }
      `}</style>
    </div>
  )
}
