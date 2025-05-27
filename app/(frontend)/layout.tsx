import { CartProvider } from '@/contexts/CartContext'
import Header from '@/components/frontend/layout/Header'
import Footer from '@/components/frontend/layout/Footer'
import { Toaster } from '@/components/ui/toaster'

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50">{children}</main>
        <Footer />
        <Toaster />
      </div>
    </CartProvider>
  )
} 