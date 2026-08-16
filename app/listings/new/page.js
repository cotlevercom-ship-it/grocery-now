'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Business listing creation was removed — creating a profile now happens
// at /members/new.
export default function NewListingRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/members/new')
  }, [router])
  return null
}
