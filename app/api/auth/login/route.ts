import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'
import { compare } from 'bcrypt'
import { query } from '@/lib/db/mysql'
import type { User } from '@/types/database'

// Ensure we have a valid JWT secret
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-2024'
)

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    console.log('Login attempt for:', email)

    // Get user from database
    const [user] = await query<User[]>(
      'SELECT * FROM users WHERE email = ? AND status = "active"',
      [email]
    )

    if (!user) {
      console.log('User not found:', email)
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await compare(password, user.password)
    if (!isValid) {
      console.log('Invalid password for user:', email)
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    console.log('Login successful for user:', email)

    // Generate JWT token
    const token = await new SignJWT({ 
      userId: user.id,
      role: user.role 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET)

    // Set the auth token cookie with the correct name
    cookies().set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({ 
      user: userWithoutPassword,
      message: 'Login successful'
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 500 }
    )
  }
} 