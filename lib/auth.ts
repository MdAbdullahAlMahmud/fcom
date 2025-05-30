import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

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


export function generateToken(payload: any) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET)
    } catch (error) {
        return null
    }
}