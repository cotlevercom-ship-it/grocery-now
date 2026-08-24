'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseFetch, getSession } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import { sc } from '@/lib/memberTheme'
import AppSidebar from '@/components/AppSidebar'
import AppBottomNav from '@/components/AppBottomNav'
import BusinessForm from '@/components/BusinessForm'

export default function NewBusinessPage() {
  const router = useRouter()
  const [userId, setUserId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const session = getSession()
    const uid = session?.user?.id
    if (!uid) { router.replace('/login?next=/businesses/new'); return }
    setUserId(uid)
  }, [router])

  const handleSubmit = async (payload) => {
    setSubmitting(true)
    try {
      const rows = await supabaseFetch('businesses', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ ...payload, owner_id: userId }),
      })
      const created = rows?.[0]
      if (created?.id) router.push(`/businesses/${created.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: sc.bg }}>
      <AppSidebar active="businesses" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'clamp(20px,3vw,32px) clamp(16px,3vw,24px) 90px' }}>
          <h1 style={{ fontFamily: theme.fontDisplay, fontWeight: '700', fontSize: '22px', color: sc.text, marginBottom: '4px' }}>Add your business</h1>
          <p style={{ fontSize: '13.5px', color: sc.textSoft, marginBottom: '22px' }}>
            List your business so investors on Cot Lever can discover it and reach out.
          </p>
          {userId && <BusinessForm onSubmit={handleSubmit} submitting={submitting} submitLabel="List Business" />}
        </div>
      </div>
      <AppBottomNav active="businesses" />
    </div>
  )
}
