import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { query } from '@/lib/db/mysql'
import slugify from 'slugify'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-2024'
)

async function verifyAuth() {
  const token = cookies().get('auth-token')?.value

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export async function GET() {
  try {
    const categories = await query(
      'SELECT * FROM categories ORDER BY name ASC'
    )
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { message: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Verify authentication
    const payload = await verifyAuth()
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, parent_id, is_active, image_url } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if category with same slug exists
    const existingCategoryResult = await query(
      'SELECT id FROM categories WHERE slug = ?',
      [slug]
    )
    const existingCategory = Array.isArray(existingCategoryResult)
      ? existingCategoryResult
      : []
    if (existingCategory.length > 0) {
      return NextResponse.json(
        { message: 'A category with this name already exists' },
        { status: 400 }
      )
    }

    // Validate parent_id if provided
    if (parent_id !== null && parent_id !== undefined) {
      const parentExistsResult = await query(
        'SELECT id FROM categories WHERE id = ?',
        [parent_id]
      );
      const parentExists = Array.isArray(parentExistsResult) ? parentExistsResult : [];
      if (parentExists.length === 0) {
        return NextResponse.json(
          { message: 'Parent category does not exist' },
          { status: 400 }
        )
      }
    }

    // Insert new category
    const insertResult = await query(
      `INSERT INTO categories (
        name,
        slug,
        description,
        parent_id,
        is_active,
        image_url,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        name,
        slug,
        description || null,
        parent_id === null ? null : Number(parent_id),
        is_active ? 1 : 0,
        image_url || null
      ]
    );
    const categoryId = insertResult && typeof insertResult === 'object' && 'insertId' in insertResult ? (insertResult as any).insertId : undefined;

    return NextResponse.json({
      message: 'Category created successfully',
      categoryId
    })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { message: 'Failed to create category' },
      { status: 500 }
    )
  }
}