import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { compare, hash } from 'bcrypt'
import { query } from '@/lib/db/mysql'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key-2024')

export async function PUT(request: Request) {
  try {
    const token = cookies().get('token')?.value
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify token and get user ID
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as string

    // Get request body
    const { name, email, currentPassword, newPassword } = await request.json()

    // Get current user data
    const userResult = await query(
      'SELECT * FROM admins WHERE id = ?',
      [userId]
    );
    const user = Array.isArray(userResult) ? userResult[0] : undefined;

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // If changing password, verify current password
    let isValid = false;
    if (currentPassword && newPassword && user && typeof user === 'object' && 'password' in user) {
      isValid = await compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json(
          { message: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      // Hash new password
      const hashedPassword = await hash(newPassword, 10)
      await query(
        'UPDATE admins SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      )
    }

    // Update user profile
    await query(
      'UPDATE admins SET name = ?, email = ? WHERE id = ?',
      [name, email, userId]
    )

    return NextResponse.json({ message: 'Profile updated successfully' })
  } catch (error: any) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { message: 'Failed to update profile' },
      { status: 500 }
    )
  }
}