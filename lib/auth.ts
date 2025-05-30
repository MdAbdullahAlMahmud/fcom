import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

export async function verifyAuth() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return null
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    return {
      userId: payload.userId,
      email: payload.email,
      isAdmin: payload.isAdmin === true
    }
  } catch (error) {
    console.error('Auth verification error:', error)
    return null
  }
} 