import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { query } from '@/lib/db/mysql'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

async function verifyAuth() {
  const token = cookies().get('auth-token')?.value

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export async function GET() {
  try {
    const payload = await verifyAuth()
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get total orders
    const [ordersCount] = await query('SELECT COUNT(*) as total FROM orders')
    const totalOrders = ordersCount.total

    // Get total revenue
    const [revenueResult] = await query('SELECT SUM(total_amount) as total FROM orders')
    const totalRevenue = revenueResult.total || 0

    // Get total customers
    const [customersCount] = await query('SELECT COUNT(*) as total FROM users WHERE role = "USER"')
    const totalCustomers = customersCount.total

    // Calculate conversion rate
    const conversionRate = totalOrders > 0 ? (totalOrders / totalCustomers) * 100 : 0

    // Get previous period stats (30 days ago)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [previousOrdersCount] = await query(
      'SELECT COUNT(*) as total FROM orders WHERE created_at < ?',
      [thirtyDaysAgo]
    )

    const ordersChange = previousOrdersCount.total > 0 
      ? ((totalOrders - previousOrdersCount.total) / previousOrdersCount.total) * 100 
      : 0

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      totalCustomers,
      conversionRate: Math.round(conversionRate * 100) / 100,
      ordersChange: Math.round(ordersChange * 100) / 100,
      revenueChange: 0, // Implement if needed
      customersChange: 0, // Implement if needed
      conversionChange: 0 // Implement if needed
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { message: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
} 