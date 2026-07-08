import { supabaseFetch } from '@/lib/supabase'
import BannerCarousel from './BannerCarousel'

export default async function Hero() {
  let banners = []
  try {
    banners = await supabaseFetch('banners?select=*&is_active=eq.true&order=sort_order')
  } catch (e) {
    console.error(e)
  }

  return <BannerCarousel banners={banners} />
}
