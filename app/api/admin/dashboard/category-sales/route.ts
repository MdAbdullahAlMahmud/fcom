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

    const categorySales = await query(`
      SELECT 
        c.id,
        c.name,
        COUNT(DISTINCT o.id) as order_count,
        SUM(oi.quantity * oi.unit_price) as revenue
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY c.id
      ORDER BY revenue DESC
    `)

    return NextResponse.json(categorySales)
  } catch (error) {
    console.error('Error fetching category sales:', error)
    return NextResponse.json(
      { message: 'Failed to fetch category sales' },
      { status: 500 }
    )
  }
} 