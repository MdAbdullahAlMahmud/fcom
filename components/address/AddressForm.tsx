'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface AddressFormData {
  full_name: string
  phone: string
  email: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  postal_code: string
  country: string
}

export default function AddressForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<AddressFormData>({
    full_name: '',
    phone: '',
    email: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Bangladesh'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      toast.error('Full name is required')
      return false
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number is required')
      return false
    }
    if (!/^01[3-9]\d{8}$/.test(formData.phone)) {
      toast.error('Please enter a valid Bangladeshi phone number')
      return false
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return false
    }
    if (!formData.address_line1.trim()) {
      toast.error('Address line 1 is required')
      return false
    }
    if (!formData.city.trim()) {
      toast.error('City is required')
      return false
    }
    if (!formData.state.trim()) {
      toast.error('State/Province is required')
      return false
    }
    if (!formData.postal_code.trim()) {
      toast.error('Postal code is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          address_type: 'shipping',
          is_default: true
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create address')
      }

      toast.success('Address added successfully')
      router.push('/order/new')
    } catch (error) {
      console.error('Error creating address:', error)
      toast.error('Failed to create address')
    } finally {
      setIsLoading(false)
    }
  }

  return (
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

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Address'}
        </button>
      </div>
    </form>
  )
} 