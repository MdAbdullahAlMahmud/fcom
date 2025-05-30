'use client'

import { useEffect, useState } from 'react'
import { format, subDays } from 'date-fns'
import { CalendarIcon, Package, DollarSign, Users, ShoppingCart, Activity, CreditCard, UserPlus, Settings, LogOut, Bell, Search, ChevronDown, Filter, MoreVertical, TrendingUp, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts'

// Utils
import { cn } from "@/lib/utils"
import { formatCurrency } from '@/lib/utils'

// Types
interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  totalProducts: number
  conversionRate: number
  ordersChange: number
  revenueChange: number
  customersChange: number
  productsChange: number
  conversionChange: number
}

interface RecentOrder {
  id: number
  orderNumber: string
  customerName: string
  customerEmail: string
  total: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  date: string
  items: Array<{
    id: number
    name: string
    quantity: number
  }>
}

interface TopProduct {
  id: number
  name: string
  image_url: string
  sales_count: number
  revenue: number
}

interface CategorySales {
  category: string
  revenue: number
}

interface CustomerInsight {
  totalCustomers: number
  newCustomers: number
  returningCustomers: number
  averageOrderValue: number
}

interface PerformanceMetrics {
  pageViews: number
  bounceRate: number
  averageSessionDuration: number
  conversionRate: number
}

interface TopCustomer {
  id: number
  name: string
  email: string
  totalSpent: number
  orders: number
  lastOrder: string
}

interface ActivityItem {
  id: number
  user: string
  action: string
  target: string
  time: string
  avatar: string
}

// Mock data
const recentOrders: RecentOrder[] = [
  {
    id: 1,
    orderNumber: '#ORD-001',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    total: 125.99,
    status: 'completed',
    date: '2025-05-29',
    items: [
      { id: 1, name: 'Wireless Headphones', quantity: 2 },
      { id: 2, name: 'Smartphone X', quantity: 1 }
    ]
  },
  {
    id: 2,
    orderNumber: '#ORD-002',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    total: 89.50,
    status: 'processing',
    date: '2025-05-29',
    items: [
      { id: 3, name: 'Wireless Headphones', quantity: 1 },
      { id: 4, name: 'Smartphone X', quantity: 1 }
    ]
  },
  {
    id: 3,
    orderNumber: '#ORD-003',
    customerName: 'Robert Johnson',
    customerEmail: 'robert@example.com',
    total: 210.00,
    status: 'pending',
    date: '2025-05-28',
    items: [
      { id: 5, name: 'Wireless Headphones', quantity: 3 },
      { id: 6, name: 'Smartphone X', quantity: 2 }
    ]
  },
  {
    id: 4,
    orderNumber: '#ORD-004',
    customerName: 'Emily Davis',
    customerEmail: 'emily@example.com',
    total: 45.99,
    status: 'completed',
    date: '2025-05-28',
    items: [
      { id: 7, name: 'Wireless Headphones', quantity: 1 },
      { id: 8, name: 'Smartphone X', quantity: 1 }
    ]
  },
  {
    id: 5,
    orderNumber: '#ORD-005',
    customerName: 'Michael Brown',
    customerEmail: 'michael@example.com',
    total: 156.75,
    status: 'cancelled',
    date: '2025-05-27',
    items: [
      { id: 9, name: 'Wireless Headphones', quantity: 2 },
      { id: 10, name: 'Smartphone X', quantity: 1 }
    ]
  }
]

const topCustomers: TopCustomer[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    totalSpent: 1250.50,
    orders: 12,
    lastOrder: '2025-05-29'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    totalSpent: 980.25,
    orders: 8,
    lastOrder: '2025-05-29'
  },
  {
    id: 3,
    name: 'Robert Johnson',
    email: 'robert@example.com',
    totalSpent: 750.75,
    orders: 5,
    lastOrder: '2025-05-28'
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily@example.com',
    totalSpent: 520.00,
    orders: 4,
    lastOrder: '2025-05-28'
  },
  {
    id: 5,
    name: 'Michael Brown',
    email: 'michael@example.com',
    totalSpent: 420.50,
    orders: 3,
    lastOrder: '2025-05-27'
  }
]

