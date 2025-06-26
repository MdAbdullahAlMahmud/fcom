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
    const orderResultRaw = await query(orderQuery, [trackingNumber])
    const orderResult = Array.isArray(orderResultRaw) ? orderResultRaw : []

    if (orderResult.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    const order = orderResult[0]
    if (!order || typeof order !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    // Get order items
    const itemsQuery = `
      SELECT 
        oi.*,
        p.name as product_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `
    const itemsResultRaw = await query(itemsQuery, [order && 'id' in order ? order.id : undefined])
    const itemsResult = Array.isArray(itemsResultRaw) ? itemsResultRaw : []

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
    const statusHistoryResultRaw = await query(statusHistoryQuery, [order && 'id' in order ? order.id : undefined])
    const statusHistoryResult = Array.isArray(statusHistoryResultRaw) ? statusHistoryResultRaw : []

    // Format the response
    const response = {
      order_number: 'order_number' in order ? order.order_number : undefined,
      tracking_number: 'tracking_number' in order ? order.tracking_number : undefined,
      status: 'status' in order ? order.status : undefined,
      total_amount: 'total_amount' in order ? order.total_amount : undefined,
      created_at: 'created_at' in order ? order.created_at : undefined,
      shipping_address: {
        full_name: 'full_name' in order ? order.full_name : undefined,
        address_line1: 'address_line1' in order ? order.address_line1 : undefined,
        address_line2: 'address_line2' in order ? order.address_line2 : undefined,
        city: 'city' in order ? order.city : undefined,
        state: 'state' in order ? order.state : undefined,
        postal_code: 'postal_code' in order ? order.postal_code : undefined,
        country: 'country' in order ? order.country : undefined,
        phone: 'phone' in order ? order.phone : undefined
      },
      items: itemsResult.map((item: any) => ({
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      })),
      status_history: statusHistoryResult.map((status: any) => ({
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