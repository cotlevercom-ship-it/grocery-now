import './globals.css'

export const metadata = {
  title: 'GroceryNow',
  description: 'আপনার এলাকার সেরা গ্রোসারি',
}

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
