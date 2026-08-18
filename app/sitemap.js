import { supabaseFetch } from '@/lib/supabase'

const BASE_URL = 'https://cotlever.com'

// Static, publicly-crawlable routes. Admin, account, auth, and payment
// routes are intentionally excluded (private/no SEO value).
const STATIC_ROUTES = [
  { path: '/', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/resources', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/how-it-works', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/why-use-cotlever', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/pricing', changeFrequency: 'monthly', priority: 0.5 },
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

  return entries
}
