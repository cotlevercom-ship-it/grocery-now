import './globals.css'
import Navbar from '@/components/Navbar'

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
      <body style={{ background: '#e5e5e5', margin: 0 }}>
        <div style={{
          maxWidth: '480px',
          margin: '0 auto',
          background: '#f5f5f5',
          minHeight: '100vh',
          boxShadow: '0 0 30px rgba(0,0,0,0.1)',
        }}>
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  )
}
