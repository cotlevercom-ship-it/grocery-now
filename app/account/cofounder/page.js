'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MyCofounderPostsRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/account/listings')
  }, [router])
  return null
}
