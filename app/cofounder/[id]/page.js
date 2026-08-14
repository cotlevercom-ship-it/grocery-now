import { supabaseFetch } from '@/lib/supabase'
import CofounderPostClient from './CofounderPostClient'

export async function generateMetadata({ params }) {
  const { id } = await params
  try {
    const data = await supabaseFetch(`cofounder_posts?select=idea_name,description&id=eq.${id}`)
    const post = data?.[0]
    if (!post) {
      return { title: 'Post Not Found | Cot Lever' }
    }
    return {
      title: `${post.idea_name} — Find a Co-founder | Cot Lever`,
      description: post.description ? post.description.slice(0, 155) : undefined,
    }
  } catch (e) {
    return { title: 'Find a Co-founder | Cot Lever' }
  }
}

export default function CofounderPostDetailPage() {
  return <CofounderPostClient />
}
