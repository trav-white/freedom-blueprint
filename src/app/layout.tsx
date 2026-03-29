import type { Metadata } from 'next'
import { Inter, Crimson_Pro, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
})

const crimson = Crimson_Pro({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
  variable: '--font-crimson',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-cormorant',
})

export const metadata: Metadata = {
  title: 'Freedom Blueprint',
  description: 'AI-coached Freedom Blueprint worksheets',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${crimson.variable} ${cormorant.variable}`}>
      <body className="noise-overlay min-h-screen bg-[#080f1a] text-white antialiased overflow-x-hidden font-[family-name:var(--font-inter)]">
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
