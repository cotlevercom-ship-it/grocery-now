import { redirect, notFound } from 'next/navigation'
import { supabaseFetch } from '@/lib/supabase'

// Legacy UUID-based shop URL — redirects to the canonical slug-based /shop/[slug] route.
export default async function LegacyShopRedirect({ params }) {
  const { shopId } = await params

  let shop = null
  try {
    const shops = await supabaseFetch(`shops?select=slug&id=eq.${shopId}`)
    shop = shops?.[0] || null
  } catch (e) {
    console.error(e)
  }

  if (!shop?.slug) {
    notFound()
  }

  redirect(`/shop/${shop.slug}`)
}
