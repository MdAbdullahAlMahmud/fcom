'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'

interface OrderDetails {
  order_number: string
  status: string
  total_amount: number
  created_at: string
  items: {
    name: string
    quantity: number
    unit_price: number
    total_price: number
  }[]
  shipping_address: {
    full_name: string
    address_line1: string
    city: string
    state: string
    postal_code: string
    country: string
    phone: string
  }
}

export default function OrderSuccessPage({
  params,
}: {
  params: { orderNumber: string }
}) {
  const router = useRouter()
  const { clearCart } = useCart()
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const cartClearedRef = useRef(false)

  useEffect(() => {
    let isMounted = true

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/frontend/orders/${params.orderNumber}`)
        if (!response.ok) {
          throw new Error('Failed to fetch order details')
        }
        const data = await response.json()
        if (isMounted) {
          setOrderDetails(data)
          if (!cartClearedRef.current) {
            clearCart()
            cartClearedRef.current = true
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchOrderDetails()

    return () => {
      isMounted = false
    }
  }, [params.orderNumber])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-600">
              Thank you for your purchase. Your order has been received.
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Details
                </h2>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-600">Order Number</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {orderDetails.order_number}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Status</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {orderDetails.status}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Date</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {new Date(orderDetails.created_at).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Total Amount</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      ${Number(orderDetails.total_amount).toFixed(2)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Shipping Address
                </h2>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-600">Name</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {orderDetails.shipping_address?.full_name || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Address</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {orderDetails.shipping_address?.address_line1 || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">City</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {orderDetails.shipping_address?.city || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">State</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {orderDetails.shipping_address?.state || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Postal Code</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {orderDetails.shipping_address?.postal_code || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Country</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {orderDetails.shipping_address?.country || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Phone</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {orderDetails.shipping_address?.phone || 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Items
            </h2>
            <div className="space-y-4">
              {orderDetails.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ${Number(item.total_price).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${Number(item.unit_price).toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-6">
            <div className="flex justify-between items-center">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Continue Shopping
              </Link>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
              >
                Print Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 