'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MerchantResetPinRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/forgot-password')
  }, [router])
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#888', fontSize: '14px'
    }}>
      Redirecting...
    </div>
  )
}
