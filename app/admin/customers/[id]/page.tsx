'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Address {
  id: number
  address_type: 'shipping' | 'billing'
  full_name: string
  address_line1: string
  address_line2: string | null
  city: string
  state: string
  postal_code: string
  country: string
  phone: string
  is_default: boolean
}

interface OrderItem {
  id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
}

interface Order {
  id: number
  order_number: string
  status: string
  total_amount: number
  payment_status: string
  created_at: string
  items: OrderItem[]
}

interface Customer {
  id: number
  name: string
  email: string
  phone: string
  total_orders: number
  total_spent: number
  last_order_date: string
  created_at: string
  addresses: Address[]
  recent_orders: Order[]
}

export default function CustomerDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCustomerDetails()
  }, [params.id])

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/customers/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch customer details')
      }

      const data = await response.json()
      setCustomer(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
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
          <div className="text-lg">Loading customer details...</div>
        </div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">{error || 'Customer not found'}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer Details</h1>
        <Button variant="outline" onClick={() => router.push('/admin/customers/listing')}>
          Back to Customers
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Basic Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {customer.name}</p>
                  <p><span className="font-medium">Email:</span> {customer.email}</p>
                  <p><span className="font-medium">Phone:</span> {customer.phone}</p>
                  <p><span className="font-medium">Member Since:</span> {formatDate(customer.created_at)}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Order Statistics</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Total Orders:</span> {customer.total_orders}</p>
                  <p><span className="font-medium">Total Spent:</span> {formatCurrency(customer.total_spent)}</p>
                  <p><span className="font-medium">Last Order:</span> {customer.last_order_date ? formatDate(customer.last_order_date) : 'No orders'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.addresses.map((address) => (
                <div key={address.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium capitalize">{address.address_type} Address</h3>
                    {address.is_default && (
                      <Badge>Default</Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p>{address.full_name}</p>
                    <p>{address.address_line1}</p>
                    {address.address_line2 && <p>{address.address_line2}</p>}
                    <p>{address.city}, {address.state} {address.postal_code}</p>
                    <p>{address.country}</p>
                    <p>{address.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.recent_orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.order_number}
                      </TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            order.payment_status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {order.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/orders/${order.id}`)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 