import { NextResponse } from 'next/server'
import { query } from '@/lib/db/mysql'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'


const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

async function verifyAuth() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth-token')

  if (!token) {
    return null // Return null for anonymous users
  }

  try {
    const { payload } = await jwtVerify(token.value, JWT_SECRET)
    return payload
  } catch (error) {
    return null // Return null for invalid tokens
  }
}

// GET /api/admin/customers/[id] - Get customer details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await verifyAuth()
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get customer details with order statistics
    const customerResult = await query(
      `SELECT 
        c.*,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_spent,
        MAX(o.created_at) as last_order_date
      FROM customers c
      LEFT JOIN orders o ON c.id = o.user_id
      WHERE c.id = ?
      GROUP BY c.id`,
      [params.id]
    );
    const customer = Array.isArray(customerResult) ? customerResult[0] : undefined;

    if (!customer) {
      return NextResponse.json(
        { message: 'Customer not found' },
        { status: 404 }
      )
    }

    // Get customer's addresses
    const addresses = await query(
      `SELECT * FROM addresses WHERE user_id = ?`,
      [params.id]
    )

    // Get customer's recent orders
    const ordersResult = await query(
      `SELECT 
        o.*,
        GROUP_CONCAT(
          CONCAT(
            oi.id, ':', 
            oi.product_id, ':', 
            p.name, ':', 
            oi.quantity, ':', 
            oi.unit_price
          )
        ) as items_data
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 5`,
      [params.id]
    );
    const orders = Array.isArray(ordersResult) ? ordersResult : [];

    // Transform order items
    const transformedOrders = orders.map((order: any) => {
      const items = order.items_data ? order.items_data.split(',').map((item: string) => {
        const [id, product_id, product_name, quantity, unit_price] = item.split(':')
        return {
          id: parseInt(id),
          product_id: parseInt(product_id),
          product_name,
          quantity: parseInt(quantity),
          unit_price: parseFloat(unit_price)
        }
      }) : []
      return {
        ...order,
        items
      }
    })

    return NextResponse.json({
      ...customer,
      addresses,
      recent_orders: transformedOrders
    })
  } catch (error) {
    console.error('Error fetching customer details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer details' },
      { status: 500 }
    )
  }
}