import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { query, transaction } from '@/lib/db/mysql'
import { Address } from '@/types/order'
import { ResultSetHeader } from 'mysql2'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

async function verifyAuth() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth-token')

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token.value, JWT_SECRET)
    return payload
  } catch (error) {
    return null
  }
}

// POST /api/admin/addresses - Create a new address
export async function POST(request: Request) {
  try {
    const payload = await verifyAuth()
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const addressData = await request.json()

    // Insert address using transaction
    const result = await transaction(async (connection) => {
      const [insertResult] = await connection.execute<ResultSetHeader>(`
        INSERT INTO addresses (
          user_id,
          address_type,
          full_name,
          address_line1,
          address_line2,
          city,
          state,
          postal_code,
          country,
          phone,
          is_default
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        payload.userId,
        addressData.address_type,
        addressData.full_name,
        addressData.address_line1,
        addressData.address_line2 || null,
        addressData.city,
        addressData.state,
        addressData.postal_code,
        addressData.country,
        addressData.phone,
        false // is_default
      ])

      return insertResult
    })

    return NextResponse.json({
      message: 'Address created successfully',
      id: result.insertId
    })
  } catch (error) {
    console.error('Error creating address:', error)
    return NextResponse.json(
      { message: 'Failed to create address' },
      { status: 500 }
    )
  }
} 