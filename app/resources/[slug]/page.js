import { supabaseFetch } from '@/lib/supabase'
import ArticleClient from './ArticleClient'

export async function generateMetadata({ params }) {
  const { slug } = await params
  try {
    const data = await supabaseFetch(`resources?select=title,excerpt&slug=eq.${slug}&is_published=eq.true`)
    const article = data?.[0]
    if (!article) {
      return { title: 'Article Not Found | Cot Lever' }
    }
    return {
      title: `${article.title} | Cot Lever`,
      description: article.excerpt || undefined,
    }
  } catch (e) {
    return { title: 'Resources | Cot Lever' }
  }
}

export default function ArticlePage() {
  return <ArticleClient />
}
