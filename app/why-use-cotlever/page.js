'use client'
import { useState, useRef, useEffect } from 'react'
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
  const [page, setPage] = useState(0)
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  const goNext = () => setPage((p) => Math.min(p + 1, total - 1))
  const goPrev = () => setPage((p) => Math.max(p - 1, 0))

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleTap = (clientX) => {
    if (clientX == null) return
    const width = window.innerWidth
    if (clientX < width * 0.35) goPrev()
    else goNext()
  }

  const handleClick = (e) => handleTap(e.clientX)

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current == null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? goNext() : goPrev()
    } else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      handleTap(e.changedTouches[0].clientX)
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  const pages = [
    ...REASONS.map((r) => ({ type: 'reason', ...r })),
    { type: 'cta', n: `0${total}` },
  ]

  return (
    <div className={styles.book}>
      <div className={styles.bookFrame}>
        <div className={styles.spine}>
          <span className={styles.spineText}>WHY USE COT LEVER</span>
        </div>
        <div className={styles.pageBlock}>
      <div
        className={styles.stage}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {pages.map((p, i) => {
          const flipped = i < page
          return (
            <section
              key={p.n}
              className={`${styles.bookPage} ${flipped ? styles.flipped : ''}`}
              style={{ zIndex: total - i }}
            >
              <div className={styles.pageTop}>
                <span className={styles.brand}>COT LEVER</span>
                <span className={styles.pageNumber}>{p.n} / 0{total}</span>
              </div>

              {p.type === 'reason' ? (
                <>
                  <div className={styles.pageLabel}>Why Cot Lever</div>
                  <div className={styles.pageContent}>
                    <div className={styles.pageIndex}>{p.n}</div>
                    <div className={styles.pageCopy}>
                      <h2>{p.heading}</h2>
                      <p>{p.body}</p>
                    </div>
                  </div>
                  <div className={styles.pageBottom}>
                    <span>WHY USE COT LEVER</span>
                    <span>TAP TO TURN PAGE</span>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.pageLabel}>Get Started</div>
                  <div className={styles.pageContent}>
                    <div className={styles.pageIndex}>{p.n}</div>
                    <div className={styles.pageCopy}>
                      <h2>Ready to get <em>started</em>?</h2>
                      <p>Create your profile and let the right people find you — see how it works first if you like.</p>
                      <div
                        style={{ display: 'flex', gap: '16px', marginTop: '36px', flexWrap: 'wrap' }}
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                      >
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
                    <span>TAP LEFT TO GO BACK</span>
                  </div>
                </>
              )}
            </section>
          )
        })}
      </div>
        </div>
      </div>

      <div className={styles.progress}>
        {pages.map((p, i) => (
          <span key={p.n} className={i === page ? styles.dotActive : styles.dot} />
        ))}
      </div>
    </div>
  )
}
