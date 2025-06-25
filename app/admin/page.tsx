'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Package, DollarSign, Users, ShoppingCart, Tag, TrendingUp, ArrowUpRight, ArrowDownRight, Sparkles, Trophy, Gift, Star } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { differenceInCalendarDays, isToday } from 'date-fns'
import Link from 'next/link'

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'
import { Avatar } from '@/components/ui/avatar'

// Utils
import { formatCurrency } from '@/lib/utils'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  totalCategories: number
  dayWiseOrders: Array<{
    date: string
    count: number
  }>
}

interface RecentOrder {
  id: number
  order_number: string
  customer_name: string
  customer_email: string
  total_amount: number
  status: string
  created_at: string
  items: Array<{
    id: number
    name: string
    quantity: number
  }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658']

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

const celebrateMilestone = (type: string) => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  })
  
  toast.success(`🎉 Milestone Achieved!`, {
    description: `You've reached a new ${type} milestone!`,
    duration: 3000,
  })
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalCategories: 0,
    dayWiseOrders: []
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [todaysOrders, setTodaysOrders] = useState<RecentOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showSparkles, setShowSparkles] = useState(false)
  const [unseenOrderIds, setUnseenOrderIds] = useState<number[]>([])
  const [unverifiedTransactions, setUnverifiedTransactions] = useState<any[] | null>(null);
  const [loadingUnverified, setLoadingUnverified] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchUnverifiedTransactions();
  }, []);

  useEffect(() => {
    // Filter today's orders
    setTodaysOrders(recentOrders.filter(order => isToday(new Date(order.created_at))))
    // Track unseen orders (localStorage MVP)
    const seen = JSON.parse(localStorage.getItem('seenOrderIds') || '[]')
    const unseen = recentOrders.filter(order => !seen.includes(order.id)).map(o => o.id)
    setUnseenOrderIds(unseen)
  }, [recentOrders])

  const markOrdersAsSeen = () => {
    const seen = JSON.parse(localStorage.getItem('seenOrderIds') || '[]')
    const updated = Array.from(new Set([...seen, ...recentOrders.map(o => o.id)]))
    localStorage.setItem('seenOrderIds', JSON.stringify(updated))
    setUnseenOrderIds([])
  }

  const markOrderAsSeen = (orderId: number) => {
    const seen = JSON.parse(localStorage.getItem('seenOrderIds') || '[]')
    if (!seen.includes(orderId)) {
      const updated = [...seen, orderId]
      localStorage.setItem('seenOrderIds', JSON.stringify(updated))
      setUnseenOrderIds(unseenOrderIds.filter(id => id !== orderId))
    }
  }

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      const [statsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/admin/dashboard/recent-orders')
      ])

      if (!statsRes.ok || !ordersRes.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const [statsData, ordersData] = await Promise.all([
        statsRes.json(),
        ordersRes.json()
      ])

      setStats(statsData)
      setRecentOrders(ordersData)

      // Check for milestones
      if (statsData.totalOrders > 0 && statsData.totalOrders % 100 === 0) {
        celebrateMilestone('order')
      }
      if (statsData.totalRevenue > 0 && statsData.totalRevenue % 10000 === 0) {
        celebrateMilestone('revenue')
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchUnverifiedTransactions() {
    setLoadingUnverified(true);
    const params = new URLSearchParams({ status: 'not verified', limit: '10' });
    const res = await fetch(`/api/admin/bkash-nagad/transactions?${params}`);
    const data = await res.json();
    setUnverifiedTransactions(data.transactions || []);
    setLoadingUnverified(false);
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <div className="absolute -top-4 -right-4 animate-pulse">
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-6 w-6 text-yellow-400" />
          </motion.div>
          {unseenOrderIds.length > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs animate-pulse">
              {unseenOrderIds.length} New
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: {format(new Date(), 'MMM d, yyyy h:mm a')}
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
      >
        {/* Total Products */}
        <motion.div 
          variants={item}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card 
            className="hover:shadow-lg transition-all duration-200 cursor-pointer"
            onMouseEnter={() => setShowSparkles(true)}
            onMouseLeave={() => setShowSparkles(false)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <div className="p-2 bg-blue-100 rounded-full">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                <span>Active products</span>
              </div>
              <AnimatePresence>
                {showSparkles && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="absolute top-0 right-0"
                  >
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
        {/* Total Orders */}
        <motion.div variants={item}>
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <div className="p-2 bg-purple-100 rounded-full">
                <ShoppingCart className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                <span>Orders processed</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        {/* Total Revenue */}
        <motion.div 
          variants={item}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <div className="p-2 bg-green-100 rounded-full">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{stats.totalRevenue.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                <span>Total earnings</span>
              </div>
              {stats.totalRevenue > 10000 && (
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-2 right-2"
                >
                  <Trophy className="h-4 w-4 text-yellow-400" />
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        {/* Total Customers */}
        <motion.div variants={item}>
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <div className="p-2 bg-orange-100 rounded-full">
                <Users className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                <span>Active customers</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        {/* Total Categories */}
        <motion.div variants={item}>
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              <div className="p-2 bg-pink-100 rounded-full">
                <Tag className="h-4 w-4 text-pink-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCategories}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                <span>Product categories</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Today's Orders Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="hover:shadow-lg transition-shadow duration-200 bg-white/90 mb-6">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg font-bold">Today's Orders</CardTitle>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                {todaysOrders.length} {todaysOrders.length === 1 ? 'Order' : 'Orders'}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {todaysOrders.length > 0 ? `${todaysOrders.length} placed today` : 'No orders yet today'}
            </div>
          </CardHeader>
          <CardContent>
            {todaysOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Sparkles className="h-8 w-8 text-blue-200 mb-2" />
                <div className="text-gray-500">No orders have been placed today yet.</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50/50">
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todaysOrders.map((order, idx) => (
                      <TableRow
                        key={order.id}
                        className={`hover:bg-blue-50/50 ${unseenOrderIds.includes(order.id) ? 'bg-yellow-100/70' : ''}`}
                      >
                        <TableCell className="font-medium text-blue-700">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="hover:underline text-blue-700"
                            onClick={() => markOrderAsSeen(order.id)}
                          >
                            #{order.order_number}
                            {unseenOrderIds.includes(order.id) && (
                              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-yellow-400 text-white text-[10px] font-semibold align-middle animate-pulse">
                                NEW
                              </span>
                            )}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.customer_name}</div>
                            <div className="text-xs text-muted-foreground">{order.customer_email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-green-700">৳{order.total_amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">{format(new Date(order.created_at), 'h:mm a')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* All Unverified Transactions Card - Full Width, Neutral Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="hover:shadow-lg transition-shadow duration-200 bg-white mb-6 w-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg font-bold">All Unverified Transactions</CardTitle>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
                {unverifiedTransactions?.length || 0} Unverified
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {(Array.isArray(unverifiedTransactions) && unverifiedTransactions.length > 0)
                ? `${unverifiedTransactions.length} unverified`
                : 'No unverified transactions'}
            </div>
          </CardHeader>
          <CardContent>
            {(!unverifiedTransactions || unverifiedTransactions.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Sparkles className="h-8 w-8 text-orange-200 mb-2" />
                <div className="text-gray-500">No unverified transactions found.</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead>Company</TableHead>
                      <TableHead className="text-center">Amount</TableHead>
                      <TableHead>Sender</TableHead>
                      <TableHead>TrxID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Payment Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unverifiedTransactions.map((trx, idx) => (
                      <TableRow
                        key={trx.id}
                        className={
                          idx % 2 === 0
                            ? 'bg-white hover:bg-gray-50 transition-colors'
                            : 'bg-gray-50 hover:bg-gray-100 transition-colors'
                        }
                      >
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${trx.text_company === 'bKash' ? 'bg-pink-100 text-pink-700' : 'bg-yellow-100 text-yellow-800'}`}>{trx.text_company}</span>
                        </TableCell>
                        <TableCell className="font-semibold text-center text-gray-800">৳{Number(trx.amount).toLocaleString()}</TableCell>
                        <TableCell className="text-gray-700">{trx.sender}</TableCell>
                        <TableCell className="font-mono text-xs text-blue-700">{trx.TrxID}</TableCell>
                        <TableCell className="text-gray-700">{trx.name}</TableCell>
                        <TableCell className="text-gray-700">{trx.phone}</TableCell>
                        <TableCell className="text-gray-500 whitespace-nowrap">{trx.payment_time ? new Date(trx.payment_time).toLocaleString() : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2 text-purple-600" />
              Recent Orders
              {unseenOrderIds.length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs animate-pulse">
                  {unseenOrderIds.length} New
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`hover:bg-gray-50/50`}
                    >
                      <TableCell className="font-medium">#{order.order_number}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer_name}</div>
                          <div className="text-sm text-muted-foreground">{order.customer_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {order.items.map((item) => (
                            <Badge 
                              key={item.id} 
                              variant="secondary" 
                              className="bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                              {item.name} x {item.quantity}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">৳{order.total_amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(order.created_at), 'MMM d, yyyy')}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
