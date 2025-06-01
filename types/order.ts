export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type PaymentMethod = 'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery'
export type AddressType = 'shipping' | 'billing'

export interface Address {
  id?: number
  user_id: number
  address_type: AddressType
  full_name: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone: string
  is_default?: boolean
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  unit_price: number
  total_price: number
  product_name: string
  product_sku: string
  created_at: string
  updated_at: string
}

export interface OrderStatusHistory {
  id: number
  order_id: number
  status: OrderStatus
  notes: string | null
  created_by: number
  created_at: string
  updated_by_name: string | null
}

export interface Order {
  id: number
  order_number: string
  user_id: number | null
  user_name: string | null
  user_email: string | null
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: PaymentMethod
  shipping_address_id: number
  billing_address_id: number
  shipping_name: string
  shipping_address1: string
  shipping_address2: string | null
  shipping_city: string
  shipping_state: string
  shipping_postal_code: string
  shipping_country: string
  shipping_phone: string
  billing_name: string
  billing_address1: string
  billing_address2: string | null
  billing_city: string
  billing_state: string
  billing_postal_code: string
  billing_country: string
  billing_phone: string
  subtotal: number
  tax_amount: number
  shipping_fee: number
  discount_amount: number
  total_amount: number
  notes: string | null
  tracking_number: string | null
  estimated_delivery_date: string | null
  created_at: string
  updated_at: string
  items: OrderItem[]
  statusHistory: OrderStatusHistory[]
  // Optional: for admin listing, backend can provide a display string for payment method
  payment_method_display?: string
} 