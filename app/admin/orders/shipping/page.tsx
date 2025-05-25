'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Order, OrderStatus } from '@/types/order'

export default function OrderShippingPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingShipping, setUpdatingShipping] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      const data = await response.json()
      setOrders(data.orders)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleShippingUpdate = async (orderId: number) => {
    try {
      setUpdatingShipping(true)
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          tracking_number: trackingNumber,
          estimated_delivery_date: estimatedDeliveryDate,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update shipping information')
      }

      await fetchOrders()
      setSelectedOrder(null)
      setTrackingNumber('')
      setEstimatedDeliveryDate('')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update shipping information')
    } finally {
      setUpdatingShipping(false)
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading orders...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order Shipping</h1>
        <Button variant="outline" onClick={() => router.push('/admin/orders/listing')}>
          Back to Orders
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Orders Needing Shipping Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedOrder(order)
                    setTrackingNumber(order.tracking_number || '')
                    setEstimatedDeliveryDate(order.estimated_delivery_date || '')
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Order #{order.order_number}</h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm">
                      {order.user_name || 'Guest'}
                      {order.user_email && (
                        <span className="text-gray-500 ml-2">
                          ({order.user_email})
                        </span>
                      )}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {formatCurrency(order.total_amount)}
                    </p>
                  </div>
                  {order.tracking_number && (
                    <div className="mt-2 text-sm">
                      <p className="font-medium">Tracking Number:</p>
                      <p className="text-gray-600">{order.tracking_number}</p>
                    </div>
                  )}
                  {order.estimated_delivery_date && (
                    <div className="mt-1 text-sm">
                      <p className="font-medium">Estimated Delivery:</p>
                      <p className="text-gray-600">
                        {formatDate(order.estimated_delivery_date)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedOrder && (
          <Card>
            <CardHeader>
              <CardTitle>Update Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tracking Number
                  </label>
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    disabled={updatingShipping}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Estimated Delivery Date
                  </label>
                  <Input
                    type="date"
                    value={estimatedDeliveryDate}
                    onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                    disabled={updatingShipping}
                  />
                </div>

                <Button
                  onClick={() => handleShippingUpdate(selectedOrder.id)}
                  disabled={updatingShipping}
                >
                  Update Shipping Information
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 