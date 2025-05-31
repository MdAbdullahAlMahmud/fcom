'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Phone, Lock, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || !password) {
      toast.error('Please enter phone number and password')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/frontend/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      })

      const data = await response.json()

      if (!data.success) {
        toast.error(data.message)
        return
      }

      // Save token
      localStorage.setItem('token', data.token)
      toast.success('Login successful')
      router.push('/')
    } catch (error) {
      toast.error('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-rose-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl shadow-lg mb-4 transform hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-600 mt-2">Sign in to continue your journey</p>
        </div>

        <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-2xl shadow-violet-500/10 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5"></div>
          <CardHeader className="relative z-10 pb-6">
            <CardTitle className="text-2xl font-semibold text-gray-800 text-center">
              Sign In
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Phone Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors duration-200" />
                  </div>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-12 h-12 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-0 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors duration-200" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 h-12 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-0 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-violet-500 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] group" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                )}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
              </div>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link 
                    href="/register" 
                    className="font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent hover:from-violet-700 hover:to-purple-700 transition-all duration-200 relative group"
                  >
                    Create Account
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Secure login with end-to-end encryption
          </p>
        </div>
      </div>
    </div>
  )
}