import { supabaseFetch } from '@/lib/supabase'
import ArticleClient from './ArticleClient'

async function getArticle(slug) {
  try {
    const data = await supabaseFetch(`resources?select=title,excerpt,content,created_at&slug=eq.${slug}&is_published=eq.true`)
    return data?.[0] || null
  } catch (e) {
    return null
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) {
    return { title: 'Article Not Found | Cot Lever' }
  }
  return {
    title: `${article.title} | Cot Lever`,
    description: article.excerpt || undefined,
    alternates: {
      canonical: `/resources/${slug}`,
    },
  }
}

export default async function ArticlePage({ params }) {
  const { slug } = await params
  const article = await getArticle(slug)

  const jsonLd = article
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.excerpt || undefined,
        datePublished: article.created_at,
        author: { '@type': 'Organization', name: 'Cot Lever' },
        publisher: { '@type': 'Organization', name: 'Cot Lever' },
        mainEntityOfPage: `https://cotlever.com/resources/${slug}`,
      }
    : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ArticleClient />
    </>
  )
}
