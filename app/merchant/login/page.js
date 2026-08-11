'use client'
import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function MerchantLoginRedirect() {
  return (
    <Suspense fallback={null}>
      <RedirectInner />
    </Suspense>
  )
}

function RedirectInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Merchant login has merged into the regular customer login — a shop
    // is now just something your normal Cot Lever account can have.
    const next = searchParams.get('next') || '/merchant/create'
    router.replace(`/login?next=${encodeURIComponent(next)}`)
  }, [router, searchParams])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#888', fontSize: '14px'
    }}>
      Redirecting to login...
    </div>
  )
}
