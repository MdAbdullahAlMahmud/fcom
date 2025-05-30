import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { query } from '@/lib/db/mysql'
import { Order, OrderStatus } from '@/types/order'
import { logger } from '@/lib/logger'
import { buildUpdateQuery } from '@/lib/utils/sqlUtils'

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
          WHEN o.user_id IS NOT NULL THEN u.name 
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
      LEFT JOIN customers u ON o.user_id = u.id
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
      LEFT JOIN admins u ON osh.created_by = u.id
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

    // Validate and format estimated_delivery_date
    let formattedDeliveryDate = null
    if (estimated_delivery_date) {
      try {
        // Parse the incoming date (handles both ISO format and YYYY-MM-DD)
        const dateObj = new Date(estimated_delivery_date)
        
        // Validate it's a real date
        if (isNaN(dateObj.getTime())) {
          logger.warn('Invalid date provided', { estimated_delivery_date })
          return NextResponse.json(
            { message: 'Invalid date provided' },
            { status: 400 }
          )
        }
        
        // Convert to YYYY-MM-DD format for database
        formattedDeliveryDate = dateObj.toISOString().split('T')[0]
        
        logger.debug('Date converted', { 
          original: estimated_delivery_date, 
          formatted: formattedDeliveryDate 
        })
        
      } catch (error) {
        logger.warn('Error parsing date', { estimated_delivery_date, error: error.message })
        return NextResponse.json(
          { message: 'Invalid date format provided' },
          { status: 400 }
        )
      }
    }

    // Build dynamic update query
    const updateFields = []
    const updateValues = []

    if (status !== undefined) {
      updateFields.push('status = ?')
      updateValues.push(status || null)
    }

    if (tracking_number !== undefined) {
      updateFields.push('tracking_number = ?')
      updateValues.push(tracking_number || null)
    }

    if (estimated_delivery_date !== undefined) {
      updateFields.push('estimated_delivery_date = ?')
      updateValues.push(formattedDeliveryDate)
    }

    // Always update the updated_at field
    updateFields.push('updated_at = NOW()')

    if (updateFields.length === 1) { // Only updated_at field
      logger.warn('No fields to update', { orderId: params.id })
      return NextResponse.json(
        { message: 'No fields provided for update' },
        { status: 400 }
      )
    }

    // Add the WHERE clause parameter
    updateValues.push(params.id)

    const updateQuery = `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`

    logger.debug('Executing update query', { 
      query: updateQuery, 
      values: updateValues 
    })

    // Update order
    const updateResult = await query(updateQuery, updateValues)

    logger.debug('Order update result', { updateResult })

    // Check if any rows were affected
    if (updateResult.affectedRows === 0) {
      logger.warn('Order not found or no changes made', { orderId: params.id })
      return NextResponse.json(
        { message: 'Order not found or no changes made' },
        { status: 404 }
      )
    }

    //Add status history if status is provided and not null
    // if (status) {
    //   const historyResult = await query(
    //     `INSERT INTO order_status_history (
    //       order_id,
    //       status,
    //       notes,
    //       created_by,
    //       created_at
    //     ) VALUES (?, ?, ?, ?, NOW())`,
    //     [params.id, status, notes || "", payload.sub]
    //   )

    //   logger.debug('Status history update result', { historyResult })
    // }

    return NextResponse.json({
      message: 'Order updated successfully',
      orderId: params.id
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