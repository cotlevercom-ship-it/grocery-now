'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MerchantForgotPinRedirect() {
  const router = useRouter()
  useEffect(() => {
    // PIN login has been retired — merchants now reset their regular
    // Cot Lever account password instead.
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
