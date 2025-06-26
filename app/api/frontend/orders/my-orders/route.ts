import { NextResponse } from 'next/server'
import { query } from '@/lib/db/mysql'
import { verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get phone from token
    const phone = (decoded && typeof decoded === 'object' && 'phone' in decoded) ? (decoded as any).phone : undefined;
    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Invalid token payload' },
        { status: 401 }
      )
    }

    // First get customer IDs for this phone number
    const customersResult = await query(
      'SELECT id FROM customers WHERE phone = ?',
      [phone]
    );
    const customers = Array.isArray(customersResult) ? customersResult : [];
    if (customers.length === 0) {
      return NextResponse.json({
        success: true,
        orders: []
      })
    }

    const customerIds = customers.map((c: any) => c.id);
    const placeholders = customerIds.map(() => '?').join(',');

    // Fetch orders with items and address
    const ordersResult = await query(`
      SELECT 
        o.*,
        a.address_line1 as shipping_address_line1,
        a.address_line2 as shipping_address_line2,
        a.city as shipping_city,
        a.state as shipping_state,
        a.postal_code as shipping_postal_code,
        a.country as shipping_country
      FROM orders o
      LEFT JOIN addresses a ON o.shipping_address_id = a.id
      WHERE o.user_id IN (${placeholders})
      ORDER BY o.created_at DESC
    `, customerIds);
    const orders = Array.isArray(ordersResult) ? ordersResult : [];

    // Fetch order items for each order
    for (const order of orders) {
      if (order && typeof order === 'object' && 'id' in order) {
        const itemsResult = await query(`
          SELECT 
            oi.*,
            p.name as product_name,
            pi.image_url as product_image
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          LEFT JOIN product_images pi ON p.id = pi.product_id
          WHERE oi.order_id = ?
          GROUP BY oi.id
        `, [order.id]);
        if (Array.isArray(itemsResult)) {
          (order as any).items = itemsResult;
        }
      }
    }

    return NextResponse.json({
      success: true,
      orders
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}