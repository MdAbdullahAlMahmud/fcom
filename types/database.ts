export interface Category {
  id: number
  name: string
  image: string | null
  created_at: Date
}

export interface Product {
  id: number
  category_id: number | null
  title: string
  description: string | null
  regular_price: number
  offer_price: number
  stock: number
  additional_text: string | null
  created_at: Date
}

export interface Image {
  id: number
  product_id: number | null
  image_url: string
  created_at: Date
}

export interface Order {
  id: number
  user_id: number | null
  user_name: string
  mobile: string
  full_address: string
  notes: string | null
  shipping_type: 'standard' | 'express'
  payment_method: 'cash_on_delivery' | 'online'
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  order_date: Date
  tracking_number: string | null
  created_at: Date
}

export interface OrderItem {
  id: number
  order_id: number | null
  product_id: number | null
  quantity: number
  price_at_time: number
  created_at: Date
}

export interface User {
  id: number
  username: string
  password: string
  email: string
  phone: string | null
  role: 'user' | 'admin'
  status: 'active' | 'inactive'
  created_at: Date
}

export interface Setting {
  id: number
  setting_key: string
  setting_value: string
  created_at: Date
  updated_at: Date
}

export interface Slider {
  id: number
  image: string
  title: string | null
  description: string | null
  sn: number
  created_at: Date
} 