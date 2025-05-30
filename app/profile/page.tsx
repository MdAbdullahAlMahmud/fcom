'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface OrderStats {
  total: number
  pending: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
  refunded: number
}

interface Profile {
  phone: string
  orderStats: OrderStats
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // Fetch profile
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/frontend/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()

        if (!data.success) {
          toast.error(data.message)
          return
        }

        setProfile(data.profile)
      } catch (error) {
        toast.error('Failed to fetch profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Profile not found</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Phone Number */}
        <Card>
          <CardHeader>
            <CardTitle>Phone Number</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{profile.phone}</p>
          </CardContent>
        </Card>

        {/* Order Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Order Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Orders</span>
                <Badge variant="outline">{profile.orderStats.total}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Pending</span>
                <Badge variant="outline" className="bg-yellow-100">{profile.orderStats.pending}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Processing</span>
                <Badge variant="outline" className="bg-blue-100">{profile.orderStats.processing}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Shipped</span>
                <Badge variant="outline" className="bg-purple-100">{profile.orderStats.shipped}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Delivered</span>
                <Badge variant="outline" className="bg-green-100">{profile.orderStats.delivered}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Cancelled</span>
                <Badge variant="outline" className="bg-red-100">{profile.orderStats.cancelled}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Refunded</span>
                <Badge variant="outline" className="bg-gray-100">{profile.orderStats.refunded}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 