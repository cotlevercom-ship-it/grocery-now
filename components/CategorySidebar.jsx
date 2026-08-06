import { supabaseFetch } from '@/lib/supabase'
import CategorySidebarClient from './CategorySidebarClient'

export default async function CategorySidebar() {
  let categories = []
  try {
    categories = await supabaseFetch(
      `categories?select=id,name,parent_id,image_url,sort_order&is_active=eq.true&order=sort_order`
    )
  } catch (e) {
    console.error(e)
  }

  if (!categories || categories.length === 0) return null

  return <CategorySidebarClient categories={categories} />
}
