import { NextResponse } from 'next/server'
import { query, transaction } from '@/lib/db/mysql'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { ResultSetHeader } from 'mysql2'



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
// GET /api/admin/customers - Get all customers with pagination and search
export async function GET(request: Request) {
  try {
    const payload = await verifyAuth()
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const offset = (page - 1) * limit
    const whereClause = []
    const params = []

    if (search) {
      whereClause.push('(c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)')
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    const whereSQL = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : ''

    // Get total count
    const countResultArr = await query(
      `SELECT COUNT(*) as total FROM customers c ${whereSQL}`,
      params
    );
    const countResult = Array.isArray(countResultArr) ? countResultArr[0] : undefined;
    const total = (countResult && typeof countResult === 'object' && 'total' in countResult) ? (countResult as any).total : 0;

    // Get customers with their order statistics
    const sqlQuery = `
      SELECT 
        c.*,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_spent,
        MAX(o.created_at) as last_order_date
      FROM customers c
      LEFT JOIN orders o ON c.id = o.user_id
      ${whereSQL}
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `
    const customers = await query(sqlQuery, [...params, limit, offset])

    return NextResponse.json({
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const payload = await verifyAuth()
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { name, email, phone, addresses } = data

    // Create customer using transaction
    const result = await transaction(async (connection) => {
      // Insert customer
      const [customerResult] = await connection.execute<ResultSetHeader>(
        'INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)',
        [name, email, phone]
      )

      const customerId = customerResult.insertId

      // Insert addresses
      for (const address of addresses) {
        await connection.execute(
          `INSERT INTO addresses (
            user_id, address_type, full_name, address_line1, address_line2,
            city, state, postal_code, country, phone, is_default
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            customerId,
            address.address_type,
            address.full_name,
            address.address_line1,
            address.address_line2,
            address.city,
            address.state,
            address.postal_code,
            address.country,
            address.phone,
            address.is_default
          ]
        )
      }

      return { customerId }
    })

    return NextResponse.json({
      message: 'Customer created successfully',
      customerId: result.customerId
    })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}