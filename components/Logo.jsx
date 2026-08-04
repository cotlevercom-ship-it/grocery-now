export default function Logo({ variant = 'light', size = 22 }) {
  const inkColor = variant === 'light' ? '#ffffff' : '#0a0a0a'

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      fontWeight: 800,
      fontSize: typeof size === 'number' ? `${size}px` : size,
      letterSpacing: '-0.01em',
      lineHeight: 1,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ color: inkColor }}>COT</span>
      <span style={{ color: '#f4a300' }}>LEVER</span>
    </span>
  )
}
