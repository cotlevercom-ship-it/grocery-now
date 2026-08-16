'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Business listings were removed — this platform is now member-profile
// based. Redirect old links here.
export default function CofounderBrowseRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/members')
  }, [router])
  return null
}
