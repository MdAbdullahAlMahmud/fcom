import { NextResponse } from 'next/server'
import { query } from '@/lib/db/mysql'
import bcrypt from 'bcryptjs'
import { generateToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json()

    if (!phone || !password) {
      return NextResponse.json(
        { success: false, message: 'Phone and password are required' },
        { status: 400 }
      )
    }

    // Get customer
    const [customer] = await query(
      'SELECT * FROM registered_customers WHERE phone = ?',
      [phone]
    )

    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, customer.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken({ 
      id: customer.id,
      phone: customer.phone
    })

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      customer: {
        id: customer.id,
        phone: customer.phone
      }
    })

  } catch (error: any) {
    console.error('Error in login:', error)
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    )
  }
} 