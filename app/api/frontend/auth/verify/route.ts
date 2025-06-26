import { NextResponse } from 'next/server'
import { query } from '@/lib/db/mysql'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { phone, otp, password } = await request.json()

    if (!phone || !otp || !password) {
      return NextResponse.json(
        { success: false, message: 'Phone, OTP and password are required' },
        { status: 400 }
      )
    }

    // Get customer with OTP
    const customerResult = await query(
      'SELECT * FROM registered_customers WHERE phone = ? AND otp = ?',
      [phone, otp]
    );
    const customer = Array.isArray(customerResult) ? customerResult[0] : undefined;

    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update customer with password and verification status
    await query(
      `UPDATE registered_customers 
       SET password = ?, 
           otp_status = 'verified',
           last_verified = CURRENT_TIMESTAMP
       WHERE phone = ?`,
      [hashedPassword, phone]
    )

    return NextResponse.json({
      success: true,
      message: 'Account verified successfully'
    })

  } catch (error: any) {
    console.error('Error in verification:', error)
    return NextResponse.json(
      { success: false, message: 'Verification failed' },
      { status: 500 }
    )
  }
}