import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { query } from '@/lib/db/mysql'
import slugify from 'slugify'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [category] = await query(
      'SELECT * FROM categories WHERE id = ?',
      [params.id]
    )

    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = cookies().get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.sub as string

    // Verify user is admin
    const [user] = await query(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    )

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { name, description, parent_id, image_url, is_active } = data

    // Generate slug from name
    const slug = slugify(name, { lower: true, strict: true })

    // Check if slug already exists for a different category
    const [existingCategory] = await query(
      'SELECT id FROM categories WHERE slug = ? AND id != ?',
      [slug, params.id]
    )

    if (existingCategory) {
      return NextResponse.json(
        { message: 'A category with this name already exists' },
        { status: 400 }
      )
    }

    // Update category
    await query(
      `UPDATE categories SET
        name = ?,
        slug = ?,
        description = ?,
        parent_id = ?,
        image_url = ?,
        is_active = ?
      WHERE id = ?`,
      [name, slug, description, parent_id, image_url, is_active, params.id]
    )

    return NextResponse.json({ message: 'Category updated successfully' })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update category' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = cookies().get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.sub as string

    // Verify user is admin
    const [user] = await query(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    )

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if category has child categories
    const [childCategories] = await query(
      'SELECT id FROM categories WHERE parent_id = ?',
      [params.id]
    )

    if (childCategories && childCategories.length > 0) {
      return NextResponse.json(
        { message: 'Cannot delete category with child categories' },
        { status: 400 }
      )
    }

    // Delete category
    await query('DELETE FROM categories WHERE id = ?', [params.id])

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete category' },
      { status: 500 }
    )
  }
} 