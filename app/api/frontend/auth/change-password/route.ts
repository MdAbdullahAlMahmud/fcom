import { NextResponse } from 'next/server'
import { query } from '@/lib/db/mysql'
import bcrypt from 'bcryptjs'
import { generateOTP } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const { phone, otp, newPassword } = await request.json()

    if (!phone || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Phone, OTP and new password are required' },
        { status: 400 }
      )
    }

    // Get customer with OTP
    const [customer] = await query(
      'SELECT * FROM registered_customers WHERE phone = ? AND otp = ?',
      [phone, otp]
    )

    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await query(
      `UPDATE registered_customers 
       SET password = ?,
           last_verified = CURRENT_TIMESTAMP
       WHERE phone = ?`,
      [hashedPassword, phone]
    )

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    })

  } catch (error: any) {
    console.error('Error in password change:', error)
    return NextResponse.json(
      { success: false, message: 'Password change failed' },
      { status: 500 }
    )
  }
}

// Request OTP for password change
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Check if customer exists
    const [customer] = await query(
      'SELECT * FROM registered_customers WHERE phone = ?',
      [phone]
    )

    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Phone number not registered' },
        { status: 404 }
      )
    }

    // Generate new OTP
    const otp = generateOTP()

    // Update OTP
    await query(
      'UPDATE registered_customers SET otp = ? WHERE phone = ?',
      [otp, phone]
    )

    // TODO: Send OTP via WhatsApp
    // For now, we'll just return it in the response
    console.log(`OTP for ${phone}: ${otp}`)

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      // Remove this in production
      otp: otp
    })

  } catch (error: any) {
    console.error('Error in OTP generation:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send OTP' },
      { status: 500 }
    )
  }
} 