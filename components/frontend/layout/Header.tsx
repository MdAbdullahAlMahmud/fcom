'use client'

import Link from 'next/link'
import { ShoppingCart, Search, User } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Header() {
  const { items } = useCart()
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const [orderNumber, setOrderNumber] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (orderNumber.trim()) {
      router.push(`/track-order?orderNumber=${orderNumber.trim()}`)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    router.push('/')
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold">
            fCommerce
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:text-gray-600">
              Home
            </Link>
            <Link href="/products" className="hover:text-gray-600">
              Products
            </Link>
            <Link href="/categories" className="hover:text-gray-600">
              Categories
            </Link>
          </nav>

          {/* Track Order Form */}
          <form onSubmit={handleTrackOrder} className="hidden md:flex items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter Order number"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-56 pl-4 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-indigo-600 transition-colors duration-200"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>

          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Profile */}
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/my-orders')}>
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/change-password')}>
                    Change Password
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" onClick={() => router.push('/login')}>
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 