import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { pool } from '@/lib/db/mysql'
import { RowDataPacket } from 'mysql2'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

async function verifyAuth() {
  const token = cookies().get('token')?.value

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

    // Get total orders and revenue
    const [orderStats] = await pool.query<RowDataPacket[]>(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(DISTINCT user_id) as total_customers
      FROM orders
      WHERE status != 'cancelled'
    `)

    // Get orders from previous period for comparison
    const [previousStats] = await pool.query<RowDataPacket[]>(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(DISTINCT user_id) as total_customers
      FROM orders
      WHERE status != 'cancelled'
      AND created_at < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `)

    // Calculate changes
    const current = orderStats[0]
    const previous = previousStats[0]

    const ordersChange = previous.total_orders > 0 
      ? ((current.total_orders - previous.total_orders) / previous.total_orders) * 100 
      : 0

    const revenueChange = previous.total_revenue > 0 
      ? ((current.total_revenue - previous.total_revenue) / previous.total_revenue) * 100 
      : 0

    const customersChange = previous.total_customers > 0 
      ? ((current.total_customers - previous.total_customers) / previous.total_customers) * 100 
      : 0

    // Calculate conversion rate based on orders per customer
    const conversionRate = current.total_customers > 0 
      ? (current.total_orders / current.total_customers) * 100 
      : 0

    return NextResponse.json({
      totalOrders: current.total_orders,
      totalRevenue: current.total_revenue,
      totalCustomers: current.total_customers,
      conversionRate: Math.round(conversionRate * 100) / 100,
      ordersChange: Math.round(ordersChange * 100) / 100,
      revenueChange: Math.round(revenueChange * 100) / 100,
      customersChange: Math.round(customersChange * 100) / 100,
      conversionChange: 0 // You can implement this if you track conversion rate over time
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
} 