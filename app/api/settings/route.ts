import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { query } from '@/lib/db/mysql'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-2024'
)

export async function GET() {
  try {
    const [settings] = await query(
      'SELECT * FROM settings WHERE id = 1'
    )

    return NextResponse.json(settings || {})
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const token = cookies().get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.sub as string

    // Verify user is admin
    const [user] = await query(
      'SELECT role FROM admins WHERE id = ?',
      [userId]
    )

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const {
      siteName,
      contactEmail,
      contactPhone,
      deliveryFee,
      minOrderAmount,
    } = data

    // Update or insert settings
    await query(
      `INSERT INTO settings (
        id, site_name, contact_email, contact_phone, delivery_fee, min_order_amount
      ) VALUES (1, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        site_name = VALUES(site_name),
        contact_email = VALUES(contact_email),
        contact_phone = VALUES(contact_phone),
        delivery_fee = VALUES(delivery_fee),
        min_order_amount = VALUES(min_order_amount)`,
      [siteName, contactEmail, contactPhone, deliveryFee, minOrderAmount]
    )

    return NextResponse.json({ message: 'Settings updated successfully' })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update settings' },
      { status: 500 }
    )
  }
} 