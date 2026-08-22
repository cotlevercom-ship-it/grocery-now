'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, supabaseFetch } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import { sc } from '@/lib/memberTheme'
import AppSidebar from '@/components/AppSidebar'
import AppBottomNav from '@/components/AppBottomNav'

const BENEFITS = [
  { icon: '💬', title: 'Reply in message threads', body: 'Free accounts can send one message to start a conversation. Premium lets you keep replying, back and forth, with anyone.' },
  { icon: '📝', title: 'Comment on Feed posts', body: 'Join the conversation on the community feed — comment and reply on any post.' },
  { icon: '🔎', title: 'View full member profiles', body: 'See everyone\u2019s experience, education, projects, and contact details — not just their name and headline.' },
]

export default function PremiumPage() {
  const router = useRouter()
  const [userId, setUserId] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [premiumStatus, setPremiumStatus] = useState('none') // 'none' | 'pending' | 'active'
  const [bkashNumber, setBkashNumber] = useState('')
  const [txnNote, setTxnNote] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [error, setError] = useState('')

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
        const settings = await supabaseFetch(`app_settings?select=key,value&key=eq.bkash_payment_number`)
        setBkashNumber(settings?.[0]?.value || '')
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
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'clamp(20px,3vw,40px) clamp(16px,3vw,24px)' }}>

          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '38px', marginBottom: '8px' }}>⭐</div>
            <h1 style={{
              fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(24px,3vw,30px)',
              color: sc.text, letterSpacing: '-0.01em', marginBottom: '6px'
            }}>Premium Membership</h1>
            <p style={{ fontSize: '14px', color: sc.textSoft, maxWidth: '420px', margin: '0 auto' }}>
              One membership that unlocks real conversations on Cot Lever.
            </p>
          </div>

          {/* Status banner */}
          {premiumStatus === 'active' ? (
            <div style={{
              background: '#E9F5EE', border: '1px solid #BFE3CC', borderRadius: '12px',
              padding: '16px 18px', marginBottom: '24px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#2F7A50' }}>✓ You&apos;re a Premium Member</div>
              <div style={{ fontSize: '13px', color: sc.textSoft, marginTop: '4px' }}>All benefits below are active on your account.</div>
            </div>
          ) : premiumStatus === 'pending' ? (
            <div style={{
              background: sc.chipBg, borderRadius: '12px', padding: '16px 18px', marginBottom: '24px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: sc.text }}>Request submitted</div>
              <div style={{ fontSize: '13px', color: sc.textSoft, marginTop: '4px' }}>Your payment is under review — we&apos;ll activate Premium once it&apos;s confirmed.</div>
            </div>
          ) : null}

          {/* Benefits */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
            {BENEFITS.map(b => (
              <div key={b.title} style={{
                background: sc.cardBg, borderRadius: '12px', boxShadow: sc.shadow,
                padding: '16px 18px', display: 'flex', gap: '14px', alignItems: 'flex-start',
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px', background: sc.industryChipBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '19px', flexShrink: 0,
                }}>{b.icon}</div>
                <div>
                  <div style={{ fontSize: '14.5px', fontWeight: '700', color: sc.text, marginBottom: '2px' }}>{b.title}</div>
                  <div style={{ fontSize: '13px', color: sc.textSoft, lineHeight: '1.5' }}>{b.body}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Upgrade form — only when not already active/pending */}
          {premiumStatus === 'none' && (
            <div style={{ background: sc.cardBg, borderRadius: '12px', boxShadow: sc.shadow, padding: '20px' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: sc.text, marginBottom: '14px' }}>Upgrade to Premium</div>

              {bkashNumber && (
                <div style={{ padding: '12px 14px', background: sc.chipBg, borderRadius: '8px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '11.5px', color: sc.textSoft, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Send bKash payment to</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: sc.text, marginTop: '3px' }}>{bkashNumber}</div>
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
        </div>
      </div>

      <AppBottomNav active="premium" />

      <style jsx global>{`
        @media (max-width: 860px) {
          body { padding-bottom: 62px; }
        }
      `}</style>
    </div>
  )
}
