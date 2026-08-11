'use client'
import Link from 'next/link'

function normalizeWhatsApp(number) {
  if (!number) return null
  let digits = number.replace(/[^\d]/g, '')
  if (digits.startsWith('0')) digits = '880' + digits.slice(1)
  if (!digits.startsWith('880') && digits.length <= 11) digits = '880' + digits
  return digits
}

const STAGE_LABELS = {
  idea: 'Just an idea',
  mvp: 'Building an MVP',
  'early-revenue': 'Early revenue',
  scaling: 'Scaling',
}

export default function FounderDetailClient({ profile: p }) {
  const contactMessage = `Hi ${p.full_name}, I saw your profile on Cot Lever — I'd love to connect${p.looking_for?.length ? ' about ' + p.looking_for[0].toLowerCase() : ''}.`
  const waNumber = normalizeWhatsApp(p.whatsapp_number)
  const waHref = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(contactMessage)}` : null
  const emailHref = p.contact_email
    ? `mailto:${p.contact_email}?subject=${encodeURIComponent(`Let's connect — Cot Lever`)}&body=${encodeURIComponent(contactMessage)}`
    : null
  const hasContact = !!(waHref || emailHref)

  return (
    <div style={{ minHeight: '100vh', background: '#eef0ee', paddingBottom: '90px' }}>
      <div style={{ background: '#0a0a0a', padding: '16px' }}>
        <Link href="/browse" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', textDecoration: 'none' }}>← Back to Browse</Link>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '28px 16px' }}>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #ececea', padding: '28px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', background: '#f6f6f4',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px',
              overflow: 'hidden', flexShrink: 0
            }}>
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image_url} alt={p.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : '👤'}
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0a0a0a', margin: 0 }}>{p.full_name}</h1>
              {p.location && <div style={{ fontSize: '13px', color: '#888', marginTop: '3px' }}>{p.location}</div>}
            </div>
          </div>

          <div style={{ fontSize: '15px', color: '#333', lineHeight: '1.6', marginBottom: '18px', fontWeight: '600' }}>
            {p.headline}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {p.stage && (
              <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#2d6a4f', background: '#e7f3ec', padding: '5px 12px', borderRadius: '999px' }}>
                {STAGE_LABELS[p.stage] || p.stage}
              </span>
            )}
            {p.commitment && (
              <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#0a0a0a', background: '#f0f0ee', padding: '5px 12px', borderRadius: '999px' }}>
                {p.commitment === 'full-time' ? 'Full-time' : 'Part-time'}
              </span>
            )}
          </div>

          {p.bio && (
            <div style={{ marginBottom: '22px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#a3a39d', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>About</div>
              <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.7', whiteSpace: 'pre-wrap', margin: 0 }}>{p.bio}</p>
            </div>
          )}

          {(p.skills || []).length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#a3a39d', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Brings to the table</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {p.skills.map((s, i) => (
                  <span key={i} style={{ fontSize: '12px', fontWeight: '600', color: '#0a0a0a', background: '#f0f0ee', padding: '5px 11px', borderRadius: '7px' }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {(p.looking_for || []).length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#a3a39d', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Looking for</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {p.looking_for.map((s, i) => (
                  <span key={i} style={{ fontSize: '12px', fontWeight: '600', color: '#a06c00', background: '#fff3d6', padding: '5px 11px', borderRadius: '7px' }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {(p.industries || []).length > 0 && (
            <div style={{ marginBottom: '22px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#a3a39d', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Industries</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {p.industries.map((s, i) => (
                  <span key={i} style={{ fontSize: '12px', color: '#555' }}>{s}{i < p.industries.length - 1 ? ' · ' : ''}</span>
                ))}
              </div>
            </div>
          )}

          {(p.linkedin_url || p.portfolio_url) && (
            <div style={{ display: 'flex', gap: '14px', marginBottom: '8px' }}>
              {p.linkedin_url && (
                <a href={p.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#0a66c2', fontWeight: '600', textDecoration: 'none' }}>LinkedIn ↗</a>
              )}
              {p.portfolio_url && (
                <a href={p.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#0a0a0a', fontWeight: '600', textDecoration: 'none' }}>Portfolio ↗</a>
              )}
            </div>
          )}
        </div>

        {/* Contact (desktop inline) */}
        <div className="desktop-contact" style={{ marginTop: '18px' }}>
          {hasContact ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              {waHref && (
                <a href={waHref} target="_blank" rel="noopener noreferrer" style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: '#25D366', color: 'white',
                  padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', textDecoration: 'none'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 6.32A8.86 8.86 0 0 0 12.05 4a8.9 8.9 0 0 0-7.7 13.35L3 20.6l3.35-1.32a8.9 8.9 0 0 0 5.7 2.05h.01a8.9 8.9 0 0 0 8.9-8.9 8.86 8.86 0 0 0-3.36-6.11ZM12.05 19.9h-.01a7.4 7.4 0 0 1-3.77-1.03l-.27-.16-2.8 1.1.94-2.73-.18-.28a7.4 7.4 0 1 1 6.1 3.1Zm4.06-5.54c-.22-.11-1.3-.64-1.5-.72-.2-.07-.35-.11-.5.11s-.58.72-.71.87-.26.16-.48.05a6.06 6.06 0 0 1-1.78-1.1 6.66 6.66 0 0 1-1.23-1.53c-.13-.22 0-.34.1-.45.1-.1.22-.26.33-.39.11-.13.14-.22.22-.37a.4.4 0 0 1-.02-.39c-.05-.11-.5-1.2-.68-1.64-.18-.43-.36-.37-.5-.38h-.43a.82.82 0 0 0-.6.28 2.5 2.5 0 0 0-.77 1.85c0 1.09.79 2.14.9 2.29.11.15 1.55 2.37 3.76 3.32a12.6 12.6 0 0 0 1.26.47c.53.17 1.01.14 1.39.09.42-.06 1.3-.53 1.48-1.05.18-.51.18-.95.13-1.05-.05-.1-.2-.16-.42-.27Z"/></svg>
                  Message on WhatsApp
                </a>
              )}
              {emailHref && (
                <a href={emailHref} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: 'white', color: '#0a0a0a', border: '2px solid #0a0a0a',
                  padding: '11px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', textDecoration: 'none'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  Email
                </a>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: '#999', textAlign: 'center' }}>This founder hasn't added contact details yet.</div>
          )}
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="mobile-contact-bar" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'white', borderTop: '1px solid #eee',
        padding: '10px 16px calc(10px + env(safe-area-inset-bottom))',
        display: 'none', alignItems: 'center', gap: '10px'
      }}>
        {hasContact ? (
          <>
            {waHref && (
              <a href={waHref} target="_blank" rel="noopener noreferrer" style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                background: '#25D366', color: 'white',
                padding: '12px', borderRadius: '8px', fontSize: '13.5px', fontWeight: '700', textDecoration: 'none'
              }}>WhatsApp</a>
            )}
            {emailHref && (
              <a href={emailHref} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                background: 'white', color: '#0a0a0a', border: '2px solid #0a0a0a',
                padding: '11px', borderRadius: '8px', fontSize: '13.5px', fontWeight: '700', textDecoration: 'none'
              }}>Email</a>
            )}
          </>
        ) : (
          <div style={{ flex: 1, textAlign: 'center', fontSize: '13px', color: '#999', padding: '10px 0' }}>
            This founder hasn't added contact details yet.
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 640px) {
          .desktop-contact { display: none; }
          .mobile-contact-bar { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
