import { ImageResponse } from 'next/og'
import { supabaseFetch } from '@/lib/supabase'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const INK = '#14213D'
const PAPER = '#F6F4EF'
const BRASS = '#B8874B'

export default async function Image({ params }) {
  const { id } = await params
  let post = null
  try {
    const data = await supabaseFetch(`cofounder_posts?select=idea_name,stage&id=eq.${id}`)
    post = data?.[0] || null
  } catch (e) {
    post = null
  }

  const name = post?.idea_name || 'Looking for a Co-founder'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          background: PAPER,
          padding: '80px',
        }}
      >
        <div
          style={{
            fontSize: 20,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: BRASS,
            fontWeight: 600,
            marginBottom: 28,
          }}
        >
          Cot Lever · Find a Co-founder
        </div>
        <div
          style={{
            fontSize: 58,
            fontWeight: 600,
            color: INK,
            lineHeight: 1.15,
            maxWidth: 980,
          }}
        >
          {name}
        </div>
        {post?.stage && (
          <div
            style={{
              marginTop: 24,
              fontSize: 28,
              color: INK,
              opacity: 0.65,
            }}
          >
            {post.stage}
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: 10,
            background: BRASS,
          }}
        />
      </div>
    ),
    { ...size }
  )
}
