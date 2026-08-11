import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Cot Lever',
  description: 'কো-ফাউন্ডার, পার্টনার, ইনভেস্টর, কর্মী, সাপ্লায়ার বা বায়ার খুঁজুন — আপনার বিজনেস লিস্ট করুন।',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
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
