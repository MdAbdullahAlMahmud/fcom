import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { query, transaction } from '@/lib/db/mysql'
import slugify from 'slugify'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

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
    ) as any[]
    const total = countResult.total

    // Get products with category and images
    const products = await query(
      `SELECT 
        p.*,
        c.name as category_name,
        GROUP_CONCAT(
          CONCAT(
            pi.id, ':', 
            pi.image_url, ':', 
            COALESCE(pi.alt_text, '')
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
    ) as any[]

    // Transform the concatenated images string into an array of objects
    const transformedProducts = products.map((product: any) => ({
      ...product,
      images: product.images ? product.images.split(',').map((img: string) => {
        const [id, image_url, alt_text] = img.split(':')
        return {
          id: parseInt(id),
          image_url,
          alt_text: alt_text || null
        }
      }) : []
    }))

    return NextResponse.json({
      products: transformedProducts,
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
    if (!payload || payload.role !== 'admin') {
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
      images,
      html // <-- new field for custom HTML
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
    ) as any[]

    if (existingProduct) {
      return NextResponse.json(
        { message: 'A product with this name already exists' },
        { status: 400 }
      )
    }


    const result = await transaction(async (connection) => {
      // Insert product
      const [productResult] = await connection.execute(
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

      const productId = (productResult as any).insertId

      // Insert product HTML if provided
      if (typeof html === 'string' && html.trim().length > 0) {
        await connection.execute(
          `INSERT INTO product_html (product_id, html) VALUES (?, ?)`,
          [productId, html]
        )
      }

      // Insert images
      if (images && images.length > 0) {
        const imageValues = images.map((image: string, index: number) => [
          productId,
          image,
          null,
          index,
          index === 0 ? 1 : 0
        ])

        const placeholders = imageValues.map(() => '(?, ?, ?, ?, ?)').join(', ')
        const flatValues = imageValues.flat()

        await connection.execute(
          `INSERT INTO product_images (
            product_id, image_url, alt_text, sort_order, is_primary
          ) VALUES ${placeholders}`,
          flatValues
        )
      }

      return productId
    })

    return NextResponse.json({
      message: 'Product created successfully',
      id: result
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { message: 'Failed to create product' },
      { status: 500 }
    )
  }
} 