import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { query } from '@/lib/db/mysql'
import slugify from 'slugify'

export async function GET() {
  try {
    const categories = await query(
      'SELECT * FROM categories ORDER BY name ASC'
    )
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Database query error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Verify authentication
    const token = cookies().get('token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    )

    // Verify admin role
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { name, description, parent_id, image_url, is_active } = data

    // Generate slug from name
    const slug = slugify(name, { lower: true })

    // Check if slug already exists
    const [existingCategory] = await query(
      'SELECT id FROM categories WHERE slug = ?',
      [slug]
    )

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 400 }
      )
    }

    // Insert new category
    const result = await query(
      `INSERT INTO categories (name, slug, description, parent_id, image_url, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        slug,
        description || null,
        parent_id || null,
        image_url || null,
        is_active ? 1 : 0,
      ]
    )

    return NextResponse.json({
      id: result.insertId,
      name,
      slug,
      description,
      parent_id,
      image_url,
      is_active,
    })
  } catch (error) {
    console.error('Database query error:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
} 