const recentActivities: ActivityItem[] = [
  {
    id: 1,
    user: 'John Doe',
    action: 'placed a new order',
    target: '#ORD-006',
    time: '5 minutes ago',
    avatar: '/avatars/01.png'
  },
  {
    id: 2,
    user: 'Jane Smith',
    action: 'updated order status to',
    target: 'Processing',
    time: '1 hour ago',
    avatar: '/avatars/02.png'
  },
  {
    id: 3,
    user: 'Robert Johnson',
    action: 'added a new product',
    target: 'Wireless Headphones',
    time: '3 hours ago',
    avatar: '/avatars/03.png'
  },
  {
    id: 4,
    user: 'Emily Davis',
    action: 'updated inventory for',
    target: 'Smartphone X',
    time: '5 hours ago',
    avatar: '/avatars/04.png'
  },
  {
    id: 5,
    user: 'Michael Brown',
    action: 'created a new discount',
    target: 'SUMMER25',
    time: '1 day ago',
    avatar: '/avatars/05.png'
  }
]

const salesData = [
  { name: 'Jan', revenue: 4000, orders: 2400 },
  { name: 'Feb', revenue: 3000, orders: 1398 },
  { name: 'Mar', revenue: 2000, orders: 9800 },
  { name: 'Apr', revenue: 2780, orders: 3908 },
  { name: 'May', revenue: 1890, orders: 4800 },
  { name: 'Jun', revenue: 2390, orders: 3800 },
  { name: 'Jul', revenue: 3490, orders: 4300 },
]

const categoryData = [
  { name: 'Electronics', value: 400 },
  { name: 'Clothing', value: 300 },
  { name: 'Books', value: 200 },
  { name: 'Home & Kitchen', value: 100 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function AdminDashboard() {
  const [date, setDate] = useState<Date>()
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    conversionRate: 0,
    ordersChange: 0,
    revenueChange: 0,
    customersChange: 0,
    productsChange: 0,
    conversionChange: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [categorySales, setCategorySales] = useState<CategorySales[]>([])
  const [customerInsights, setCustomerInsights] = useState<CustomerInsight | null>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [date])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch all data in parallel
      const [statsRes, ordersRes, productsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/admin/dashboard/recent-orders'),
        fetch('/api/admin/dashboard/top-products'),
        fetch('/api/admin/dashboard/category-sales')
      ])

      if (!statsRes.ok || !ordersRes.ok || !productsRes.ok || !categoriesRes.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const [statsData, ordersData, productsData, categoriesData] = await Promise.all([
        statsRes.json(),
        ordersRes.json(),
        productsRes.json(),
        categoriesRes.json()
      ])

      setStats(statsData)
      setRecentOrders(ordersData)
      setTopProducts(productsData)
      setCategorySales(categoriesData)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Date Range Selector */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {stats.ordersChange >= 0 ? '+' : ''}{stats.ordersChange}% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.revenueChange >= 0 ? '+' : ''}{stats.revenueChange}% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.customersChange >= 0 ? '+' : ''}{stats.customersChange}% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.conversionChange >= 0 ? '+' : ''}{stats.conversionChange}% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Category Sales Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Category Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySales}
                    dataKey="revenue"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categorySales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div key={product.id} className="flex items-center">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.sales_count} sales • {formatCurrency(product.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="col-span-7">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Order #{order.orderNumber}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.customerName} • {order.customerEmail}
                    </p>
                    <div className="flex items-center space-x-2">
                      {order.items.map((item) => (
                        <Badge key={item.id} variant="secondary">
                          {item.name} x {item.quantity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(order.total)}</p>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 