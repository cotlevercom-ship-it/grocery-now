import { supabaseFetch } from '@/lib/supabase'

const BASE_URL = 'https://cotlever.com'

// Static, publicly-crawlable routes. Admin, account, auth, and payment
// routes are intentionally excluded (private/no SEO value).
const STATIC_ROUTES = [
  { path: '/', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/listings', changeFrequency: 'daily', priority: 0.9 },
  { path: '/cofounder', changeFrequency: 'daily', priority: 0.9 },
  { path: '/resources', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/how-it-works', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/help', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/login', changeFrequency: 'yearly', priority: 0.2 },
]

export default async function sitemap() {
  const entries = STATIC_ROUTES.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  // Published resource articles
  try {
    const articles = await supabaseFetch(
      'resources?select=slug,created_at&is_published=eq.true'
    )
    for (const a of articles || []) {
      entries.push({
        url: `${BASE_URL}/resources/${a.slug}`,
        lastModified: new Date(a.created_at),
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  } catch (e) {
    console.error('sitemap: failed to load resources', e)
  }

  // Active, approved business listings
  try {
    const listings = await supabaseFetch(
      'listings?select=id,updated_at,created_at&status=eq.active'
    )
    for (const l of listings || []) {
      entries.push({
        url: `${BASE_URL}/listing/${l.id}`,
        lastModified: new Date(l.updated_at || l.created_at),
        changeFrequency: 'weekly',
        priority: 0.5,
      })
    }
  } catch (e) {
    console.error('sitemap: failed to load listings', e)
  }

  // Active co-founder posts
  try {
    const posts = await supabaseFetch(
      'cofounder_posts?select=id,created_at&status=eq.active'
    )
    for (const p of posts || []) {
      entries.push({
        url: `${BASE_URL}/cofounder/${p.id}`,
        lastModified: new Date(p.created_at),
        changeFrequency: 'weekly',
        priority: 0.5,
      })
    }
  } catch (e) {
    console.error('sitemap: failed to load cofounder posts', e)
  }

  return entries
}
