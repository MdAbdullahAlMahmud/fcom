import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { query, pool } from '@/lib/db/mysql'
import { RowDataPacket } from 'mysql2'

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

    const [orders] = await pool.query<RowDataPacket[]>(`
      SELECT 
        o.id,
        o.order_number,
        o.total_amount,
        o.status,
        o.created_at,
        u.name as customer_name,
        u.email as customer_email,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', oi.id,
            'name', p.name,
            'quantity', oi.quantity,
            'price', oi.unit_price
          )
        ) as items
      FROM orders o
      LEFT JOIN admins u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.status != 'cancelled'
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `)

    return NextResponse.json(orders.map(order => ({
      id: order.id,
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      total_amount: order.total_amount,
      status: order.status,
      created_at: order.created_at,
      items: JSON.parse(order.items)
    })))
  } catch (error) {
    console.error('Error fetching recent orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent orders' },
      { status: 500 }
    )
  }
} 