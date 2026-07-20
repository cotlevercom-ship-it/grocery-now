'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseFetch } from '@/lib/supabase'

export default function CancelOrderButton({ orderId }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleCancel = async () => {
    setSubmitting(true)
    setError('')
    try {
      await supabaseFetch(`orders?id=eq.${orderId}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      router.refresh()
    } catch (err) {
      console.error(err)
      setError(err.message || 'অর্ডার বাতিল করতে সমস্যা হয়েছে')
      setSubmitting(false)
    }
  }

  if (confirming) {
    return (
      <div>
        <div style={{ fontSize: '13px', color: '#c62828', marginBottom: '10px' }}>
          আপনি কি নিশ্চিত অর্ডারটি বাতিল করতে চান?
        </div>
        {error && (
          <div style={{
            marginBottom: '10px', padding: '8px 10px', background: '#ffebee',
            color: '#c62828', borderRadius: '6px', fontSize: '12px'
          }}>{error}</div>
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleCancel}
            disabled={submitting}
            style={{
              flex: 1, background: submitting ? '#ef9a9a' : '#c62828', color: 'white',
              border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px',
              fontWeight: '600', cursor: 'pointer'
            }}>
            {submitting ? 'বাতিল হচ্ছে...' : 'হ্যাঁ, বাতিল করুন'}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={submitting}
            style={{
              flex: 1, background: '#f0f0f0', color: '#333',
              border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px',
              fontWeight: '600', cursor: 'pointer'
            }}>
            না, থাক
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{
        width: '100%', background: 'white', color: '#c62828',
        border: '1.5px solid #c62828', borderRadius: '8px', padding: '10px',
        fontSize: '13px', fontWeight: '600', cursor: 'pointer'
      }}>
      অর্ডার বাতিল করুন
    </button>
  )
}
