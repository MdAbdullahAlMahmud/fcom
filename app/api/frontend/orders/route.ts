import { NextResponse } from 'next/server'
import { query } from '@/lib/db/mysql'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    console.log('=== ORDER SUBMISSION START ===')
    const data = await request.json()
    console.log('Received order data:', JSON.stringify(data, null, 2))

    // 1. Create/update customer
    console.log('Creating/updating customer...')
    const customerQuery = `
      INSERT INTO customers (
        name,
        email,
        phone
      ) VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        phone = VALUES(phone)
    `
    const customerParams = [
      data.customer.name,
      data.customer.email,
      data.customer.phone
    ]
    console.log('Customer query:', customerQuery)
    console.log('Customer params:', customerParams)
    const customerResult = await query(customerQuery, customerParams)
    const customerId = customerResult.insertId
    console.log('Customer created/updated with ID:', customerId)

    // 2. Create user record for the customer
    console.log('Creating user record...')
    const userQuery = `
      INSERT INTO users (
        username,
        email,
        phone,
        password,
        role,
        status
      ) VALUES (?, ?, ?, ?, 'user', 'active')
      ON DUPLICATE KEY UPDATE
        username = VALUES(username),
        phone = VALUES(phone)
    `
    const username = data.customer.email.split('@')[0]
    const tempPassword = Math.random().toString(36).slice(-8)
    const userParams = [
      username,
      data.customer.email,
      data.customer.phone,
      tempPassword
    ]
    console.log('User query:', userQuery)
    console.log('User params:', userParams)
    const userResult = await query(userQuery, userParams)
    
    // Get the user ID - either from insert or by querying existing user
    let userId = userResult.insertId
    if (userId === 0) {
      const existingUserQuery = 'SELECT id FROM users WHERE email = ?'
      const existingUserResult = await query(existingUserQuery, [data.customer.email])
      userId = existingUserResult[0]?.id
    }
    console.log('User created/updated with ID:', userId)

    if (!userId) {
      throw new Error('Failed to create or find user')
    }

    // 3. Create shipping address
    console.log('Creating shipping address...')
    const addressQuery = `
      INSERT INTO addresses (
        user_id,
        address_type,
        full_name,
        address_line1,
        city,
        state,
        postal_code,
        country,
        phone,
        is_default
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    const addressParams = [
      userId,
      'shipping',
      data.customer.name,
      data.customer.address.split('\n')[0],
      data.customer.address.split('\n')[1]?.split(',')[0] || '',
      data.customer.address.split('\n')[1]?.split(',')[1]?.trim() || '',
      data.customer.address.split('\n')[1]?.split(',')[2]?.trim() || '',
      'Bangladesh',
      data.customer.phone,
      0
    ]
    console.log('Address query:', addressQuery)
    console.log('Address params:', addressParams)
    const addressResult = await query(addressQuery, addressParams)
    const addressId = addressResult.insertId
    console.log('Address created with ID:', addressId)

    // 4. Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // 5. Create order
    console.log('Creating order...')
    const orderQuery = `
      INSERT INTO orders (
        order_number,
        user_id,
        shipping_address_id,
        total_amount,
        status,
        payment_status,
        payment_method
      ) VALUES (?, ?, ?, ?, 'pending', 'pending', 'cash_on_delivery')
    `
    const orderParams = [
      orderNumber,
      userId,
      addressId,
      data.total
    ]
    console.log('Order query:', orderQuery)
    console.log('Order params:', orderParams)
    const orderResult = await query(orderQuery, orderParams)
    const orderId = orderResult.insertId
    console.log('Order created with ID:', orderId)

    // 6. Create order items
    console.log('Creating order items...')
    for (const item of data.items) {
      const orderItemQuery = `
        INSERT INTO order_items (
          order_id,
          product_id,
          quantity,
          unit_price,
          total_price
        ) VALUES (?, ?, ?, ?, ?)
      `
      const orderItemParams = [
        orderId,
        item.id,
        item.quantity,
        item.sale_price || item.price,
        (item.sale_price || item.price) * item.quantity
      ]
      console.log('Order item query:', orderItemQuery)
      console.log('Order item params:', orderItemParams)
      await query(orderItemQuery, orderItemParams)
    }

    // 7. Create order status history
    console.log('Creating order status history...')
    const statusHistoryQuery = `
      INSERT INTO order_status_history (
        order_id,
        status,
        created_by,
        notes
      ) VALUES (?, 'pending', ?, 'Order created')
    `
    const statusHistoryParams = [orderId, userId]
    console.log('Status history query:', statusHistoryQuery)
    console.log('Status history params:', statusHistoryParams)
    await query(statusHistoryQuery, statusHistoryParams)

    console.log('=== ORDER CREATION COMPLETED ===')
    return NextResponse.json({
      success: true,
      orderNumber,
      message: 'Order created successfully'
    })

  } catch (error) {
    console.error('=== ERROR IN ORDER CREATION ===')
    console.error('Error details:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    console.error('=== FATAL ERROR IN ORDER CREATION ===')
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred while creating the order'
      },
      { status: 500 }
    )
  }
} 