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
    const phone = decoded.phone

    // Get customer details
    const [customer] = await query(
      'SELECT * FROM customers WHERE phone = ?',
      [phone]
    )

    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      )
    }

    // Get order statistics
    const [stats] = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END) as refunded
      FROM orders o
      JOIN customers c ON o.user_id = c.id
      WHERE c.phone = ?
    `, [phone])

    return NextResponse.json({
      success: true,
      profile: {
        phone: customer.phone,
        orderStats: stats
      }
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
} 