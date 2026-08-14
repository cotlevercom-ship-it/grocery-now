'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Find a Co-founder was merged into the main Listing directory —
// co_founder is now just one of the listing types. Redirect old links here.
export default function CofounderBrowseRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/listings?type=co_founder')
  }, [router])
  return null
}
