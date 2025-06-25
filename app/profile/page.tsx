'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  User, 
  Phone, 
  BarChart3, 
  Package, 
  Clock, 
  Settings, 
  Truck, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  TrendingUp
} from 'lucide-react'

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

  const getStatusConfig = (status: string, count: number) => {
    const configs = {
      total: {
        icon: Package,
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        bgColor: 'bg-purple-50',
        iconColor: 'text-purple-600'
      },
      pending: {
        icon: Clock,
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        bgColor: 'bg-amber-50',
        iconColor: 'text-amber-600'
      },
      processing: {
        icon: Settings,
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600'
      },
      shipped: {
        icon: Truck,
        color: 'bg-violet-100 text-violet-800 border-violet-200',
        bgColor: 'bg-violet-50',
        iconColor: 'text-violet-600'
      },
      delivered: {
        icon: CheckCircle,
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        bgColor: 'bg-emerald-50',
        iconColor: 'text-emerald-600'
      },
      cancelled: {
        icon: XCircle,
        color: 'bg-red-100 text-red-800 border-red-200',
        bgColor: 'bg-red-50',
        iconColor: 'text-red-600'
      },
      refunded: {
        icon: RefreshCw,
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        bgColor: 'bg-gray-50',
        iconColor: 'text-gray-600'
      }
    }
    return configs[status as keyof typeof configs]
  }

  const calculateCompletionRate = () => {
    if (!profile) return 0
    const total = profile.orderStats.total
    if (total === 0) return 0
    return Math.round((profile.orderStats.delivered / total) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50">
        <div className="container mx-auto py-12">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-full animate-pulse"></div>
            <div className="w-8 h-8 bg-violet-600 rounded-full animate-pulse delay-75"></div>
            <div className="w-8 h-8 bg-purple-600 rounded-full animate-pulse delay-150"></div>
          </div>
          <p className="text-center text-gray-600 mt-4">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50">
        <div className="container mx-auto py-12">
          <Card className="border-red-200 shadow-lg max-w-md mx-auto">
            <CardContent className="py-16">
              <div className="text-center">
                <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4">
                  <User className="w-8 h-8 text-red-600 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Profile not found</h3>
                <p className="text-gray-500">Unable to load your profile information</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50">
      <div className="container mx-auto py-8 px-4">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-colors shadow-sm font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-600 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          </div>
          <p className="text-gray-600">Manage your account information and view order statistics</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Phone Number Card */}
          <Card className="border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
              <CardTitle className="flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                  <p className="text-xl font-semibold text-purple-700">{profile.phone}</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Verified</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Statistics Overview */}
          <Card className="border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-300 lg:col-span-2">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Order Statistics</span>
                </div>
                <div className="flex items-center space-x-2 text-purple-100">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">{calculateCompletionRate()}% Success Rate</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(profile.orderStats).map(([status, count]) => {
                  const config = getStatusConfig(status, count)
                  const Icon = config.icon
                  
                  return (
                    <div key={status} className={`${config.bgColor} p-4 rounded-lg border border-opacity-50 hover:scale-105 transition-transform duration-200`}>
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-5 h-5 ${config.iconColor}`} />
                        <Badge className={`${config.color} border font-medium text-xs`}>
                          {count}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-gray-700 capitalize">
                        {status === 'total' ? 'Total Orders' : status}
                      </p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Order Breakdown */}
          <Card className="border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-300 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Package className="w-5 h-5 text-purple-600" />
                <span>Order Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {Object.entries(profile.orderStats)
                  .filter(([status]) => status !== 'total')
                  .map(([status, count]) => {
                    const config = getStatusConfig(status, count)
                    const Icon = config.icon
                    const percentage = profile.orderStats.total > 0 
                      ? Math.round((count / profile.orderStats.total) * 100) 
                      : 0
                    
                    return (
                      <div key={status} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 ${config.bgColor} rounded-lg`}>
                            <Icon className={`w-4 h-4 ${config.iconColor}`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 capitalize">{status}</p>
                            <p className="text-sm text-gray-500">{percentage}% of total orders</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${config.color} border font-semibold text-sm`}>
                            {count}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
              </div>
              
              {/* Progress Bar */}
              {profile.orderStats.total > 0 && (
                <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Order Completion Rate</span>
                    <span className="text-sm font-semibold text-purple-700">{calculateCompletionRate()}%</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-violet-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${calculateCompletionRate()}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {profile.orderStats.delivered} out of {profile.orderStats.total} orders successfully delivered
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}