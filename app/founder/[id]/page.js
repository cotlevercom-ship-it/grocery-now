import { supabaseFetch } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import FounderDetailClient from './FounderDetailClient'

export const dynamic = 'force-dynamic'

export default async function FounderProfilePage({ params }) {
  const { id } = await params

  let profile = null
  try {
    const rows = await supabaseFetch(`founder_profiles?select=*&id=eq.${id}&is_active=eq.true`)
    profile = rows?.[0] || null
  } catch (e) {
    console.error(e)
  }

  if (!profile) return notFound()

  return <FounderDetailClient profile={profile} />
}
