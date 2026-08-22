// Minimal outlined line icons used by the resume-style profile UI
// (/account and /members/[userId]). Kept as one shared file so both
// pages render identical icon style.

const base = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

export function IconUser({ color = 'currentColor', size = 16 }) {
  return (
    <svg {...base} width={size} height={size} stroke={color}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
    </svg>
  )
}
export function IconBriefcase({ color = 'currentColor', size = 16 }) {
  return (
    <svg {...base} width={size} height={size} stroke={color}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </svg>
  )
}
export function IconGrad({ color = 'currentColor', size = 16 }) {
  return (
    <svg {...base} width={size} height={size} stroke={color}>
      <path d="M2 9l10-5 10 5-10 5-10-5z" />
      <path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
    </svg>
  )
}
export function IconFolder({ color = 'currentColor', size = 16 }) {
  return (
    <svg {...base} width={size} height={size} stroke={color}>
      <path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z" />
    </svg>
  )
}
export function IconTrophy({ color = 'currentColor', size = 16 }) {
  return (
    <svg {...base} width={size} height={size} stroke={color}>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
      <path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" />
      <path d="M12 14v3M9 21h6M10 17h4v4h-4z" />
    </svg>
  )
}
export function IconMail({ color = 'currentColor', size = 15 }) {
  return (
    <svg {...base} width={size} height={size} stroke={color}>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
      <path d="M3 6l9 7 9-7" />
    </svg>
  )
}
export function IconPin({ color = 'currentColor', size = 15 }) {
  return (
    <svg {...base} width={size} height={size} stroke={color}>
      <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}
export function IconLink({ color = 'currentColor', size = 15 }) {
  return (
    <svg {...base} width={size} height={size} stroke={color}>
      <path d="M9 15l6-6" />
      <path d="M11 5l1-1a4 4 0 0 1 6 6l-1 1" />
      <path d="M13 19l-1 1a4 4 0 0 1-6-6l1-1" />
    </svg>
  )
}
export function IconGithub({ color = 'currentColor', size = 15 }) {
  return (
    <svg {...base} width={size} height={size} stroke={color}>
      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2-.2 4.5-1 4.5-4.5a3.5 3.5 0 0 0-1-2.5 3.2 3.2 0 0 0-.1-2.4s-.8-.3-2.9 1a10 10 0 0 0-5 0C7.8 3.3 7 3.6 7 3.6a3.2 3.2 0 0 0-.1 2.4A3.5 3.5 0 0 0 6 8.5C6 12 8.5 12.8 10.5 13c-.6.6-.6 1.1-.5 2V19" />
    </svg>
  )
}
export function IconGlobe({ color = 'currentColor', size = 15 }) {
  return (
    <svg {...base} width={size} height={size} stroke={color}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" />
    </svg>
  )
}
export function IconGear({ color = 'currentColor', size = 15 }) {
  return (
    <svg {...base} width={size} height={size} stroke={color}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.6V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.6 1H20a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1z" />
    </svg>
  )
}
