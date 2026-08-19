// Light palette used ONLY on the /account passbook pages (account, basic-info,
// profession). Rest of the site keeps the dark theme from lib/theme.js.
// Brass accent kept identical to the main theme so buttons/links still match brand.
export const accountLightTheme = {
  ink: '#241512',        // primary text on white
  inkSoft: '#8A746E',    // secondary/muted text on white
  paper: '#FFFFFF',      // page background
  surface: '#FFFFFF',    // card background (differentiated via border/shadow)
  line: '#E7DEDC',       // hairline borders on light surfaces
  lineSoft: '#F4EEED',
  brass: '#B3372A',
  brassDark: '#8A2A20',
  signal: '#2F7A50',
  signalSoft: '#E9F5EE',
  danger: '#C43C2C',
  dangerSoft: '#FBEAE8',

  fontDisplay: "var(--font-fraunces), Georgia, serif",
  fontBody: "var(--font-plex-sans), Arial, sans-serif",
  fontMono: "var(--font-plex-mono), 'Courier New', monospace",
}
