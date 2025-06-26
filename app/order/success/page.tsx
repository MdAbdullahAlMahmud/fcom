'use client'
import * as React from 'react'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function OrderSuccessPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OrderSuccessContent />
    </React.Suspense>
  )
}

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams ? searchParams.get('orderNumber') : ''
  const trackingNumber = searchParams ? searchParams.get('trackingNumber') : ''

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
              Order Placed Successfully!
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              Thank you for your order. We'll process it right away.
            </p>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8">
            <dl className="space-y-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Order Number</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {orderNumber}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-8">
            <div className="text-sm text-gray-500">
              <p>What's next?</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>You'll receive an email confirmation shortly</li>
                <li>We'll process your order and update you on its status</li>
                <li>You can track your order using the tracking number above</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex justify-center space-x-4">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue Shopping
            </Link>
            <Link
              href={`/order/track?trackingNumber=${trackingNumber}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Track Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}