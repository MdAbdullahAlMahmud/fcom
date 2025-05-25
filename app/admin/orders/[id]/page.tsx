'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Order, OrderStatus } from '@/types/order'

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [notes, setNotes] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('')

  useEffect(() => {
    fetchOrderDetails()
  }, [params.id])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/orders/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch order details')
      }
      const data = await response.json()
      setOrder(data)
      setNotes(data.notes || '')
      setTrackingNumber(data.tracking_number || '')
      setEstimatedDeliveryDate(data.estimated_delivery_date || '')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (status: OrderStatus) => {
    try {
      setUpdatingStatus(true)
      const response = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          notes,
          tracking_number: trackingNumber,
          estimated_delivery_date: estimatedDeliveryDate,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      await fetchOrderDetails()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return
    }

    try {
      setUpdatingStatus(true)
      const response = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to cancel order')
      }

      await fetchOrderDetails()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to cancel order')
    } finally {
      setUpdatingStatus(false)
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
          <div className="text-lg">Loading order details...</div>
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

  if (!order) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Order not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
        <Button variant="outline" onClick={() => router.push('/admin/orders/listing')}>
          Back to Orders
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{formatDate(order.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Amount:</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Payment Status:</span>
                <Badge className={order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {order.payment_status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.user_name && (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{order.user_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{order.user_email}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>{order.shipping_name}</p>
              <p>{order.shipping_address1}</p>
              {order.shipping_address2 && <p>{order.shipping_address2}</p>}
              <p>
                {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
              </p>
              <p>{order.shipping_country}</p>
              <p>{order.shipping_phone}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-gray-500">SKU: {item.product_sku}</p>
                  </div>
                  <div className="text-right">
                    <p>{item.quantity} x {formatCurrency(item.unit_price)}</p>
                    <p className="font-medium">{formatCurrency(item.total_price)}</p>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.total_amount - order.shipping_fee - order.tax_amount + order.discount_amount)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping:</span>
                  <span>{formatCurrency(order.shipping_fee)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Tax:</span>
                  <span>{formatCurrency(order.tax_amount)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between mb-2">
                    <span>Discount:</span>
                    <span>-{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select
                  value={order.status}
                  onValueChange={(value) => handleStatusChange(value as OrderStatus)}
                  disabled={updatingStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tracking Number</label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  disabled={updatingStatus}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Estimated Delivery Date</label>
                <Input
                  type="date"
                  value={estimatedDeliveryDate}
                  onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                  disabled={updatingStatus}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this order"
                  disabled={updatingStatus}
                />
              </div>

              <Button
                variant="destructive"
                onClick={handleCancelOrder}
                disabled={updatingStatus || order.status === 'cancelled'}
              >
                Cancel Order
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.statusHistory?.map((history) => (
                <div key={history.id} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className={getStatusColor(history.status)}>
                        {history.status}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(history.created_at)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      by {history.updated_by_name || 'System'}
                    </p>
                  </div>
                  {history.notes && (
                    <p className="text-sm mt-2">{history.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 