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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const offset = (page - 1) * limit
    const whereClause = []
    const params = []

    if (category) {
      whereClause.push('p.category_id = ?')
      params.push(category)
    }

    if (search) {
      whereClause.push('(p.name LIKE ? OR p.sku LIKE ?)')
      params.push(`%${search}%`, `%${search}%`)
    }

    const whereSQL = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : ''

    // Get total count
    const [countResult] = await query(
      `SELECT COUNT(*) as total FROM products p ${whereSQL}`,
      params
    )
    const total = countResult.total

    // Get products with category and images
    const products = await query(
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
      ${whereSQL}
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { message: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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

    // Check if slug exists
    const [existingProduct] = await query(
      'SELECT id FROM products WHERE slug = ?',
      [slug]
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
      // Insert product
      const [result] = await query(
        `INSERT INTO products (
          name, slug, description, short_description, sku,
          price, sale_price, stock_quantity, weight, dimensions,
          is_active, is_featured, category_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          category_id || null
        ]
      )

      const productId = result.insertId

      // Insert images
      if (images && images.length > 0) {
        const imageValues = images.map((image: string, index: number) => [
          productId,
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
        message: 'Product created successfully',
        id: productId
      })
    } catch (error) {
      await query('ROLLBACK')
      throw error
    }
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { message: 'Failed to create product' },
      { status: 500 }
    )
  }
} 