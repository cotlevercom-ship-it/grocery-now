'use client'
import { Suspense } from 'react'
import { theme } from '@/lib/theme'
import ListingBrowse from '@/components/ListingBrowse'

export default function HomeTabs() {
  return (
    <div style={{ background: theme.paper, minHeight: '80vh' }}>
      <Suspense fallback={null}>
        <ListingBrowse embedded />
      </Suspense>
    </div>
  )
}
