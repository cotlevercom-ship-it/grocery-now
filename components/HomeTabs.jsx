'use client'
import { Suspense } from 'react'
import { theme } from '@/lib/theme'
import MembersBrowsePage from '@/app/members/page'

export default function HomeTabs() {
  return (
    <div style={{ background: theme.paper, minHeight: '80vh' }}>
      <Suspense fallback={null}>
        <MembersBrowsePage embedded />
      </Suspense>
    </div>
  )
}
