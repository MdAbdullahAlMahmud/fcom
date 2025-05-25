import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { query } from '@/lib/db'
import slugify from 'slugify'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

async function verifyAuth() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')

  if (!token) {
    throw new Error('Not authenticated')
  }

  try {
    const { payload } = await jwtVerify(token.value, JWT_SECRET)
    return payload
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [product] = await query(
      `SELECT 
        p.*,
        c.name as category_name,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', pi.id,
            'image_url', pi.image_url,
            'alt_text', pi.alt_text
          )
        ) as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.id = ?
      GROUP BY p.id`,
      [params.id]
    )

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { message: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await verifyAuth()
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      short_description,
      sku,
      price,
      sale_price,
      stock_quantity,
      weight,
      dimensions,
      category_id,
      is_active,
      is_featured,
      images
    } = body

    // Validate required fields
    if (!name || !sku || !price || stock_quantity === undefined) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate slug
    const slug = slugify(name, { lower: true })

    // Check if slug exists for other products
    const [existingProduct] = await query(
      'SELECT id FROM products WHERE slug = ? AND id != ?',
      [slug, params.id]
    )

    if (existingProduct) {
      return NextResponse.json(
        { message: 'A product with this name already exists' },
        { status: 400 }
      )
    }

    // Start transaction
    await query('START TRANSACTION')

    try {
      // Update product
      await query(
        `UPDATE products SET
          name = ?,
          slug = ?,
          description = ?,
          short_description = ?,
          sku = ?,
          price = ?,
          sale_price = ?,
          stock_quantity = ?,
          weight = ?,
          dimensions = ?,
          is_active = ?,
          is_featured = ?,
          category_id = ?
        WHERE id = ?`,
        [
          name,
          slug,
          description || null,
          short_description || null,
          sku,
          price,
          sale_price || null,
          stock_quantity,
          weight || null,
          dimensions || null,
          is_active ? 1 : 0,
          is_featured ? 1 : 0,
          category_id || null,
          params.id
        ]
      )

      // Delete existing images
      await query('DELETE FROM product_images WHERE product_id = ?', [params.id])

      // Insert new images
      if (images && images.length > 0) {
        const imageValues = images.map((image: string, index: number) => [
          params.id,
          image,
          null,
          index,
          index === 0 ? 1 : 0
        ])

        await query(
          `INSERT INTO product_images (
            product_id, image_url, alt_text, sort_order, is_primary
          ) VALUES ?`,
          [imageValues]
        )
      }

      await query('COMMIT')

      return NextResponse.json({
        message: 'Product updated successfully'
      })
    } catch (error) {
      await query('ROLLBACK')
      throw error
    }
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { message: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await verifyAuth()
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Start transaction
    await query('START TRANSACTION')

    try {
      // Delete product images
      await query('DELETE FROM product_images WHERE product_id = ?', [params.id])

      // Delete product
      await query('DELETE FROM products WHERE id = ?', [params.id])

      await query('COMMIT')

      return NextResponse.json({
        message: 'Product deleted successfully'
      })
    } catch (error) {
      await query('ROLLBACK')
      throw error
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { message: 'Failed to delete product' },
      { status: 500 }
    )
  }
} 