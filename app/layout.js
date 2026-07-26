import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Cot Lever',
  description: 'Shop from sellers across the country and beyond',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="app-container">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  )
}
