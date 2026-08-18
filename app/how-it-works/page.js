'use client'
import HowItWorksDeck from '@/components/HowItWorksDeck'
import { theme } from '@/lib/theme'

export default function HowItWorksPage() {
  return (
    <div style={{ background: theme.paper, minHeight: '70vh' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'clamp(20px,4vw,40px) clamp(12px,3vw,24px)' }}>
        <HowItWorksDeck showHeading />
      </div>
    </div>
  )
}
