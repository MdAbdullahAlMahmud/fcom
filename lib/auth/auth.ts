import { cookies } from 'next/headers'
import { jwtVerify, SignJWT } from 'jose'
import { User, UserRole, LoginCredentials, RegisterData, AuthResponse, AuthError } from './types'
import { db } from '@/lib/db'
import { hash, compare } from 'bcrypt'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key-2024')

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

export async function createUser(data: RegisterData): Promise<User> {
  const hashedPassword = await hashPassword(data.password)
  
  const user = await db.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: data.role || UserRole.STAFF
    }
  })

  return user
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const user = await db.user.findUnique({
    where: { email: credentials.email }
  })

  if (!user) {
    throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } as AuthError
  }

  const isValid = await verifyPassword(credentials.password, user.password)

  if (!isValid) {
    throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } as AuthError
  }

  const token = await new SignJWT({ userId: user.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    },
    token
  }
}

export async function verifyAuth(token: string): Promise<User> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const user = await db.user.findUnique({
      where: { id: payload.userId as string }
    })

    if (!user) {
      throw new Error('User not found')
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  } catch (error) {
    throw { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } as AuthError
  }
}

export async function getSession(): Promise<User | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    return null
  }

  try {
    return await verifyAuth(token)
  } catch {
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const session = await getSession()
  
  if (!session) {
    throw { code: 'UNAUTHORIZED', message: 'Authentication required' } as AuthError
  }

  return session
}

export async function requireRole(role: UserRole): Promise<User> {
  const user = await requireAuth()
  
  if (user.role !== role) {
    throw { code: 'FORBIDDEN', message: 'Insufficient permissions' } as AuthError
  }

  return user
} 