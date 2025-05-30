'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  shipping_address_line1: string
  shipping_address_line2: string
  shipping_city: string
  shipping_state: string
  shipping_postal_code: string
  shipping_country: string
  items: OrderItem[]
}

export default function MyOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // Fetch orders
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/frontend/orders/my-orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()

        if (!data.success) {
          toast.error(data.message)
          return
        }

        setOrders(data.orders)
      } catch (error) {
        toast.error('Failed to fetch orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [router])

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

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <div className="space-y-6">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-500">No orders found</p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Order #{order.order_number}</CardTitle>
                    <p className="text-sm text-gray-500">
                      {format(new Date(order.created_at), 'PPP')}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-2">
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

                  {/* Order Summary */}
                  <div className="border-t pt-4">
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

                  {/* Shipping Address */}
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-2">Shipping Address</h3>
                    <p>{order.shipping_address_line1}</p>
                    {order.shipping_address_line2 && (
                      <p>{order.shipping_address_line2}</p>
                    )}
                    <p>
                      {order.shipping_city}, {order.shipping_state}{' '}
                      {order.shipping_postal_code}
                    </p>
                    <p>{order.shipping_country}</p>
                  </div>

                  {/* Tracking Number */}
                  {order.tracking_number && (
                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-2">Tracking Number</h3>
                      <p>{order.tracking_number}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 