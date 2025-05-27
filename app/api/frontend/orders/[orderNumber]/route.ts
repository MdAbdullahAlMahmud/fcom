import { NextResponse } from 'next/server'
import { query } from '@/lib/db/mysql'

export async function GET(
  request: Request,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const { orderNumber } = params
    console.log('Fetching order details for:', orderNumber)

    // Get order details
    const orderQuery = `
      SELECT 
        o.*,
        a.full_name,
        a.address_line1,
        a.city,
        a.state,
        a.postal_code,
        a.country,
        a.phone,
        GROUP_CONCAT(
          JSON_OBJECT(
            'id', oi.id,
            'product_id', oi.product_id,
            'name', p.name,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'total_price', oi.total_price
          )
        ) as items
      FROM orders o
      LEFT JOIN addresses a ON o.shipping_address_id = a.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.order_number = ?
      GROUP BY o.id
    `
    
    const [order] = await query(orderQuery, [orderNumber])
    
    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      )
    }

    // Parse the items JSON string into an array
    order.items = JSON.parse(`[${order.items}]`)

    // Format the shipping address
    order.shipping_address = {
      full_name: order.full_name,
      address_line1: order.address_line1,
      city: order.city,
      state: order.state,
      postal_code: order.postal_code,
      country: order.country,
      phone: order.phone
    }

    // Remove the individual address fields from the root level
    delete order.full_name
    delete order.address_line1
    delete order.city
    delete order.state
    delete order.postal_code
    delete order.country
    delete order.phone

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { message: 'Failed to fetch order details' },
      { status: 500 }
    )
  }
} 