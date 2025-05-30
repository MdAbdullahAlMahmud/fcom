import { NextResponse } from 'next/server'
import { transaction } from '@/lib/db/mysql'
import { v4 as uuidv4 } from 'uuid'
import { ResultSetHeader, RowDataPacket } from 'mysql2'

export async function POST(request: Request) {
  try {
    console.log('=== ORDER SUBMISSION START ===')
    const data = await request.json()
    console.log('Received order data:', JSON.stringify(data, null, 2))

    // Validate required data
    if (!data.customer?.name || !data.customer?.email || !data.customer?.phone || !data.customer?.address) {
      throw new Error('Missing required customer information')
    }

    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error('No items in order')
    }

    if (!data.total || data.total <= 0) {
      throw new Error('Invalid order total')
    }

    const result = await transaction(async (connection) => {
      // 1. Create/update customer
      console.log('Creating/updating customer...')
      const [customerResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO customers (name, email, phone) 
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         name = VALUES(name),
         phone = VALUES(phone)`,
        [data.customer.name, data.customer.email, data.customer.phone]
      )

      const customerId = customerResult.insertId || (
        await connection.execute<RowDataPacket[]>(
          'SELECT id FROM customers WHERE email = ?',
          [data.customer.email]
        )
      )[0][0]?.id

      if (!customerId) {
        throw new Error('Failed to create or get customer ID')
      }
      console.log('Customer ID:', customerId)

      // 2. Create/update user
      console.log('Creating/updating user...')
      const username = data.customer.email.split('@')[0]
      const tempPassword = Math.random().toString(36).slice(-8)

      // const [userResult] = await connection.execute<ResultSetHeader>(
      //   `INSERT INTO users (username, email, phone, password, role, status)
      //    VALUES (?, ?, ?, ?, 'user', 'active')
      //    ON DUPLICATE KEY UPDATE
      //    username = VALUES(username),
      //    phone = VALUES(phone)`,
      //   [username, data.customer.email, data.customer.phone, tempPassword]
      // )

      // const userId = userResult.insertId || (
      //   await connection.execute<RowDataPacket[]>(
      //     'SELECT id FROM users WHERE email = ?',
      //     [data.customer.email]
      //   )
      // )[0][0]?.id

      // if (!userId) {
      //   throw new Error('Failed to create or get user ID')
      // }
      // console.log('User ID:', userId)

      // 3. Create address
      console.log('Creating address...')
      const addressLines = data.customer.address.split('\n')
      const addressParts = addressLines[1]?.split(',') || []

      const [addressResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO addresses (
          user_id, address_type, full_name, address_line1, address_line2,
          city, state, postal_code, country, phone, is_default
        ) VALUES (?, 'shipping', ?, ?, ?, ?, ?, ?, 'Bangladesh', ?, 1)`,
        [
          customerId,
          data.customer.name,
          addressLines[0] || '',
          addressParts[0]?.trim() || '',
          addressParts[1]?.trim() || '',
          addressParts[2]?.trim() || '',
          addressParts[3]?.trim() || '',
          data.customer.phone
        ]
      )

      const addressId = addressResult.insertId
      if (!addressId) {
        throw new Error('Failed to create address')
      }
      console.log('Address created with ID:', addressId)

      // 4. Create order
      console.log('Creating order...')
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      const trackingNumber = `TRK-${uuidv4().slice(0, 8).toUpperCase()}`

      const [orderResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO orders (
          order_number, tracking_number, user_id, shipping_address_id,
          billing_address_id, total_amount, status, payment_status,
          payment_method, notes
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending', 'pending', 'cash_on_delivery', 'Order placed by customer')`,
        [
          orderNumber,
          trackingNumber,
          customerId,
          addressId,
          addressId,
          data.total
        ]
      )

      const orderId = orderResult.insertId
      if (!orderId) {
        throw new Error('Failed to create order')
      }
      console.log('Order created with ID:', orderId)

      // 5. Create order items
      console.log('Creating order items...')
      for (const item of data.items) {
        const [orderItemResult] = await connection.execute<ResultSetHeader>(
          `INSERT INTO order_items (
            order_id, product_id, quantity, unit_price, total_price
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            orderId,
            item.id,
            item.quantity,
            item.sale_price || item.price,
            (item.sale_price || item.price) * item.quantity
          ]
        )

        if (!orderItemResult.insertId) {
          throw new Error('Failed to create order item')
        }
      }

      // 6. Create order status history
      console.log('Creating order status history...')
      await connection.execute(
        `INSERT INTO order_status_history (
          order_id, status, created_by, notes
        ) VALUES (?, 'pending', ?, 'Order created')`,
        [orderId, customerId]
      )

      return { orderId, orderNumber, trackingNumber }
    })

    console.log('=== ORDER CREATION COMPLETED ===')
    return NextResponse.json({
      success: true,
      orderNumber: result.orderNumber,
      trackingNumber: result.trackingNumber,
      message: 'Order created successfully'
    })

  } catch (error: any) {
    console.error('=== ERROR IN ORDER CREATION ===')
    console.error('Error details:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('=== FATAL ERROR IN ORDER CREATION ===')
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to create order',
        error: error.message 
      },
      { status: 500 }
    )
  }
} 