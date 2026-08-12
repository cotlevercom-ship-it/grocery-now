import { supabaseFetch } from '@/lib/supabase'

// Fetch admin-managed listing type options (co-founder, investor, etc.).
// activeOnly=true is used anywhere a user picks a type for a NEW listing
// (create-listing form, homepage filter tabs) so deactivated types drop out.
// activeOnly=false (default) is used anywhere we're just displaying a label
// for an EXISTING listing's saved type, so old listings with a since-
// deactivated type still render a proper label instead of a raw key.
export async function fetchListingTypes({ activeOnly = false } = {}) {
  const filter = activeOnly ? '&is_active=eq.true' : ''
  const rows = await supabaseFetch(`listing_type_options?select=*&order=sort_order.asc${filter}`)
  return rows || []
}
