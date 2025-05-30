import { NextResponse } from 'next/server'
import { query } from '@/lib/db/mysql'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

async function verifyAuth() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth-token')

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token.value, JWT_SECRET)
    return payload
  } catch (error) {
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

    // Get total products count
    const [productCount] = await query(
      'SELECT COUNT(*) as count FROM products'
    )

    // Get total orders count and revenue
    const [orderStats] = await query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue
      FROM orders
    `)

    // Get total customers count
    const [customerCount] = await query(
      'SELECT COUNT(*) as count FROM customers'
    )

    // Get total categories count
    const [categoryCount] = await query(
      'SELECT COUNT(*) as count FROM categories'
    )

    // Get day-wise order counts for the last 7 days
    const dayWiseOrders = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM orders
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `)

    return NextResponse.json({
      totalProducts: productCount.count,
      totalOrders: orderStats.total_orders,
      totalRevenue: orderStats.total_revenue,
      totalCustomers: customerCount.count,
      totalCategories: categoryCount.count,
      dayWiseOrders
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
} 