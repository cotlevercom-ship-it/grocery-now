import { supabaseFetch } from '@/lib/supabase'
import { Suspense } from 'react'
import BrowseGrid from './BrowseGrid'

export const dynamic = 'force-dynamic'

export default async function BrowsePage() {
  let profiles = []
  try {
    profiles = await supabaseFetch(
      `founder_profiles?select=*&is_active=eq.true&order=is_featured.desc,created_at.desc`
    )
  } catch (e) {
    console.error(e)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#eef0ee' }}>
      <div style={{ background: '#0a0a0a', padding: '32px 16px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: '800', color: 'white', margin: 0 }}>
            Browse Founders
          </h1>
          <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.65)', marginTop: '6px' }}>
            {profiles.length} founder{profiles.length !== 1 ? 's' : ''} on Cot Lever right now — message anyone directly.
          </p>
        </div>
      </div>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 16px 40px' }}>
        <Suspense fallback={null}>
          <BrowseGrid profiles={profiles} />
        </Suspense>
      </div>
    </div>
  )
}
