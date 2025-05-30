'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

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
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/register" className="text-indigo-600 hover:text-indigo-500">
                  Register
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 