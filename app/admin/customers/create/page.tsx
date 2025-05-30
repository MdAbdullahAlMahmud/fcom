'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Address {
  address_type: 'shipping' | 'billing'
  full_name: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  postal_code: string
  country: string
  phone: string
  is_default: boolean
}

export default function CreateCustomerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([
    {
      address_type: 'shipping',
      full_name: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      phone: '',
      is_default: true
    },
    {
      address_type: 'billing',
      full_name: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      phone: '',
      is_default: false
    }
  ])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const customerData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        addresses: addresses
      }

      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify(customerData)
      })

      if (!response.ok) {
        throw new Error('Failed to create customer')
      }

      toast({
        title: 'Success',
        description: 'Customer created successfully',
      })

      router.push('/admin/customers/listing')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create customer',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateAddress = (index: number, field: keyof Address, value: string | boolean) => {
    const newAddresses = [...addresses]
    newAddresses[index] = {
      ...newAddresses[index],
      [field]: value
    }
    setAddresses(newAddresses)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add New Customer</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the customer's basic contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Addresses</CardTitle>
              <CardDescription>
                Add shipping and billing addresses for the customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="shipping" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="shipping">Shipping Address</TabsTrigger>
                  <TabsTrigger value="billing">Billing Address</TabsTrigger>
                </TabsList>
                {addresses.map((address, index) => (
                  <TabsContent key={address.address_type} value={address.address_type}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Full Name</Label>
                          <Input
                            value={address.full_name}
                            onChange={(e) => updateAddress(index, 'full_name', e.target.value)}
                            placeholder="Enter full name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input
                            value={address.phone}
                            onChange={(e) => updateAddress(index, 'phone', e.target.value)}
                            placeholder="Enter phone number"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Address Line 1</Label>
                        <Input
                          value={address.address_line1}
                          onChange={(e) => updateAddress(index, 'address_line1', e.target.value)}
                          placeholder="Enter street address"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Address Line 2</Label>
                        <Input
                          value={address.address_line2}
                          onChange={(e) => updateAddress(index, 'address_line2', e.target.value)}
                          placeholder="Apartment, suite, unit, etc. (optional)"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Input
                            value={address.city}
                            onChange={(e) => updateAddress(index, 'city', e.target.value)}
                            placeholder="Enter city"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>State/Province</Label>
                          <Input
                            value={address.state}
                            onChange={(e) => updateAddress(index, 'state', e.target.value)}
                            placeholder="Enter state"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Postal Code</Label>
                          <Input
                            value={address.postal_code}
                            onChange={(e) => updateAddress(index, 'postal_code', e.target.value)}
                            placeholder="Enter postal code"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Select
                          value={address.country}
                          onValueChange={(value) => updateAddress(index, 'country', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BD">Bangladesh</SelectItem>
                            {/* Add more countries as needed */}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`default-${address.address_type}`}
                          checked={address.is_default}
                          onChange={(e) => updateAddress(index, 'is_default', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`default-${address.address_type}`}>
                          Set as default {address.address_type} address
                        </Label>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/customers/listing')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Customer'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
} 