'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface OrderItem {
  id: number
  product_name: string
  product_image: string
  quantity: number
  unit_price: number
  total_price: number
}

interface StatusHistory {
  id: number
  status: string
  notes: string
  created_at: string
  updated_by_username: string
}

interface Order {
  id: number
  order_number: string
  tracking_number: string
  status: string
  total_amount: number
  shipping_fee: number
  tax_amount: number
  discount_amount: number
  payment_status: string
  payment_method: string
  created_at: string
  username: string
  email: string
  phone: string
  shipping_address_line1: string
  shipping_address_line2: string
  shipping_city: string
  shipping_state: string
  shipping_postal_code: string
  shipping_country: string
  items: OrderItem[]
  status_history: StatusHistory[]
}

export default function TrackOrderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderNumber, setOrderNumber] = useState(searchParams.get('orderNumber') || '')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)

  const handleTrackOrder = async () => {
    if (!orderNumber) {
      toast.error('Please enter an order number')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/frontend/orders/track?orderNumber=${orderNumber}`)
      const data = await response.json()

      if (!data.success) {
        toast.error(data.message)
        return
      }

      setOrder(data.order)
      router.push(`/track-order?orderNumber=${orderNumber}`, { scroll: false })
    } catch (error) {
      toast.error('Failed to fetch order details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      processing: 'bg-blue-500',
      shipped: 'bg-purple-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500',
      refunded: 'bg-gray-500'
    }
    return colors[status] || 'bg-gray-500'
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Track Your Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your order number"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTrackOrder()}
              />
              <Button onClick={handleTrackOrder} disabled={loading}>
                {loading ? 'Tracking...' : 'Track Order'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {order && (
          <div className="mt-8 space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order Number</p>
                    <p className="font-medium">{order.order_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="font-medium">
                      {format(new Date(order.created_at), 'PPP')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.toUpperCase()}
                    </Badge>
                  </div>
                  {order.tracking_number && (
                    <div>
                      <p className="text-sm text-gray-500">Tracking Number</p>
                      <p className="font-medium">{order.tracking_number}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{order.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{order.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{order.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{order.shipping_address_line1}</p>
                {order.shipping_address_line2 && (
                  <p>{order.shipping_address_line2}</p>
                )}
                <p>
                  {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
                </p>
                <p>{order.shipping_country}</p>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity} × ${item.unit_price}
                        </p>
                      </div>
                      <p className="font-medium">${item.total_price}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between">
                    <p>Subtotal</p>
                    <p>${order.total_amount}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Shipping</p>
                    <p>${order.shipping_fee}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Tax</p>
                    <p>${order.tax_amount}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Discount</p>
                    <p>-${order.discount_amount}</p>
                  </div>
                  <div className="flex justify-between font-bold mt-2">
                    <p>Total</p>
                    <p>
                      $
                      {(
                        order.total_amount +
                        order.shipping_fee +
                        order.tax_amount -
                        order.discount_amount
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status History */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.status_history.map((status) => (
                    <div key={status.id} className="flex items-start gap-4">
                      <div className="w-2 h-2 rounded-full bg-gray-300 mt-2" />
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(status.status)}>
                            {status.status.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {format(new Date(status.created_at), 'PPP p')}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{status.notes}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Updated by: {status.updated_by_username}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 