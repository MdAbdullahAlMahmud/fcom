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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const categoryResult = await query(
      'SELECT * FROM categories WHERE id = ?',
      [params.id]
    )
    const category = Array.isArray(categoryResult) ? categoryResult[0] : undefined

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

    // Check if category with same slug exists (excluding current category)
    const existingCategoryResult = await query(
      'SELECT id FROM categories WHERE slug = ? AND id != ?',
      [slug, params.id]
    );
    const existingCategory = Array.isArray(existingCategoryResult) ? existingCategoryResult : [];
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

    // Update category
    await query(
      `UPDATE categories SET
        name = ?,
        slug = ?,
        description = ?,
        parent_id = ?,
        is_active = ?,
        image_url = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        name,
        slug,
        description || null,
        parent_id === null ? null : Number(parent_id),
        is_active ? 1 : 0,
        image_url || null,
        params.id
      ]
    )

    return NextResponse.json({
      message: 'Category updated successfully'
    })
  } catch (error) {
    console.error('Error updating category:', error)
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
    // Verify authentication
    const payload = await verifyAuth()
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if category has children
    const childrenResult = await query(
      'SELECT id FROM categories WHERE parent_id = ?',
      [params.id]
    );
    const children = Array.isArray(childrenResult) ? childrenResult : [];
    if (children.length > 0) {
      return NextResponse.json(
        { message: 'Cannot delete category with subcategories' },
        { status: 400 }
      )
    }

    // Delete category
    await query(
      'DELETE FROM categories WHERE id = ?',
      [params.id]
    )

    return NextResponse.json({
      message: 'Category deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { message: 'Failed to delete category' },
      { status: 500 }
    )
  }
}