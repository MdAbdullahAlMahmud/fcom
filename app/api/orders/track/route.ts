import { NextResponse } from 'next/server'
import { query } from '@/lib/db/mysql'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingNumber = searchParams.get('trackingNumber')

    if (!trackingNumber) {
      return NextResponse.json(
        { success: false, message: 'Tracking number is required' },
        { status: 400 }
      )
    }

    // Get order details
    const orderQuery = `
      SELECT 
        o.*,
        a.full_name,
        a.address_line1,
        a.address_line2,
        a.city,
        a.state,
        a.postal_code,
        a.country,
        a.phone
      FROM orders o
      LEFT JOIN addresses a ON o.shipping_address_id = a.id
      WHERE o.tracking_number = ?
    `
    const orderResult = await query(orderQuery, [trackingNumber])

    if (orderResult.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    const order = orderResult[0]

    // Get order items
    const itemsQuery = `
      SELECT 
        oi.*,
        p.name as product_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `
    const itemsResult = await query(itemsQuery, [order.id])

    // Get order status history
    const statusHistoryQuery = `
      SELECT 
        status,
        created_at,
        notes
      FROM order_status_history
      WHERE order_id = ?
      ORDER BY created_at DESC
    `
    const statusHistoryResult = await query(statusHistoryQuery, [order.id])

    // Format the response
    const response = {
      order_number: order.order_number,
      tracking_number: order.tracking_number,
      status: order.status,
      total_amount: order.total_amount,
      created_at: order.created_at,
      shipping_address: {
        full_name: order.full_name,
        address_line1: order.address_line1,
        address_line2: order.address_line2,
        city: order.city,
        state: order.state,
        postal_code: order.postal_code,
        country: order.country,
        phone: order.phone
      },
      items: itemsResult.map(item => ({
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      })),
      status_history: statusHistoryResult.map(status => ({
        status: status.status,
        created_at: status.created_at,
        notes: status.notes
      }))
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error tracking order:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to track order' },
      { status: 500 }
    )
  }
} 