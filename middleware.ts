import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value

  // Public paths that don't require authentication
  const publicPaths = ['/auth/login', '/auth/register', '/auth/forgot-password']
  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  // Admin paths that require authentication
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      
      // Check if user has admin role
      if (payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }

      return NextResponse.next()
    } catch (error) {
      // Clear invalid token
      const response = NextResponse.redirect(new URL('/auth/login', request.url))
      response.cookies.delete('auth-token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password'
  ]
} 