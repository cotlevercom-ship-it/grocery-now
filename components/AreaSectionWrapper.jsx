import { supabaseFetch } from '@/lib/supabase'
import AreaSection from './AreaSection'

export const dynamic = 'force-dynamic'

export default async function AreaSectionWrapper() {
  let areas = []
  try {
    areas = await supabaseFetch(`areas?select=*&order=name`)
  } catch (e) {
    console.error(e)
  }

  if (!areas || areas.length === 0) return null

  return <AreaSection areas={areas} />
}
