'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import { sc } from '@/lib/memberTheme'
import AppSidebar from '@/components/AppSidebar'
import AppBottomNav from '@/components/AppBottomNav'

const FREE_FEATURES = ['Create your profile', 'Browse people', 'Send one message to start a conversation', 'Post & like on the Feed']
const PRO_FEATURES = ['All Free features', 'Unlimited message replies', 'Comment on Feed posts', 'View full member profiles', 'Priority in search results']
const TEAM_FEATURES = ['All Pro features', 'Team collaboration tools', 'Invite team members', 'Admin dashboard', 'Priority support']

const BOTTOM_BENEFITS = [
  { icon: '👥', title: 'Find the Right People', body: 'Connect with trusted builders who match your vision.' },
  { icon: '💬', title: 'Meaningful Conversations', body: 'Chat, share ideas, and build real connections.' },
  { icon: '🛡️', title: 'Safe & Secure', body: 'Your data is protected and your privacy is our priority.' },
  { icon: '🚀', title: 'Build What Matters', body: 'Turn ideas into reality with the right co-founder.' },
]

export default function PremiumPage() {
  const router = useRouter()
  const [userId, setUserId] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [premiumStatus, setPremiumStatus] = useState('none') // 'none' | 'pending' | 'active'
  const [bkashNumber, setBkashNumber] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [txnNote, setTxnNote] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [error, setError] = useState('')
  const [billing, setBilling] = useState('yearly') // 'monthly' | 'yearly'
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    async function init() {
      const session = getSession()
      if (!session?.user?.id) {
        router.replace('/login?next=/premium')
        return
      }
      setUserId(session.user.id)

      try {
        const rows = await supabaseFetch(`member_profiles?select=premium_status&user_id=eq.${session.user.id}`)
        setPremiumStatus(rows?.[0]?.premium_status || 'none')
      } catch (e) { console.error(e) }

      try {
        const settings = await supabaseFetch(`app_settings?select=key,value&key=in.(bkash_payment_number,contact_email)`)
        const map = {}
        ;(settings || []).forEach(r => { map[r.key] = r.value })
        setBkashNumber(map.bkash_payment_number || '')
        setContactEmail(map.contact_email || '')
      } catch (e) { console.error(e) }

      setLoaded(true)
    }
    init()
  }, [router])

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
      setPremiumStatus('pending')
    } catch (e) {
      console.error(e)
      setError('Could not submit your request, please try again.')
    }
    setRequesting(false)
  }

  const proMonthly = 299
  const proPrice = billing === 'yearly' ? Math.round(proMonthly * 0.8) : proMonthly
  const payAmount = billing === 'yearly' ? proPrice * 12 : proPrice

  if (!loaded) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: sc.bg }}>
        <AppSidebar active="premium" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: sc.textSoft, fontSize: '14px' }}>Loading…</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: sc.bg }}>
      <AppSidebar active="premium" />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,3vw,24px) 60px' }}>

          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '999px',
              background: sc.industryChipBg, color: theme.brass, fontSize: '12.5px', fontWeight: '700', marginBottom: '18px',
            }}>✦ Unlock the full power of Cot Lever</div>
            <h1 style={{
              fontFamily: theme.fontDisplay, fontWeight: '700', fontSize: 'clamp(28px,4.2vw,42px)',
              color: sc.text, letterSpacing: '-0.01em', lineHeight: '1.15', marginBottom: '10px',
            }}>Choose the plan that<br />helps you build <span style={{ color: theme.brass }}>together.</span></h1>
            <p style={{ fontSize: '15px', color: sc.textSoft, maxWidth: '460px', margin: '0 auto' }}>
              Connect with the right people, start meaningful conversations, and build ideas that matter.
            </p>

            {/* Billing toggle */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginTop: '26px' }}>
              <div style={{ display: 'inline-flex', background: sc.cardBg, border: `1px solid ${sc.line}`, borderRadius: '999px', padding: '4px', boxShadow: sc.shadow }}>
                <button type="button" onClick={() => setBilling('monthly')} style={{
                  border: 'none', borderRadius: '999px', padding: '9px 20px', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer',
                  background: billing === 'monthly' ? sc.text : 'transparent', color: billing === 'monthly' ? '#FFFFFF' : sc.textSoft,
                }}>Monthly</button>
                <button type="button" onClick={() => setBilling('yearly')} style={{
                  border: 'none', borderRadius: '999px', padding: '9px 20px', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer',
                  background: billing === 'yearly' ? theme.brass : 'transparent', color: billing === 'yearly' ? '#FFFFFF' : sc.textSoft,
                }}>Yearly</button>
              </div>
              {billing === 'yearly' && (
                <span style={{ fontSize: '12.5px', fontWeight: '700', color: theme.brass }}>Save 20%</span>
              )}
            </div>
          </div>

          {/* Status banner */}
          {premiumStatus === 'active' ? (
            <div style={{
              background: '#E9F5EE', border: '1px solid #BFE3CC', borderRadius: '12px',
              padding: '16px 18px', marginBottom: '24px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#2F7A50' }}>✓ You&apos;re a Pro Member</div>
              <div style={{ fontSize: '13px', color: sc.textSoft, marginTop: '4px' }}>All Pro benefits are active on your account.</div>
            </div>
          ) : premiumStatus === 'pending' ? (
            <div style={{
              background: sc.chipBg, borderRadius: '12px', padding: '16px 18px', marginBottom: '24px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: sc.text }}>Request submitted</div>
              <div style={{ fontSize: '13px', color: sc.textSoft, marginTop: '4px' }}>Your payment is under review — we&apos;ll activate Pro once it&apos;s confirmed.</div>
            </div>
          ) : null}

          {/* Pricing cards */}
          <div className="plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', alignItems: 'stretch' }}>

            {/* Free */}
            <div style={{ background: sc.cardBg, border: `1px solid ${sc.line}`, borderRadius: '16px', padding: '26px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '19px', fontWeight: '700', color: sc.text, marginBottom: '3px' }}>Free</div>
              <div style={{ fontSize: '13px', color: sc.textSoft, marginBottom: '20px' }}>For getting started</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '2px' }}>
                <span style={{ fontSize: '20px', fontWeight: '700', color: sc.text }}>৳</span>
                <span style={{ fontSize: '38px', fontWeight: '800', color: sc.text, letterSpacing: '-0.02em' }}>0</span>
                <span style={{ fontSize: '13.5px', color: sc.textSoft }}>/ month</span>
              </div>
              <div style={{ height: '18px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', marginBottom: '24px', flex: 1 }}>
                {FREE_FEATURES.map(f => (
                  <div key={f} style={{ display: 'flex', gap: '9px', alignItems: 'flex-start', fontSize: '13.5px', color: sc.text }}>
                    <span style={{ color: theme.brass, fontWeight: '700' }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <button type="button" disabled style={{
                width: '100%', padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
                background: 'transparent', border: `1.5px solid ${sc.line}`, color: sc.textSoft, cursor: 'default',
              }}>Your Current Plan</button>
            </div>

            {/* Pro */}
            <div style={{ background: sc.cardBg, border: `2px solid ${theme.brass}`, borderRadius: '16px', padding: '26px', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: sc.shadowHover }}>
              <div style={{
                position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
                background: theme.brass, color: '#FFFFFF', fontSize: '11.5px', fontWeight: '700',
                padding: '5px 14px', borderRadius: '999px', whiteSpace: 'nowrap',
              }}>Most Popular</div>
              <div style={{ fontSize: '19px', fontWeight: '700', color: sc.text, marginBottom: '3px' }}>Pro</div>
              <div style={{ fontSize: '13px', color: sc.textSoft, marginBottom: '20px' }}>For serious builders</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '2px' }}>
                <span style={{ fontSize: '20px', fontWeight: '700', color: theme.brass }}>৳</span>
                <span style={{ fontSize: '38px', fontWeight: '800', color: theme.brass, letterSpacing: '-0.02em' }}>{proPrice}</span>
                <span style={{ fontSize: '13.5px', color: sc.textSoft }}>/ month</span>
              </div>
              <div style={{ fontSize: '12px', color: sc.textFaint, marginBottom: '16px' }}>
                {billing === 'yearly' ? `৳${payAmount.toLocaleString('en-US')} billed once a year` : 'Billed monthly'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', marginBottom: '24px', flex: 1 }}>
                {PRO_FEATURES.map(f => (
                  <div key={f} style={{ display: 'flex', gap: '9px', alignItems: 'flex-start', fontSize: '13.5px', color: sc.text }}>
                    <span style={{ color: theme.brass, fontWeight: '700' }}>✓</span>{f}
                  </div>
                ))}
              </div>
              {premiumStatus === 'active' ? (
                <button type="button" disabled style={{
                  width: '100%', padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
                  background: '#E9F5EE', border: 'none', color: '#2F7A50', cursor: 'default',
                }}>✓ Active</button>
              ) : premiumStatus === 'pending' ? (
                <button type="button" disabled style={{
                  width: '100%', padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
                  background: sc.chipBg, border: 'none', color: sc.textSoft, cursor: 'default',
                }}>Under review</button>
              ) : (
                <button type="button" onClick={() => setShowForm(true)} style={{
                  width: '100%', padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
                  background: theme.brass, border: 'none', color: '#FFFFFF', cursor: 'pointer',
                }}>Choose Pro</button>
              )}
            </div>

            {/* Team */}
            <div style={{ background: sc.cardBg, border: `1px solid ${sc.line}`, borderRadius: '16px', padding: '26px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '19px', fontWeight: '700', color: sc.text, marginBottom: '3px' }}>Team</div>
              <div style={{ fontSize: '13px', color: sc.textSoft, marginBottom: '20px' }}>For teams & organizations</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '2px' }}>
                <span style={{ fontSize: '20px', fontWeight: '700', color: sc.text }}>Let&apos;s</span>
                <span style={{ fontSize: '28px', fontWeight: '800', color: sc.text, letterSpacing: '-0.02em' }}>Talk</span>
              </div>
              <div style={{ fontSize: '12px', color: sc.textFaint, marginBottom: '16px' }}>Custom pricing</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', marginBottom: '24px', flex: 1 }}>
                {TEAM_FEATURES.map(f => (
                  <div key={f} style={{ display: 'flex', gap: '9px', alignItems: 'flex-start', fontSize: '13.5px', color: sc.text }}>
                    <span style={{ color: theme.brass, fontWeight: '700' }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <a href={contactEmail ? `mailto:${contactEmail}?subject=Cot Lever Team plan` : '/contact'} style={{
                display: 'block', width: '100%', boxSizing: 'border-box', padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
                background: 'transparent', border: `1.5px solid ${sc.line}`, color: sc.text, textAlign: 'center', textDecoration: 'none',
              }}>Contact Us</a>
            </div>
          </div>

          {/* Payment form */}
          {showForm && premiumStatus === 'none' && (
            <div style={{ background: sc.cardBg, borderRadius: '12px', boxShadow: sc.shadow, padding: '22px', marginTop: '28px', maxWidth: '460px', marginLeft: 'auto', marginRight: 'auto' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: sc.text, marginBottom: '14px' }}>Pay for Pro</div>

              <div style={{ padding: '12px 14px', background: sc.chipBg, borderRadius: '8px', marginBottom: '10px' }}>
                <div style={{ fontSize: '11.5px', color: sc.textSoft, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Amount to pay ({billing === 'yearly' ? 'yearly' : 'monthly'})</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: theme.brass, marginTop: '3px' }}>৳{payAmount.toLocaleString('en-US')}</div>
              </div>

              {bkashNumber && (
                <div style={{ padding: '12px 14px', background: sc.chipBg, borderRadius: '8px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '11.5px', color: sc.textSoft, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Pay via bKash Merchant Payment to</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: sc.text, marginTop: '3px' }}>{bkashNumber}</div>
                  <div style={{ fontSize: '11.5px', color: sc.textSoft, marginTop: '4px' }}>Use &quot;Merchant Payment&quot;, not &quot;Send Money&quot;</div>
                </div>
              )}

              <label style={{ fontSize: '12px', color: sc.textSoft, display: 'block', marginBottom: '6px' }}>bKash Transaction ID (optional)</label>
              <input
                type="text" value={txnNote} onChange={e => setTxnNote(e.target.value)} placeholder="e.g. 8N7A6XYZ12"
                style={{
                  width: '100%', boxSizing: 'border-box', border: `1px solid ${sc.line}`, borderRadius: '8px',
                  padding: '11px 14px', fontSize: '14px', color: sc.text, background: sc.bg, marginBottom: '16px',
                }}
              />

              <button
                type="button"
                onClick={handleRequest}
                disabled={requesting}
                style={{
                  display: 'block', width: '100%', background: requesting ? sc.line : theme.brass,
                  color: '#FFFFFF', padding: '13px', borderRadius: '8px', fontSize: '14px', fontWeight: '700',
                  border: 'none', cursor: requesting ? 'default' : 'pointer',
                }}
              >{requesting ? 'Submitting...' : "I've Paid — Request Activation"}</button>

              {error && (
                <div style={{ marginTop: '10px', padding: '9px 12px', background: '#FBEAE8', color: '#C43C2C', borderRadius: '4px', fontSize: '12.5px' }}>{error}</div>
              )}
            </div>
          )}

          {/* Bottom benefits row */}
          <div className="benefits-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginTop: '52px',
            background: sc.cardBg, border: `1px solid ${sc.line}`, borderRadius: '16px', padding: '30px 24px',
          }}>
            {BOTTOM_BENEFITS.map(b => (
              <div key={b.title} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '46px', height: '46px', borderRadius: '50%', background: sc.industryChipBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', margin: '0 auto 12px',
                }}>{b.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: sc.text, marginBottom: '5px' }}>{b.title}</div>
                <div style={{ fontSize: '12.5px', color: sc.textSoft, lineHeight: '1.5' }}>{b.body}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '12.5px', color: sc.textFaint }}>
            🔒 Secure payments. Cancel anytime.<br />Your subscription helps us keep Cot Lever growing.
          </div>
        </div>
      </div>

      <AppBottomNav active="premium" />

      <style jsx global>{`
        @media (max-width: 860px) {
          body { padding-bottom: 62px; }
        }
        @media (max-width: 760px) {
          .plans-grid { grid-template-columns: 1fr !important; }
          .benefits-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}
