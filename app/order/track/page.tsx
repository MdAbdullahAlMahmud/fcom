'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface OrderStatus {
  status: string
  created_at: string
  notes: string
}

interface OrderDetails {
  order_number: string
  tracking_number: string
  status: string
  total_amount: number
  created_at: string
  shipping_address: {
    full_name: string
    address_line1: string
    address_line2: string
    city: string
    state: string
    postal_code: string
    country: string
    phone: string
  }
  items: Array<{
    product_name: string
    quantity: number
    unit_price: number
    total_price: number
  }>
  status_history: OrderStatus[]
}

export default function TrackOrderPage() {
  const searchParams = useSearchParams()
  const trackingNumber = searchParams.get('trackingNumber')
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!trackingNumber) {
        setError('No tracking number provided')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/orders/track?trackingNumber=${trackingNumber}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch order details')
        }

        setOrderDetails(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order details')
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [trackingNumber])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
                Error
              </h2>
              <p className="mt-2 text-lg text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!orderDetails) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Order Tracking
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              Tracking Number: {orderDetails.tracking_number}
            </p>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8">
            <dl className="space-y-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Order Number</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {orderDetails.order_number}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {orderDetails.status}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  ${orderDetails.total_amount.toFixed(2)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
            <div className="mt-2 text-sm text-gray-500">
              <p>{orderDetails.shipping_address.full_name}</p>
              <p>{orderDetails.shipping_address.address_line1}</p>
              {orderDetails.shipping_address.address_line2 && (
                <p>{orderDetails.shipping_address.address_line2}</p>
              )}
              <p>
                {orderDetails.shipping_address.city}, {orderDetails.shipping_address.state}{' '}
                {orderDetails.shipping_address.postal_code}
              </p>
              <p>{orderDetails.shipping_address.country}</p>
              <p>{orderDetails.shipping_address.phone}</p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
            <div className="mt-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orderDetails.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.product_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ${item.unit_price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ${item.total_price.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">Order Status History</h3>
            <div className="mt-4">
              <div className="flow-root">
                <ul className="-mb-8">
                  {orderDetails.status_history.map((status, index) => (
                    <li key={index}>
                      <div className="relative pb-8">
                        {index !== orderDetails.status_history.length - 1 && (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center ring-8 ring-white">
                              <svg
                                className="h-5 w-5 text-indigo-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                {status.status}
                                {status.notes && (
                                  <span className="font-medium text-gray-900">
                                    {' '}
                                    - {status.notes}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <time dateTime={status.created_at}>
                                {new Date(status.created_at).toLocaleDateString()}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 