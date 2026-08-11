import Link from 'next/link'

const STEPS = [
  {
    n: '01',
    title: 'Create your profile',
    desc: "Sign up and add a headline, what you bring to the table, what kind of co-founder you're looking for, and how people can reach you (WhatsApp or email). Takes a few minutes.",
  },
  {
    n: '02',
    title: 'Browse founders',
    desc: 'Search by name, skill, or location, and filter by stage or the role someone is looking for. Every active profile is visible to everyone — no approval needed to browse.',
  },
  {
    n: '03',
    title: 'Message anyone directly',
    desc: 'Found someone interesting? Tap "Message on WhatsApp" or "Email" right from their profile. It opens a chat or email pre-filled with an intro — no waiting on Cot Lever, no matching algorithm.',
  },
  {
    n: '04',
    title: 'Take it from there',
    desc: "Cot Lever doesn't manage the conversation, vet the fit, or take a cut. Once you've connected, it's between you and them — just like meeting someone at a startup event.",
  },
]

const FAQS = [
  {
    q: 'Is there a matching or approval process?',
    a: "No. Cot Lever is a directory, not a matchmaker. You can message anyone whose profile you find, and they can message you — there's no mutual-like step like some other platforms.",
  },
  {
    q: 'Is it free?',
    a: 'Yes, creating a profile and browsing is completely free right now.',
  },
  {
    q: 'Does Cot Lever vet founders or verify claims?',
    a: "Not yet — profiles are self-reported, so do your own diligence before committing to anything, the same way you would meeting someone through any network.",
  },
  {
    q: 'Can I edit or remove my profile later?',
    a: 'Yes, any time from your account — update your profile whenever your situation changes, or ask us to take it down.',
  },
]

export default function HowItWorksPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#eef0ee' }}>
      <div style={{ background: '#0a0a0a', padding: '48px 16px 40px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>← Back to Home</Link>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: '800', color: 'white', margin: '14px 0 12px' }}>
            How <span style={{ color: '#f4a300' }}>Cot Lever</span> Works
          </h1>
          <p style={{ fontSize: '14.5px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.6', maxWidth: '520px' }}>
            A direct way for founders to find each other — no middlemen, no matching gate, no fees.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 16px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginBottom: '48px' }}>
          {STEPS.map(s => (
            <div key={s.n} style={{ display: 'flex', gap: '18px' }}>
              <div style={{
                flexShrink: 0, width: '40px', height: '40px', borderRadius: '10px',
                background: '#0a0a0a', color: '#f4a300', fontWeight: '800', fontSize: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{s.n}</div>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#0a0a0a', margin: '0 0 6px' }}>{s.title}</h2>
                <p style={{ fontSize: '13.5px', color: '#555', lineHeight: '1.65', margin: 0 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          background: 'white', border: '1px solid #ececea', borderRadius: '14px',
          padding: '20px', marginBottom: '40px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#a06c00', background: '#fff3d6', display: 'inline-block', padding: '4px 12px', borderRadius: '999px', marginBottom: '10px' }}>
            No mutual-match gate
          </div>
          <p style={{ fontSize: '13.5px', color: '#333', lineHeight: '1.7', margin: 0 }}>
            Unlike some co-founder platforms, Cot Lever doesn't require both people to "like" each other before you can talk. If a profile looks like a fit, message them — that's it.
          </p>
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0a0a0a', marginBottom: '16px' }}>Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '48px' }}>
          {FAQS.map((f, i) => (
            <div key={i} style={{ background: 'white', border: '1px solid #ececea', borderRadius: '12px', padding: '16px 18px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0a0a0a', marginBottom: '6px' }}>{f.q}</div>
              <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>{f.a}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
          <Link href="/profile/create" style={{
            display: 'inline-block', background: '#f4a300', color: '#0a0a0a',
            padding: '13px 28px', borderRadius: '10px', fontSize: '14.5px', fontWeight: '800', textDecoration: 'none'
          }}>Create Your Profile</Link>
        </div>
      </div>
    </div>
  )
}
