'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Posting for a co-founder now happens through the main listing form —
// select "Co-founder" as one of the listing types there.
export default function NewCofounderPostRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/listings/new')
  }, [router])
  return null
}
