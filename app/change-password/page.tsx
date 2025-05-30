'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [step, setStep] = useState<'phone' | 'verify'>('phone')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone) {
      toast.error('Please enter your phone number')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/frontend/auth/change-password?phone=${phone}`)
      const data = await response.json()

      if (!data.success) {
        toast.error(data.message)
        return
      }

      toast.success('OTP sent successfully')
      setStep('verify')
    } catch (error) {
      toast.error('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || !newPassword) {
      toast.error('Please enter OTP and new password')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/frontend/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, newPassword })
      })

      const data = await response.json()

      if (!data.success) {
        toast.error(data.message)
        return
      }

      toast.success('Password changed successfully')
      router.push('/')
    } catch (error) {
      toast.error('Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            {step === 'phone' ? (
              <form onSubmit={handleRequestOTP} className="space-y-4">
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
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    OTP
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Changing Password...' : 'Change Password'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 