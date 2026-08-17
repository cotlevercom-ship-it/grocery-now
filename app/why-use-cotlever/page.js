'use client'
import Link from 'next/link'
import { theme } from '@/lib/theme'
import styles from './whyUse.module.css'

const REASONS = [
  {
    n: '01',
    heading: <>Built for founders in <em>Bangladesh</em></>,
    body: 'Finding a co-founder, partner, or share holder here usually means asking around your own circle. Cot Lever gives you a directory built specifically for that search.',
  },
  {
    n: '02',
    heading: <>Your profile goes live <em>instantly</em></>,
    body: 'No waiting on approval. As soon as you fill in your profile, it appears in the directory — real people, ready to be found right away.',
  },
  {
    n: '03',
    heading: <>Made for co-founder <em>matching</em></>,
    body: 'Every profile tells others what you bring and what you\u2019re looking for — skills, experience, and commitment level — so the right match is easy to spot.',
  },
  {
    n: '04',
    heading: <>You stay in <em>control</em></>,
    body: 'Interested people contact you directly with the details you provide. No middleman, no algorithm deciding who you talk to.',
  },
]

export default function WhyUseCotleverPage() {
  const total = REASONS.length + 1

  return (
    <div className={styles.book}>
      {REASONS.map((r, i) => (
        <section className={styles.bookPage} key={r.n}>
          <div className={styles.pageTop}>
            <span className={styles.brand}>COT LEVER</span>
            <span className={styles.pageNumber}>{r.n} / 0{total}</span>
          </div>

          <div className={styles.pageLabel}>Why Cot Lever</div>

          <div className={styles.pageContent}>
            <div className={styles.pageIndex}>{r.n}</div>
            <div className={styles.pageCopy}>
              <h2>{r.heading}</h2>
              <p>{r.body}</p>
            </div>
          </div>

          <div className={styles.pageBottom}>
            <span>WHY USE COT LEVER</span>
            <span>SCROLL TO CONTINUE</span>
          </div>
        </section>
      ))}

      {/* final page — CTA */}
      <section className={styles.bookPage}>
        <div className={styles.pageTop}>
          <span className={styles.brand}>COT LEVER</span>
          <span className={styles.pageNumber}>0{total} / 0{total}</span>
        </div>

        <div className={styles.pageLabel}>Get Started</div>

        <div className={styles.pageContent}>
          <div className={styles.pageIndex}>0{total}</div>
          <div className={styles.pageCopy}>
            <h2>Ready to get <em>started</em>?</h2>
            <p>Create your profile and let the right people find you — see the full five-step process first if you like.</p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '36px', flexWrap: 'wrap' }}>
              <Link href="/members/new" style={{
                display: 'inline-block', background: theme.brass, color: 'white',
                borderRadius: '8px', padding: '14px 26px', fontSize: '14px', fontWeight: '600',
                textDecoration: 'none', whiteSpace: 'nowrap',
              }}>Create Your Profile</Link>
              <Link href="/how-it-works" style={{
                display: 'inline-block', background: 'transparent', color: theme.ink,
                border: `1px solid ${theme.line}`, borderRadius: '8px', padding: '14px 26px',
                fontSize: '14px', fontWeight: '600', textDecoration: 'none', whiteSpace: 'nowrap',
              }}>How It Works</Link>
            </div>
          </div>
        </div>

        <div className={styles.pageBottom}>
          <span>WHY USE COT LEVER</span>
          <span>END</span>
        </div>
      </section>
    </div>
  )
}
