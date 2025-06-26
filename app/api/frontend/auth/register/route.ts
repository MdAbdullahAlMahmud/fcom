import { NextResponse } from 'next/server'
import { query } from '@/lib/db/mysql'
import { generateOTP } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Check if phone number already exists
    const existingCustomerResult = await query(
      'SELECT * FROM registered_customers WHERE phone = ?',
      [phone]
    );
    const existingCustomer = Array.isArray(existingCustomerResult) ? existingCustomerResult[0] : undefined;

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, message: 'Phone number already registered' },
        { status: 400 }
      )
    }

    // Generate OTP
    const otp = generateOTP()

    // Save customer with OTP
    await query(
      `INSERT INTO registered_customers (phone, otp, otp_status) 
       VALUES (?, ?, 'not verified')`,
      [phone, otp]
    )

    // TODO: Send OTP via WhatsApp
    // For now, we'll just return it in the response
    // In production, you should integrate with WhatsApp API
    console.log(`OTP for ${phone}: ${otp}`)

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      // Remove this in production
      otp: otp
    })

  } catch (error: any) {
    console.error('Error in registration:', error)
    return NextResponse.json(
      { success: false, message: 'Registration failed' },
      { status: 500 }
    )
  }
}