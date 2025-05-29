'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, subDays } from 'date-fns'
import { CalendarIcon, Package, DollarSign, Users, TrendingUp, ShoppingBag, Clock, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
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

// Types
interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  conversionRate: number
  ordersChange: number
  revenueChange: number
  customersChange: number
  conversionChange: number
}

interface RecentOrder {
  id: number
  order_number: string
  customer_name: string
  total_amount: number
  status: string
  created_at: string
  items: {
    name: string
    quantity: number
  }[]
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
  percentage: number
}

interface CustomerInsight {
  newCustomers: number
  returningCustomers: number
  recentSignups: {
    id: number
    name: string
    email: string
    created_at: string
  }[]
}

interface PerformanceMetrics {
  uptime: number
  cartAbandonmentRate: number
  siteSpeed: number
}

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    conversionRate: 0,
    ordersChange: 0,
    revenueChange: 0,
    customersChange: 0,
    conversionChange: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [categorySales, setCategorySales] = useState<CategorySales[]>([])
  const [customerInsights, setCustomerInsights] = useState<CustomerInsight | null>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  useEffect(() => {
    fetchDashboardData()
  }, [date])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      // Fetch orders
      const ordersRes = await fetch('/api/admin/orders')
      const ordersData = await ordersRes.json()
      
      // Ensure ordersData is an array
      const orders = Array.isArray(ordersData) ? ordersData : []
      
      // Calculate stats
      const totalOrders = orders.length
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0)
      const totalCustomers = new Set(orders.map((order: any) => order.customer_id)).size
      const conversionRate = totalOrders > 0 ? (totalOrders / totalCustomers) * 100 : 0

      // Calculate changes (comparing with previous period)
      const previousPeriodOrders = orders.filter((order: any) => 
        new Date(order.created_at) < new Date(date)
      ).length
      
      const ordersChange = previousPeriodOrders > 0 
        ? ((totalOrders - previousPeriodOrders) / previousPeriodOrders) * 100 
        : 0

      setStats({
        totalOrders,
        totalRevenue,
        totalCustomers,
        conversionRate: Math.round(conversionRate * 100) / 100,
        ordersChange: Math.round(ordersChange * 100) / 100,
        revenueChange: 0, // You can implement this similarly
        customersChange: 0, // You can implement this similarly
        conversionChange: 0 // You can implement this similarly
      })

      // Set recent orders
      setRecentOrders(orders.slice(0, 5).map((order: any) => ({
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at,
        items: order.items || []
      })))

      // Fetch and set top products
      const productsRes = await fetch('/api/admin/products')
      const productsData = await productsRes.json()
      const products = Array.isArray(productsData) ? productsData : []
      setTopProducts(products.slice(0, 5).map((product: any) => ({
        id: product.id,
        name: product.name,
        image_url: product.image_url,
        sales_count: product.sales_count || 0,
        revenue: product.revenue || 0
      })))

      // Fetch and set category sales
      const categoriesRes = await fetch('/api/admin/categories')
      const categoriesData = await categoriesRes.json()
      const categories = Array.isArray(categoriesData) ? categoriesData : []
      setCategorySales(categories.map((category: any) => ({
        category: category.name,
        revenue: category.revenue || 0,
        percentage: category.percentage || 0
      })))

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
    <div className="space-y-8">
      {/* Date Range Picker */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
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
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Select defaultValue="month">
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="h-[140px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {stats.ordersChange > 0 ? '+' : ''}{stats.ordersChange}% from last period
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="h-[140px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.revenueChange > 0 ? '+' : ''}{stats.revenueChange}% from last period
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="h-[140px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.customersChange > 0 ? '+' : ''}{stats.customersChange}% from last period
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="h-[140px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.conversionChange > 0 ? '+' : ''}{stats.conversionChange}% from last period
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Revenue Analytics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { name: 'Jan', revenue: 4000 },
                    { name: 'Feb', revenue: 3000 },
                    { name: 'Mar', revenue: 5000 },
                    { name: 'Apr', revenue: 2780 },
                    { name: 'May', revenue: 1890 },
                    { name: 'Jun', revenue: 2390 },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
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
                    outerRadius={80}
                    label
                  >
                    {categorySales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <div className="text-sm font-medium">
                      {formatCurrency(order.total_amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-12 h-12 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.sales_count} sales • {formatCurrency(product.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Insights and Performance */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'New', value: customerInsights?.newCustomers || 0 },
                        { name: 'Returning', value: customerInsights?.returningCustomers || 0 }
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                    >
                      <Cell fill="#8884d8" />
                      <Cell fill="#82ca9d" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Recent Signups</h3>
                {customerInsights?.recentSignups.map((customer) => (
                  <div key={customer.id} className="text-sm">
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-muted-foreground">{customer.email}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Store Uptime</span>
                </div>
                <span className="text-sm font-medium">{performanceMetrics?.uptime}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Cart Abandonment Rate</span>
                </div>
                <span className="text-sm font-medium">{performanceMetrics?.cartAbandonmentRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Site Speed</span>
                </div>
                <span className="text-sm font-medium">{performanceMetrics?.siteSpeed}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 