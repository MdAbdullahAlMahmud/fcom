import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import "./tailwind-build.css"
import { Toaster } from 'sonner'
import { CartProvider } from '@/contexts/CartContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fashion Commerce',
  description: 'Your one-stop shop for fashion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          {children}
        </CartProvider>
        <Toaster />
      </body>
    </html>
  )
}