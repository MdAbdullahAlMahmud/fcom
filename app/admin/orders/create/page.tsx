'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OrderStatus, PaymentStatus, PaymentMethod } from '@/types/order'
import { formatCurrency } from '@/lib/utils'

interface Product {
  id: number
  name: string
  sku: string
  price: number
  stock_quantity: number
}

interface OrderItem {
  product_id: number
  quantity: number
  price: number
}

export default function CreateOrderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<number | ''>('')
  const [quantity, setQuantity] = useState<number>(1)

  // Pricing
  const [discount, setDiscount] = useState<number>(0)
  const [shippingFee, setShippingFee] = useState<number>(0)
  const [taxRate, setTaxRate] = useState<number>(0)

  // Customer Information
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  // Shipping Address
  const [shippingName, setShippingName] = useState('')
  const [shippingAddress1, setShippingAddress1] = useState('')
  const [shippingAddress2, setShippingAddress2] = useState('')
  const [shippingCity, setShippingCity] = useState('')
  const [shippingState, setShippingState] = useState('')
  const [shippingPostalCode, setShippingPostalCode] = useState('')
  const [shippingCountry, setShippingCountry] = useState('')
  const [shippingPhone, setShippingPhone] = useState('')

  // Order Details
  const [status, setStatus] = useState<OrderStatus>('pending')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      setProducts(data.products)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch products')
    }
  }

  const addProductToOrder = () => {
    if (!selectedProduct || quantity < 1) return

    const product = products.find(p => p.id === selectedProduct)
    if (!product) return

    // Check if product already exists in order
    const existingItemIndex = orderItems.findIndex(item => item.product_id === selectedProduct)
    
    if (existingItemIndex >= 0) {
      // Update quantity if product already exists
      const updatedItems = [...orderItems]
      updatedItems[existingItemIndex].quantity += quantity
      setOrderItems(updatedItems)
    } else {
      // Add new product to order
      setOrderItems([...orderItems, {
        product_id: selectedProduct,
        quantity,
        price: product.price
      }])
    }

    // Reset selection
    setSelectedProduct('')
    setQuantity(1)
  }

  const removeProductFromOrder = (productId: number) => {
    setOrderItems(orderItems.filter(item => item.product_id !== productId))
  }

  const updateProductQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return
    setOrderItems(orderItems.map(item => 
      item.product_id === productId ? { ...item, quantity: newQuantity } : item
    ))
  }

  const calculateSubtotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const calculateTax = () => {
    return (calculateSubtotal() * taxRate) / 100
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const tax = calculateTax()
    return subtotal + tax + shippingFee - discount
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (orderItems.length === 0) {
      setError('Please add at least one product to the order')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // First, create shipping address
      const addressResponse = await fetch('/api/admin/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          full_name: shippingName,
          address_line1: shippingAddress1,
          address_line2: shippingAddress2,
          city: shippingCity,
          state: shippingState,
          postal_code: shippingPostalCode,
          country: shippingCountry,
          phone: shippingPhone,
          address_type: 'shipping',
        }),
      })

      if (!addressResponse.ok) {
        throw new Error('Failed to create shipping address')
      }

      const { id: shippingAddressId } = await addressResponse.json()

      // Create order
      const orderResponse = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          status,
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          shipping_address_id: shippingAddressId,
          billing_address_id: shippingAddressId, // Using same address for billing
          notes,
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
          },
          items: orderItems,
          subtotal: calculateSubtotal(),
          tax: calculateTax(),
          shipping_cost: shippingFee,
          discount: discount,
          total_amount: calculateTotal(),
        }),
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to create order')
      }

      const { orderId } = await orderResponse.json()
      router.push(`/admin/orders/${orderId}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Order</h1>
        <Button variant="outline" onClick={() => router.push('/admin/orders/listing')}>
          Back to Orders
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="product">Select Product</Label>
                <Select
                  value={selectedProduct.toString()}
                  onValueChange={(value) => setSelectedProduct(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} - {formatCurrency(product.price)} (Stock: {product.stock_quantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-32">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
              <div className="flex items-end">
                <Button type="button" onClick={addProductToOrder}>
                  Add Product
                </Button>
              </div>
            </div>

            {orderItems.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-left">Product</th>
                        <th className="p-2 text-right">Price</th>
                        <th className="p-2 text-right">Quantity</th>
                        <th className="p-2 text-right">Total</th>
                        <th className="p-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item) => {
                        const product = products.find(p => p.id === item.product_id)
                        return (
                          <tr key={item.product_id} className="border-b">
                            <td className="p-2">{product?.name}</td>
                            <td className="p-2 text-right">{formatCurrency(item.price)}</td>
                            <td className="p-2 text-right">
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateProductQuantity(item.product_id, Number(e.target.value))}
                                className="w-20 inline-block"
                              />
                            </td>
                            <td className="p-2 text-right">{formatCurrency(item.price * item.quantity)}</td>
                            <td className="p-2 text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeProductFromOrder(item.product_id)}
                              >
                                Remove
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                      <tr className="border-t">
                        <td colSpan={3} className="p-2 text-right">Subtotal:</td>
                        <td className="p-2 text-right">{formatCurrency(calculateSubtotal())}</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="p-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Label htmlFor="taxRate" className="whitespace-nowrap">Tax Rate (%):</Label>
                            <Input
                              id="taxRate"
                              type="number"
                              min="0"
                              max="100"
                              value={taxRate}
                              onChange={(e) => setTaxRate(Number(e.target.value))}
                              className="w-20"
                            />
                          </div>
                        </td>
                        <td className="p-2 text-right">{formatCurrency(calculateTax())}</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="p-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Label htmlFor="shippingFee" className="whitespace-nowrap">Shipping Fee:</Label>
                            <Input
                              id="shippingFee"
                              type="number"
                              min="0"
                              value={shippingFee}
                              onChange={(e) => setShippingFee(Number(e.target.value))}
                              className="w-32"
                            />
                          </div>
                        </td>
                        <td className="p-2 text-right">{formatCurrency(shippingFee)}</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="p-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Label htmlFor="discount" className="whitespace-nowrap">Discount:</Label>
                            <Input
                              id="discount"
                              type="number"
                              min="0"
                              value={discount}
                              onChange={(e) => setDiscount(Number(e.target.value))}
                              className="w-32"
                            />
                          </div>
                        </td>
                        <td className="p-2 text-right">-{formatCurrency(discount)}</td>
                        <td></td>
                      </tr>
                      <tr className="border-t font-semibold">
                        <td colSpan={3} className="p-2 text-right">Total:</td>
                        <td className="p-2 text-right">{formatCurrency(calculateTotal())}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Name</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shippingName">Full Name</Label>
                <Input
                  id="shippingName"
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingPhone">Phone</Label>
                <Input
                  id="shippingPhone"
                  type="tel"
                  value={shippingPhone}
                  onChange={(e) => setShippingPhone(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="shippingAddress1">Address Line 1</Label>
                <Input
                  id="shippingAddress1"
                  value={shippingAddress1}
                  onChange={(e) => setShippingAddress1(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="shippingAddress2">Address Line 2</Label>
                <Input
                  id="shippingAddress2"
                  value={shippingAddress2}
                  onChange={(e) => setShippingAddress2(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingCity">City</Label>
                <Input
                  id="shippingCity"
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingState">State</Label>
                <Input
                  id="shippingState"
                  value={shippingState}
                  onChange={(e) => setShippingState(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingPostalCode">Postal Code</Label>
                <Input
                  id="shippingPostalCode"
                  value={shippingPostalCode}
                  onChange={(e) => setShippingPostalCode(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingCountry">Country</Label>
                <Input
                  id="shippingCountry"
                  value={shippingCountry}
                  onChange={(e) => setShippingCountry(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Order Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as OrderStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select
                  value={paymentStatus}
                  onValueChange={(value) => setPaymentStatus(value as PaymentStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes about this order"
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="text-red-600 text-center">{error}</div>
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/orders/listing')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating Order...' : 'Create Order'}
          </Button>
        </div>
      </form>
    </div>
  )
} 