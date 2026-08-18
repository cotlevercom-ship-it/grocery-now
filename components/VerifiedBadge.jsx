import { theme } from '@/lib/theme'

// Small checkmark-in-circle badge shown next to a verified member's name.
export default function VerifiedBadge({ size = 15, title = 'Verified' }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill={theme.signal} stroke="none"
      style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' }}
      aria-label={title}
    >
      <title>{title}</title>
      <path d="M12 1.5l2.6 2.1 3.3-.5 1 3.2 3 1.6-1.1 3.2 1.1 3.2-3 1.6-1 3.2-3.3-.5L12 21.5l-2.6-2.1-3.3.5-1-3.2-3-1.6 1.1-3.2L2.1 8.9l3-1.6 1-3.2 3.3.5L12 1.5z" />
      <path d="M8.6 12.1l2.2 2.2 4.6-4.7" stroke={theme.paper} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}
