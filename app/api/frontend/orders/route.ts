import { NextResponse } from 'next/server'
import { transaction } from '@/lib/db/mysql'
import { v4 as uuidv4 } from 'uuid'
import { ResultSetHeader, RowDataPacket } from 'mysql2'
import { da } from 'date-fns/locale'

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
      // 1. Always create a new customer (no deduplication)
      console.log('Creating new customer (no deduplication)...')
      // Always create a new customer, but make email unique by appending a timestamp if duplicate error occurs
      let customerId: number | undefined = undefined;
      let emailToUse = data.customer.email;

      
      try {
        const [customerResult] = await connection.execute<ResultSetHeader>(
          `INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)`,
          [data.customer.name, emailToUse, data.customer.phone]
        );
        customerId = customerResult.insertId;
      } catch (err: any) {
        // If duplicate email error, try again with a unique email
        if (err && err.code === 'ER_DUP_ENTRY' && /email/.test(err.sqlMessage)) {
          emailToUse = `${data.customer.email.split('@')[0]}+${Date.now()}@${data.customer.email.split('@')[1]}`;
          const [customerResult2] = await connection.execute<ResultSetHeader>(
            `INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)`,
            [data.customer.name, emailToUse, data.customer.phone]
          );
          customerId = customerResult2.insertId;
        } else {
          throw err;
        }
      }
      if (!customerId) {
        throw new Error('Failed to create customer');
      }
      console.log('Customer ID:', customerId, 'Email used:', emailToUse);

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


      // 4. Create order (handle online payment logic)
      console.log('Creating order...')
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      const trackingNumber = `TRK-${uuidv4().slice(0, 8).toUpperCase()}`


      let paymentMethod = 'cash_on_delivery';
      let trackingId: string | null = null;
      let notes = 'Order placed by customer';

      let paymentStatus = 'pending';
      if (data.payment_method === 'online' && data.trxId) {
        // 1. Find the transaction in stored_data
        const trxRows = await connection.execute<RowDataPacket[]>(
          'SELECT * FROM stored_data WHERE TrxID = ? LIMIT 1',
          [data.trxId]
        );
        const trxData = Array.isArray(trxRows[0]) ? trxRows[0][0] : trxRows[0];
        if (!trxData) {
          throw new Error('Transaction ID not found in stored_data');
        }
        // 2. Get text_company (bkash/nagad/etc)
        let company = trxData.text_company || 'online';
        paymentMethod = 'online_payment';
        trackingId = data.trxId;
        paymentStatus = 'paid';

        // 3. Update stored_data with phone, user_id, name
        await connection.execute(
          'UPDATE stored_data SET phone = ?, user_id = ?, name = ? WHERE TrxID = ?',
          [data.customer.phone, customerId, data.customer.name, data.trxId]
        );
        notes = company;
      }

      const [orderResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO orders (
          order_number, tracking_number, tracking_id, user_id, shipping_address_id,
          billing_address_id, total_amount, status, payment_status,
          payment_method, notes,shipping_fee,shipping_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?,?,?)`,
        [
          orderNumber,
          trackingNumber,
          trackingId,
          customerId,
          addressId,
          addressId,
          data.total,
          paymentStatus,
          paymentMethod,
          notes,
          data.shipping_fee,
          data.shipping_type
        ]
      );

      const orderId = orderResult.insertId;
      if (!orderId) {
        throw new Error('Failed to create order');
      }
      console.log('Order created with ID:', orderId);

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