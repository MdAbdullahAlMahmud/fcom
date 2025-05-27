import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { query } from '@/lib/db/mysql'
import { Order, OrderStatus } from '@/types/order'
import { logger } from '@/lib/logger'

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

// GET /api/admin/orders/[id] - Get order details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await verifyAuth()
    
    // Get order details
    const [order] = await query(
      `SELECT 
        o.*,
        CASE 
          WHEN o.user_id IS NOT NULL THEN u.username 
          ELSE NULL 
        END as user_name,
        CASE 
          WHEN o.user_id IS NOT NULL THEN u.email 
          ELSE NULL 
        END as user_email,
        sa.full_name as shipping_name,
        sa.address_line1 as shipping_address1,
        sa.address_line2 as shipping_address2,
        sa.city as shipping_city,
        sa.state as shipping_state,
        sa.postal_code as shipping_postal_code,
        sa.country as shipping_country,
        sa.phone as shipping_phone,
        ba.full_name as billing_name,
        ba.address_line1 as billing_address1,
        ba.address_line2 as billing_address2,
        ba.city as billing_city,
        ba.state as billing_state,
        ba.postal_code as billing_postal_code,
        ba.country as billing_country,
        ba.phone as billing_phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN addresses sa ON o.shipping_address_id = sa.id
      LEFT JOIN addresses ba ON o.billing_address_id = ba.id
      WHERE o.id = ?`,
      [params.id]
    )

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to view this order
    if (payload?.role !== 'admin' && order.user_id !== payload?.userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Get order items
    const items = await query(
      `SELECT 
        oi.*,
        p.name as product_name,
        p.sku as product_sku
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?`,
      [params.id]
    )

    // Get order status history
    const statusHistory = await query(
      `SELECT 
        osh.*,
        u.username as updated_by_name
      FROM order_status_history osh
      LEFT JOIN users u ON osh.created_by = u.id
      WHERE osh.order_id = ?
      ORDER BY osh.created_at DESC`,
      [params.id]
    )

    return NextResponse.json({
      ...order,
      items,
      statusHistory
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { message: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/orders/[id] - Update order status (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await verifyAuth()
    if (!payload || payload.role !== 'admin') {
      logger.warn('Unauthorized attempt to update order', { orderId: params.id })
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status, notes, tracking_number, estimated_delivery_date } = body

    logger.debug('Updating order', {
      orderId: params.id,
      status,
      notes,
      tracking_number,
      estimated_delivery_date
    })

    // Validate status if provided
    if (status && !['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].includes(status)) {
      logger.warn('Invalid status provided', { status })
      return NextResponse.json(
        { message: 'Invalid status' },
        { status: 400 }
      )
    }

    // Update order
    const updateResult = await query(
      `UPDATE orders SET
        status = COALESCE(?, status),
        tracking_number = ?,
        estimated_delivery_date = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        status || null,
        tracking_number || null,
        estimated_delivery_date || null,
        params.id
      ]
    )

    logger.debug('Order update result', { updateResult })

    // Add status history if status is provided
    if (status) {
      const historyResult = await query(
        `INSERT INTO order_status_history (
          order_id,
          status,
          notes,
          created_by,
          created_at
        ) VALUES (?, ?, ?, ?, NOW())`,
        [params.id, status, notes || null, payload.sub]
      )

      logger.debug('Status history update result', { historyResult })
    }

    return NextResponse.json({
      message: 'Order updated successfully'
    })
  } catch (error) {
    logger.error('Error updating order', error)
    return NextResponse.json(
      { message: 'Failed to update order' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/orders/[id] - Cancel order (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await verifyAuth()
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update order status to cancelled
    await query(
      `UPDATE orders SET
        status = 'cancelled',
        updated_at = NOW()
      WHERE id = ?`,
      [params.id]
    )

    // Add status history
    await query(
      `INSERT INTO order_status_history (
        order_id,
        status,
        notes,
        updated_by,
        created_at
      ) VALUES (?, 'cancelled', 'Order cancelled by admin', ?, NOW())`,
      [params.id, payload.id]
    )

    return NextResponse.json({
      message: 'Order cancelled successfully'
    })
  } catch (error) {
    console.error('Error cancelling order:', error)
    return NextResponse.json(
      { message: 'Failed to cancel order' },
      { status: 500 }
    )
  }
} 