'use client'

import { useCart } from '@/contexts/CartContext'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Bangladesh'
  })

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Add some products to your cart to continue shopping.</p>
        <button
          onClick={() => router.push('/products')}
          className="inline-block bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  const validateForm = () => {
    console.log('Validating form data:', formData)
    
    if (!formData.full_name.trim()) {
      console.log('Validation failed: Full name is empty')
      toast.error('Full name is required')
      return false
    }
    if (!formData.phone.trim()) {
      console.log('Validation failed: Phone is empty')
      toast.error('Phone number is required')
      return false
    }
    if (!/^01[3-9]\d{6,8}$/.test(formData.phone)) {
      console.log('Validation failed: Invalid phone format:', formData.phone)
      const currentLength = formData.phone.length
      if (currentLength < 10) {
        toast.error(`Phone number must be at least 10 digits. Current length: ${currentLength}`)
      } else if (currentLength > 11) {
        toast.error(`Phone number must not exceed 11 digits. Current length: ${currentLength}`)
      } else {
        toast.error('Please enter a valid Bangladeshi phone number starting with 01 followed by 3-9')
      }
      return false
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      console.log('Validation failed: Invalid email format:', formData.email)
      toast.error('Please enter a valid email address')
      return false
    }
    if (!formData.address_line1.trim()) {
      console.log('Validation failed: Address line 1 is empty')
      toast.error('Address line 1 is required')
      return false
    }
    if (!formData.city.trim()) {
      console.log('Validation failed: City is empty')
      toast.error('City is required')
      return false
    }
    if (!formData.state.trim()) {
      console.log('Validation failed: State is empty')
      toast.error('State/Province is required')
      return false
    }
    if (!formData.postal_code.trim()) {
      console.log('Validation failed: Postal code is empty')
      toast.error('Postal code is required')
      return false
    }
    
    console.log('Form validation passed')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submission started')
    console.log('Current form data:', formData)
    
    if (!validateForm()) {
      console.log('Form validation failed - stopping submission')
      return
    }

    if (items.length === 0) {
      console.log('No items in cart - stopping submission')
      toast.error('Your cart is empty')
      return
    }

    setIsSubmitting(true)
    console.log('Form data:', formData)
    console.log('Cart items:', items)
    
    try {
      // Format the address as expected by the API
      const formattedAddress = [
        formData.address_line1,
        [
          formData.address_line2,
          formData.city,
          formData.state,
          formData.postal_code
        ].filter(Boolean).join(', ')
      ].filter(Boolean).join('\n')

      const requestData = {
        items: items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.sale_price || item.price
        })),
        total,
        customer: {
          name: formData.full_name,
          email: formData.email || `${formData.phone}@temp.com`,
          phone: formData.phone,
          address: formattedAddress
        }
      }
      
      console.log('Sending request with data:', requestData)

      const response = await fetch('/api/frontend/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      console.log('Response status:', response.status)
      const responseData = await response.json()
      console.log('Response data:', responseData)

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create order')
      }

      if (!responseData.success) {
        throw new Error(responseData.message || 'Failed to create order')
      }

      const { orderNumber, trackingNumber } = responseData
      clearCart()
      router.push(`/order/success?orderNumber=${orderNumber}&trackingNumber=${trackingNumber}`)
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    console.log('Form field changed:', name, value)
    setFormData(prev => {
      const newData = { ...prev, [name]: value }
      console.log('Updated form data:', newData)
      return newData
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="01XXXXXXXXX"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Address Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Address Details</h3>
              <div>
                <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  id="address_line1"
                  name="address_line1"
                  value={formData.address_line1}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  id="address_line2"
                  name="address_line2"
                  value={formData.address_line2}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Location Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    id="postal_code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    disabled
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white px-8 py-3 rounded-full transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium">
                    ${((item.sale_price || item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 