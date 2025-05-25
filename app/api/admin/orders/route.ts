import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { query, transaction } from '@/lib/db/mysql'
import { Order, OrderStatus } from '@/types/order'
import { ResultSetHeader } from 'mysql2'

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

// GET /api/admin/orders - Get all orders
export async function GET(request: Request) {
  try {
    const payload = await verifyAuth()
    
    // Only admin can view all orders
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const offset = (page - 1) * limit
    const whereClause = []
    const params = []

    if (status) {
      whereClause.push('o.status = ?')
      params.push(status)
    }

    const whereSQL = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : ''

    // Get total count
    const [countResult] = await query(
      `SELECT COUNT(*) as total FROM orders o ${whereSQL}`,
      params
    )
    const total = countResult.total

    // Get orders with user information
    const orders = await query(
      `SELECT 
        o.*,
        u.username as user_name,
        u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereSQL}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { message: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST /api/admin/orders - Create a new order
export async function POST(request: Request) {
  try {
    const payload = await verifyAuth()
    const orderData: Order = await request.json()

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Create order using transaction
    const result = await transaction(async (connection) => {
      // Insert order
      const [orderResult] = await connection.execute<ResultSetHeader>(`
        INSERT INTO orders (
          user_id, order_number, status, total_amount,
          shipping_fee, tax_amount,
          payment_status, payment_method,
          shipping_address_id, billing_address_id,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        payload?.userId ?? null, // Allow null for anonymous users
        orderNumber,
        orderData.status,
        orderData.total_amount,
        orderData.shipping_fee ?? 0,
        orderData.tax_amount ?? 0,
        orderData.payment_status,
        orderData.payment_method,
        orderData.shipping_address_id ?? null,
        orderData.billing_address_id ?? null,
        orderData.notes ?? null
      ])

      const orderId = orderResult.insertId

      // Insert order items
      for (const item of orderData.items) {
        await connection.execute(`
          INSERT INTO order_items (
            order_id, product_id, quantity,
            unit_price, total_price
          ) VALUES (?, ?, ?, ?, ?)
        `, [
          orderId,
          item.product_id,
          item.quantity,
          item.price,
          item.price * item.quantity
        ])
      }

      // Insert initial status history
      await connection.execute(`
        INSERT INTO order_status_history (
          order_id, status, notes, created_by
        ) VALUES (?, ?, ?, ?)
      `, [
        orderId,
        orderData.status,
        'Order created',
        payload?.userId || null // Allow null for anonymous users
      ])

      return { orderId, orderNumber }
    })

    return NextResponse.json({
      message: 'Order created successfully',
      orderId: result.orderId,
      orderNumber: result.orderNumber
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { message: 'Failed to create order' },
      { status: 500 }
    )
  }
} 