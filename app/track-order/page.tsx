'use client'

import { useState } from 'react'
import {
  Search,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  RefreshCw
} from 'lucide-react'

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

export default function ModernOrderTracker() {
  const [orderNumber, setOrderNumber] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTrackOrder = async () => {
    if (!orderNumber) return

    setLoading(true)
    setError(null)
    setOrder(null)

    try {
      const response = await fetch(`/api/frontend/orders/track?orderNumber=${orderNumber}`)
      const data = await response.json()

      if (!data.success) {
        setError('Order not found. Please check your order number.')
        return
      }

      setOrder(data.order)
    } catch (err) {
      setError('Something went wrong. Please try again later.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <Clock className="w-5 h-5 text-amber-500" />,
      processing: <RefreshCw className="w-5 h-5 text-blue-500" />,
      shipped: <Truck className="w-5 h-5 text-purple-500" />,
      delivered: <CheckCircle className="w-5 h-5 text-green-500" />,
      cancelled: <XCircle className="w-5 h-5 text-red-500" />,
      refunded: <RefreshCw className="w-5 h-5 text-gray-500" />
    }
    return icons[status as keyof typeof icons] || <Clock className="w-5 h-5 text-gray-500" />
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-gradient-to-r from-amber-400 to-amber-500 text-white',
      processing: 'bg-gradient-to-r from-blue-400 to-blue-500 text-white',
      shipped: 'bg-gradient-to-r from-purple-400 to-purple-500 text-white',
      delivered: 'bg-gradient-to-r from-green-400 to-green-500 text-white',
      cancelled: 'bg-gradient-to-r from-red-400 to-red-500 text-white',
      refunded: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
    }
    return colors[status as keyof typeof colors] || 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateTotal = () => {
    if (!order) return 0
    const subtotal = Number(order.total_amount) || 0
    const shipping = Number(order.shipping_fee) || 0
    const tax = Number(order.tax_amount) || 0
    const discount = Number(order.discount_amount) || 0
    return subtotal + shipping + tax - discount
  }

  const formatNumber = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined) return '0.00'
    const num = typeof value === 'string' ? parseFloat(value) : value
    return isNaN(num) ? '0.00' : num.toFixed(2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Track Your Order
            </h1>
            <p className="text-gray-600">Enter your order number to get real-time updates</p>
          </div>

          {/* Search */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Enter your order number (e.g., ORD-123456)"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTrackOrder()}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                />
              </div>
              <button
                onClick={handleTrackOrder}
                disabled={loading || !orderNumber}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Tracking...
                  </div>
                ) : (
                  'Track Order'
                )}
              </button>
            </div>

            {error && <p className="mt-4 text-red-600 text-sm font-medium">{error}</p>}
          </div>

          {/* Order Content */}
          {order && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">

              {/* Order Status */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Order #{order.order_number}</h2>
                      <p className="opacity-90">Placed on {formatDate(order.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(order.status)} font-semibold text-sm`}>
                        {getStatusIcon(order.status)}
                        {order.status.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tracking & Amount */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {order.tracking_number && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <Package className="w-6 h-6 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-600">Tracking Number</p>
                          <p className="font-semibold text-lg">{order.tracking_number}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <span className="w-6 h-6 flex items-center justify-center bg-green-100 text-green-600 rounded-full text-sm font-bold">$</span>
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-semibold text-lg">${formatNumber(calculateTotal())}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-semibold">Shipping Address</h3>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-gray-700">
                  <p className="font-medium text-gray-900">{order.shipping_address_line1}</p>
                  {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
                  <p>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</p>
                  <p>{order.shipping_country}</p>
                </div>
              </div>

              {/* Items */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-xl font-semibold mb-6">Order Items</h3>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      {item.product_image && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-white shadow-sm">
                          <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.product_name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity} × ${formatNumber(Number(item.unit_price))}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">${formatNumber(Number(item.total_price))}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${formatNumber(order.total_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${formatNumber(order.shipping_fee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${formatNumber(order.tax_amount)}</span>
                  </div>
                  {Number(order.discount_amount) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${formatNumber(order.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>${formatNumber(calculateTotal())}</span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-xl font-semibold mb-6">Order Timeline</h3>
                <div className="relative space-y-8">
                  {order.status_history.map((s, index) => (
                    <div key={s.id} className="relative flex gap-4">
                      {index !== order.status_history.length - 1 && (
                        <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200"></div>
                      )}
                      <div className="w-12 h-12 flex items-center justify-center bg-white border-4 border-gray-200 rounded-full shadow-sm">
                        {getStatusIcon(s.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(s.status)}`}>
                            {s.status.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">{formatDate(s.created_at)}</span>
                        </div>
                        <p className="text-gray-700">{s.notes}</p>
                        <p className="text-xs text-gray-500 mt-1">Updated by: {s.updated_by_username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
