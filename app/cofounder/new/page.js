'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Posting a co-founder profile now happens at /members/new.
export default function NewCofounderPostRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/members/new')
  }, [router])
  return null
}
