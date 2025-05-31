import { NextResponse } from 'next/server'
import { query } from '@/lib/db/mysql'
import type { RowDataPacket } from 'mysql2'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('orderNumber')

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, message: 'Order number is required' },
        { status: 400 }
      )
    }


    // Get order details with customer and address information

    const orders = await query(`
      SELECT 
        o.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        sa.address_line1 as shipping_address_line1,
        sa.address_line2 as shipping_address_line2,
        sa.city as shipping_city,
        sa.state as shipping_state,
        sa.postal_code as shipping_postal_code,
        sa.country as shipping_country,
        ba.address_line1 as billing_address_line1,
        ba.address_line2 as billing_address_line2,
        ba.city as billing_city,
        ba.state as billing_state,
        ba.postal_code as billing_postal_code,
        ba.country as billing_country
      FROM orders o
      LEFT JOIN customers c ON o.user_id = c.id
      LEFT JOIN addresses sa ON o.shipping_address_id = sa.id
      LEFT JOIN addresses ba ON o.billing_address_id = ba.id
      WHERE o.order_number = ?
    `, [orderNumber]) as RowDataPacket[];
    const order = orders[0];

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    // Get order items with product images
    const orderItems = await query(`
      SELECT 
        oi.*,
        p.name as product_name,
        pi.image_url as product_image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      WHERE oi.order_id = ?
    `, [order.id])

    // Get order status history
    const statusHistory = await query(`
      SELECT 
        osh.*,
        a.username as updated_by_username
      FROM order_status_history osh
      LEFT JOIN admins a ON osh.created_by = a.id
      WHERE osh.order_id = ?
      ORDER BY osh.created_at DESC
    `, [order.id])

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items: orderItems,
        status_history: statusHistory
      }
    })

  } catch (error: any) {
    console.error('Error fetching order details:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch order details' },
      { status: 500 }
    )
  }
} 