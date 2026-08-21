import { theme } from '@/lib/theme'

// Clean, minimal SaaS-app palette — shared by /members, /feed, and any other
// member-facing page that opts into the light neutral surface (instead of
// the sitewide dark red/black theme). Brass accent reserved for buttons,
// badges, and selected states.
export const sc = {
  bg: '#F7F6F4',
  sidebarBg: '#FFFFFF',
  cardBg: '#FFFFFF',
  text: '#16181D',
  textSoft: '#6B7280',
  textFaint: '#A1A5AC',
  line: '#EBE9E6',
  chipBg: '#F1F2F4',
  chipText: '#42454C',
  industryChipBg: 'rgba(179,55,42,0.08)',
  industryChipText: theme.brass,
  shadow: '0 1px 2px rgba(16,24,40,0.04), 0 1px 6px rgba(16,24,40,0.05)',
  shadowHover: '0 6px 20px rgba(16,24,40,0.10)',
}
