const BASE_URL = 'https://cotlever.com'

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin/',
        '/account',
        '/account/',
        '/api/',
        '/login',
        '/forgot-password',
        '/reset-password',
        '/verify-otp',
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
