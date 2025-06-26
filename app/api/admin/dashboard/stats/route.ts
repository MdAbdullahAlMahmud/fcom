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
    const productCountArr = await query(
      'SELECT COUNT(*) as count FROM products'
    );
    const productCount = Array.isArray(productCountArr) ? productCountArr[0] : undefined;

    // Get total orders count and revenue
    const orderStatsArr = await query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue
      FROM orders
    `);
    const orderStats = Array.isArray(orderStatsArr) ? orderStatsArr[0] : undefined;

    // Get total customers count
    const customerCountArr = await query(
      'SELECT COUNT(*) as count FROM customers'
    );
    const customerCount = Array.isArray(customerCountArr) ? customerCountArr[0] : undefined;

    // Get total categories count
    const categoryCountArr = await query(
      'SELECT COUNT(*) as count FROM categories'
    );
    const categoryCount = Array.isArray(categoryCountArr) ? categoryCountArr[0] : undefined;

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
      totalProducts: (productCount && typeof productCount === 'object' && 'count' in productCount) ? (productCount as any).count : 0,
      totalOrders: (orderStats && typeof orderStats === 'object' && 'total_orders' in orderStats) ? (orderStats as any).total_orders : 0,
      totalRevenue: (orderStats && typeof orderStats === 'object' && 'total_revenue' in orderStats) ? (orderStats as any).total_revenue : 0,
      totalCustomers: (customerCount && typeof customerCount === 'object' && 'count' in customerCount) ? (customerCount as any).count : 0,
      totalCategories: (categoryCount && typeof categoryCount === 'object' && 'count' in categoryCount) ? (categoryCount as any).count : 0,
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