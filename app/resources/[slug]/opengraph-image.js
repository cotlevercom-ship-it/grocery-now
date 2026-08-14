import { ImageResponse } from 'next/og'
import { supabaseFetch } from '@/lib/supabase'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const INK = '#14213D'
const PAPER = '#F6F4EF'
const BRASS = '#B8874B'

export default async function Image({ params }) {
  const { slug } = await params
  let article = null
  try {
    const data = await supabaseFetch(`resources?select=title,excerpt&slug=eq.${slug}&is_published=eq.true`)
    article = data?.[0] || null
  } catch (e) {
    article = null
  }

  const title = article?.title || 'Resources for Founders'

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
          Cot Lever · Resources
        </div>
        <div
          style={{
            fontSize: 54,
            fontWeight: 600,
            color: INK,
            lineHeight: 1.2,
            maxWidth: 980,
          }}
        >
          {title}
        </div>
        {article?.excerpt && (
          <div
            style={{
              marginTop: 24,
              fontSize: 26,
              color: INK,
              opacity: 0.65,
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            {article.excerpt.slice(0, 120)}
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
