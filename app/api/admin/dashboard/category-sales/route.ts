import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { pool } from '@/lib/db/mysql'
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

    const [categories] = await pool.query<RowDataPacket[]>(`
      WITH category_revenue AS (
        SELECT 
          c.id,
          c.name,
          COALESCE(SUM(oi.quantity * oi.unit_price), 0) as revenue
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN orders o ON oi.order_id = o.id
        WHERE o.status != 'cancelled'
          AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY c.id
      )
      SELECT 
        name as category,
        revenue,
        ROUND((revenue / (SELECT SUM(revenue) FROM category_revenue)) * 100, 2) as percentage
      FROM category_revenue
      ORDER BY revenue DESC
    `)

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching category sales:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category sales' },
      { status: 500 }
    )
  }
} 