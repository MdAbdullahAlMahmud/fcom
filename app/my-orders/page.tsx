'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Package, Truck, Calendar, MapPin, CreditCard, Receipt } from 'lucide-react'

interface OrderItem {
  id: number
  product_name: string
  product_image: string
  quantity: number
  unit_price: number
  total_price: number
  product_type?: 'default' | 'digital'
  download_link?: string
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
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      refunded: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-amber-100 text-amber-700',
      failed: 'bg-red-100 text-red-700',
      refunded: 'bg-gray-100 text-gray-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  // Safe number conversion and calculation function
  const safeCalculateTotal = (order: Order) => {
    const totalAmount = Number(order.total_amount) || 0
    const shippingFee = Number(order.shipping_fee) || 0
    const taxAmount = Number(order.tax_amount) || 0
    const discountAmount = Number(order.discount_amount) || 0
    
    return (totalAmount + shippingFee + taxAmount - discountAmount).toFixed(2)
  }

  const formatCurrency = (amount: number | string) => {
    const num = Number(amount) || 0
    return num.toFixed(2)
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
          <p className="text-center text-gray-600 mt-4">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          </div>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        <div className="space-y-6">
          {orders.length === 0 ? (
            <Card className="border-purple-200 shadow-lg">
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4">
                    <Package className="w-8 h-8 text-purple-600 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-500">You haven't placed any orders yet</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <CardTitle className="text-xl font-bold">
                        Order #{order.order_number}
                      </CardTitle>
                      <div className="flex items-center space-x-2 text-purple-100">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {format(new Date(order.created_at), 'PPP')}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 text-right">
                      <Badge className={`${getStatusColor(order.status)} border font-medium`}>
                        {order.status.toUpperCase()}
                      </Badge>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Order Items */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                        <Receipt className="w-4 h-4 text-purple-600" />
                        <span>Items Ordered</span>
                      </h3>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            {item.product_image && (
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="w-16 h-16 object-cover rounded-lg border-2 border-purple-200"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 flex items-center gap-2">
                                {item.product_name}
                                {item.product_type === 'digital' && item.download_link && (
                                  <>
                                    <a
                                      href={item.download_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                                    >
                                      Download
                                    </a>
                                    <button
                                      type="button"
                                      className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200 border border-blue-200 shadow-sm"
                                      onClick={() => {
                                        navigator.clipboard.writeText(item.download_link!);
                                        toast.success('Download link copied!');
                                      }}
                                      title="Copy download link"
                                    >
                                      Copy Link
                                    </button>
                                  </>
                                )}
                              </p>
                              <p className="text-sm text-gray-500">
                                Quantity: {item.quantity} × ${formatCurrency(item.unit_price)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-purple-600">${formatCurrency(item.total_price)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                      <div className="bg-purple-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-gray-700">
                          <span>Subtotal</span>
                          <span>${formatCurrency(order.total_amount)}</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                          <span>Shipping Fee</span>
                          <span>${formatCurrency(order.shipping_fee)}</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                          <span>Tax</span>
                          <span>${formatCurrency(order.tax_amount)}</span>
                        </div>
                        {Number(order.discount_amount) > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span>-${formatCurrency(order.discount_amount)}</span>
                          </div>
                        )}
                        <div className="border-t border-purple-200 pt-2">
                          <div className="flex justify-between font-bold text-lg text-purple-700">
                            <span>Total</span>
                            <span>${safeCalculateTotal(order)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Shipping Address */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-purple-600" />
                          <span>Shipping Address</span>
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 space-y-1">
                          <p>{order.shipping_address_line1}</p>
                          {order.shipping_address_line2 && (
                            <p>{order.shipping_address_line2}</p>
                          )}
                          <p>
                            {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
                          </p>
                          <p className="font-medium">{order.shipping_country}</p>
                        </div>
                      </div>

                      {/* Payment & Tracking */}
                      <div className="space-y-4">
                        {/* Payment Method */}
                        <div>
                          <h3 className="font-semibold text-gray-900 flex items-center space-x-2 mb-2">
                            <CreditCard className="w-4 h-4 text-purple-600" />
                            <span>Payment Method</span>
                          </h3>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-700 capitalize">{order.payment_method}</p>
                          </div>
                        </div>

                        {/* Tracking Number */}
                        {order.tracking_number && (
                          <div>
                            <h3 className="font-semibold text-gray-900 flex items-center space-x-2 mb-2">
                              <Truck className="w-4 h-4 text-purple-600" />
                              <span>Tracking Number</span>
                            </h3>
                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                              <p className="text-sm font-mono text-purple-700">{order.tracking_number}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}