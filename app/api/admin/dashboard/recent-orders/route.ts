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

    const recentOrders = await query(`
      SELECT 
        o.id,
        o.order_number,
        o.total_amount,
        o.status,
        o.created_at,
        c.name as customer_name,
        GROUP_CONCAT(
          CONCAT(
            p.name, ':', 
            oi.quantity
          )
        ) as items
      FROM orders o
      LEFT JOIN customers c ON o.user_id = c.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `)

    // Transform the concatenated items string into an array of objects
    const transformedOrders = recentOrders.map((order: any) => ({
      id: order.id,
      order_number: order.order_number,
      customer_name: order.customer_name,
      total_amount: order.total_amount,
      status: order.status,
      created_at: order.created_at,
      items: order.items ? order.items.split(',').map((item: string) => {
        const [name, quantity] = item.split(':')
        return {
          name,
          quantity: parseInt(quantity)
        }
      }) : []
    }))

    return NextResponse.json(transformedOrders)
  } catch (error) {
    console.error('Error fetching recent orders:', error)
    return NextResponse.json(
      { message: 'Failed to fetch recent orders' },
      { status: 500 }
    )
  }
} 