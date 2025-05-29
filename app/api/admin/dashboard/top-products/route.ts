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

    const topProducts = await query(`
      SELECT 
        p.id,
        p.name,
        pi.image_url,
        COUNT(oi.id) as sales_count,
        SUM(oi.quantity * oi.unit_price) as revenue
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY p.id
      ORDER BY sales_count DESC
      LIMIT 5
    `)

    return NextResponse.json(topProducts)
  } catch (error) {
    console.error('Error fetching top products:', error)
    return NextResponse.json(
      { message: 'Failed to fetch top products' },
      { status: 500 }
    )
  }
} 