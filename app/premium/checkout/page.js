'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getSession, supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import { sc } from '@/lib/memberTheme'
import AppSidebar from '@/components/AppSidebar'
import AppBottomNav from '@/components/AppBottomNav'

const PRO_FEATURES = ['Send & reply to messages', 'Comment on Feed posts', 'View full member profiles', 'Priority in search results']

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <Checkout />
    </Suspense>
  )
}

function Checkout() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialBilling = searchParams.get('billing') === 'monthly' ? 'monthly' : 'yearly'

  const [userId, setUserId] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [billing, setBilling] = useState(initialBilling)
  const [bkashNumber, setBkashNumber] = useState('')
  const [step, setStep] = useState('summary') // 'summary' | 'payment'
  const [txnNote, setTxnNote] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function init() {
      const session = getSession()
      if (!session?.user?.id) {
        router.replace('/login?next=/premium/checkout')
        return
      }
      setUserId(session.user.id)

      try {
        const rows = await supabaseFetch(`member_profiles?select=premium_status&user_id=eq.${session.user.id}`)
        const status = rows?.[0]?.premium_status || 'none'
        if (status !== 'none') {
          router.replace('/premium')
          return
        }
      } catch (e) { console.error(e) }

      try {
        const settings = await supabaseFetch(`app_settings?select=key,value&key=eq.bkash_payment_number`)
        setBkashNumber(settings?.[0]?.value || '')
      } catch (e) { console.error(e) }

      setLoaded(true)
    }
    init()
  }, [router])

  const proMonthly = 299
  const unitPrice = billing === 'yearly' ? Math.round(proMonthly * 0.8) : proMonthly
  const total = billing === 'yearly' ? unitPrice * 12 : unitPrice
  const originalTotal = billing === 'yearly' ? proMonthly * 12 : proMonthly
  const savings = originalTotal - total

  const handleRequest = async () => {
    setError('')
    setRequesting(true)
    try {
      await supabaseFetch('member_profiles', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify({
          user_id: userId,
          premium_status: 'pending',
          premium_requested_at: new Date().toISOString(),
          premium_transaction_note: txnNote.trim() || null,
        }),
      })
      setSubmitted(true)
    } catch (e) {
      console.error(e)
      setError('Could not submit your request, please try again.')
    }
    setRequesting(false)
  }

  if (!loaded) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: sc.bg }}>
        <AppSidebar active="premium" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: sc.textSoft, fontSize: '14px' }}>Loading…</div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: sc.bg }}>
        <AppSidebar active="premium" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{
            background: sc.cardBg, border: `1px solid ${sc.line}`, borderRadius: '16px',
            padding: '40px 32px', textAlign: 'center', maxWidth: '420px',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>✓</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: sc.text, marginBottom: '8px' }}>Request submitted</div>
            <div style={{ fontSize: '13.5px', color: sc.textSoft, lineHeight: '1.6', marginBottom: '22px' }}>
              Your payment is under review — we&apos;ll activate Pro on your account once it&apos;s confirmed.
            </div>
            <Link href="/premium" style={{
              display: 'inline-block', background: theme.brass, color: '#FFFFFF', padding: '11px 22px',
              borderRadius: '8px', fontSize: '13.5px', fontWeight: '700', textDecoration: 'none',
            }}>Back to Premium</Link>
          </div>
        </div>
        <AppBottomNav active="premium" />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: sc.bg }}>
      <AppSidebar active="premium" />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ maxWidth: '920px', margin: '0 auto', padding: 'clamp(20px,3.5vw,40px) clamp(16px,3vw,24px) 60px' }}>

          <Link href="/premium" style={{ fontSize: '13px', color: sc.textSoft, textDecoration: 'none', display: 'inline-block', marginBottom: '14px' }}>
            ← Back to plans
          </Link>
          <h1 style={{
            fontFamily: theme.fontDisplay, fontWeight: '700', fontSize: 'clamp(22px,3vw,30px)',
            color: sc.text, marginBottom: '28px',
          }}>Checkout</h1>

          <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '20px', alignItems: 'start' }}>

            {/* Left: plan card */}
            <div style={{ background: sc.cardBg, border: `1px solid ${sc.line}`, borderRadius: '14px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '10px', background: sc.industryChipBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '19px',
                }}>⭐</div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: sc.text }}>Pro Plan</div>
                  <div style={{ fontSize: '12.5px', color: sc.textSoft }}>For serious builders</div>
                </div>
              </div>

              <label style={{ fontSize: '12px', fontWeight: '700', color: sc.textSoft, display: 'block', marginBottom: '8px' }}>Billing period</label>
              <select
                value={billing}
                onChange={e => setBilling(e.target.value)}
                disabled={step === 'payment'}
                style={{
                  width: '100%', boxSizing: 'border-box', border: `1px solid ${sc.line}`, borderRadius: '9px',
                  padding: '11px 14px', fontSize: '14px', fontWeight: '600', color: sc.text, background: sc.bg,
                  marginBottom: '10px', cursor: step === 'payment' ? 'default' : 'pointer', opacity: step === 'payment' ? 0.7 : 1,
                }}
              >
                <option value="yearly">12 months (Save 20%)</option>
                <option value="monthly">1 month</option>
              </select>

              {billing === 'yearly' && (
                <div style={{ fontSize: '12px', color: sc.textFaint, marginBottom: '18px' }}>
                  Renews yearly at ৳{total.toLocaleString('en-US')}/yr. Cancel anytime.
                </div>
              )}
              {billing === 'monthly' && (
                <div style={{ fontSize: '12px', color: sc.textFaint, marginBottom: '18px' }}>
                  Renews monthly at ৳{total.toLocaleString('en-US')}/mo. Cancel anytime.
                </div>
              )}

              <div style={{ height: '1px', background: sc.line, margin: '4px 0 18px' }} />

              <div style={{ fontSize: '12px', fontWeight: '700', color: sc.textSoft, marginBottom: '12px' }}>WHAT&apos;S INCLUDED</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {PRO_FEATURES.map(f => (
                  <div key={f} style={{ display: 'flex', gap: '9px', alignItems: 'flex-start', fontSize: '13.5px', color: sc.text }}>
                    <span style={{ color: theme.brass, fontWeight: '700' }}>✓</span>{f}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: order summary */}
            <div style={{ background: sc.cardBg, border: `1px solid ${sc.line}`, borderRadius: '14px', padding: '24px', position: 'sticky', top: '20px' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: sc.text, marginBottom: '18px' }}>Order summary</div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: sc.text, marginBottom: '8px' }}>
                <span>Pro plan — {billing === 'yearly' ? '12-month period' : '1-month period'}</span>
                <span style={{ textAlign: 'right' }}>
                  {savings > 0 && (
                    <span style={{ color: sc.textFaint, textDecoration: 'line-through', marginRight: '6px' }}>৳{originalTotal.toLocaleString('en-US')}</span>
                  )}
                  <span style={{ fontWeight: '700' }}>৳{total.toLocaleString('en-US')}</span>
                </span>
              </div>

              {savings > 0 && (
                <div style={{
                  display: 'inline-block', background: '#E9F5EE', color: '#2F7A50', fontSize: '11.5px', fontWeight: '700',
                  padding: '4px 10px', borderRadius: '999px', marginBottom: '14px',
                }}>Save ৳{savings.toLocaleString('en-US')}</div>
              )}

              <div style={{ height: '1px', background: sc.line, margin: '10px 0 14px' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', color: sc.text, marginBottom: '22px' }}>
                <span>Total</span>
                <span>৳{total.toLocaleString('en-US')}</span>
              </div>

              {step === 'summary' ? (
                <button
                  type="button"
                  onClick={() => setStep('payment')}
                  style={{
                    width: '100%', padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
                    background: theme.brass, border: 'none', color: '#FFFFFF', cursor: 'pointer',
                  }}
                >Continue</button>
              ) : (
                <>
                  {bkashNumber && (
                    <div style={{ padding: '12px 14px', background: sc.chipBg, borderRadius: '8px', marginBottom: '14px' }}>
                      <div style={{ fontSize: '11.5px', color: sc.textSoft, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Pay via bKash Merchant Payment to</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: sc.text, marginTop: '3px' }}>{bkashNumber}</div>
                      <div style={{ fontSize: '11.5px', color: sc.textSoft, marginTop: '4px' }}>Use &quot;Merchant Payment&quot;, not &quot;Send Money&quot; · Send exactly ৳{total.toLocaleString('en-US')}</div>
                    </div>
                  )}

                  <label style={{ fontSize: '12px', color: sc.textSoft, display: 'block', marginBottom: '6px' }}>bKash Transaction ID (optional)</label>
                  <input
                    type="text" value={txnNote} onChange={e => setTxnNote(e.target.value)} placeholder="e.g. 8N7A6XYZ12"
                    style={{
                      width: '100%', boxSizing: 'border-box', border: `1px solid ${sc.line}`, borderRadius: '8px',
                      padding: '11px 14px', fontSize: '14px', color: sc.text, background: sc.bg, marginBottom: '14px',
                    }}
                  />

                  <button
                    type="button"
                    onClick={handleRequest}
                    disabled={requesting}
                    style={{
                      display: 'block', width: '100%', background: requesting ? sc.line : theme.brass,
                      color: '#FFFFFF', padding: '13px', borderRadius: '8px', fontSize: '14px', fontWeight: '700',
                      border: 'none', cursor: requesting ? 'default' : 'pointer', marginBottom: '10px',
                    }}
                  >{requesting ? 'Submitting...' : "I've Paid — Request Activation"}</button>

                  <button
                    type="button"
                    onClick={() => setStep('summary')}
                    style={{
                      display: 'block', width: '100%', background: 'transparent', border: 'none',
                      color: sc.textSoft, fontSize: '12.5px', cursor: 'pointer', textDecoration: 'underline',
                    }}
                  >← Back to order summary</button>

                  {error && (
                    <div style={{ marginTop: '10px', padding: '9px 12px', background: '#FBEAE8', color: '#C43C2C', borderRadius: '4px', fontSize: '12.5px' }}>{error}</div>
                  )}
                </>
              )}

              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '11.5px', color: sc.textFaint }}>
                🔒 Secure payments. Cancel anytime.
              </div>
            </div>
          </div>
        </div>
      </div>

      <AppBottomNav active="premium" />

      <style jsx global>{`
        @media (max-width: 860px) {
          body { padding-bottom: 62px; }
        }
        @media (max-width: 760px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
