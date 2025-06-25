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

    // First get the recent orders
    const orders = await query(`
      SELECT 
        o.id,
        o.order_number,
        o.total_amount,
        o.status,
        o.created_at,
        o.payment_method,
        o.notes,
        c.name as customer_name,
        c.email as customer_email
      FROM orders o
      LEFT JOIN customers c ON o.user_id = c.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `) as any[];

    // Then get the items for each order
    const ordersWithItems = await Promise.all(
      (orders as any[]).map(async (order: any) => {
        const items = await query(`
          SELECT 
            oi.id,
            p.name,
            oi.quantity
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ?
        `, [order.id])

        return {
          ...order,
          items
        }
      })
    )

    return NextResponse.json(ordersWithItems)
  } catch (error) {
    console.error('Error fetching recent orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent orders' },
      { status: 500 }
    )
  }
}