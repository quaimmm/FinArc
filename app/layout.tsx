import './globals.css'
import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import Providers from './providers'
import TopNav from '@/components/top-nav'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'FinArc',
  description: 'Premium USDC payment requests on Arc',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${cormorant.variable} text-white antialiased`}
      >
        <Providers>
          <TopNav />
          {children}
        </Providers>
      </body>
    </html>
  )
}