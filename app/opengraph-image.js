import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const INK = '#14213D'
const PAPER = '#F6F4EF'
const BRASS = '#B8874B'
const LINE = '#E1DCCF'

export default async function Image() {
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
            fontSize: 22,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: BRASS,
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          Cot Lever
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            color: INK,
            lineHeight: 1.15,
            maxWidth: 980,
          }}
        >
          Find a co-founder, partner, or investor
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 28,
            color: INK,
            opacity: 0.65,
            maxWidth: 900,
          }}
        >
          List your business and connect with people who move it forward.
        </div>
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
