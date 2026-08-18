'use client'
import HowItWorksDeck from '@/components/HowItWorksDeck'
import { theme } from '@/lib/theme'

export default function HowItWorksPage() {
  return (
    <div style={{ background: theme.paper, minHeight: '70vh' }}>
      <div className="hiw-page-wrap" style={{ maxWidth: '640px', margin: '0 auto' }}>
        <HowItWorksDeck showHeading />
      </div>
      <style jsx global>{`
        .hiw-page-wrap {
          padding: clamp(20px,4vw,40px) clamp(12px,3vw,24px);
        }
        @media (max-width: 767px) {
          .hiw-page-wrap {
            padding-left: 0;
            padding-right: 0;
          }
        }
      `}</style>
    </div>
  )
}
