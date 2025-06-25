import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { query, transaction } from '@/lib/db/mysql'
import slugify from 'slugify'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

async function verifyAuth() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth-token')

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
        GROUP_CONCAT(
          CONCAT(
            pi.id, ':', 
            pi.image_url, ':', 
            COALESCE(pi.alt_text, '')
          )
        ) as images,
        ph.html as product_html
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN product_html ph ON p.id = ph.product_id
      WHERE p.id = ?
      GROUP BY p.id`,
      [params.id]
    ) as any[]

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      )
    }

    // Transform the concatenated images string into an array of objects
    const transformedProduct = {
      ...product,
      images: product.images ? product.images.split(',').map((img: string) => {
        const [id, image_url, alt_text] = img.split(':')
        return {
          id: parseInt(id),
          image_url,
          alt_text: alt_text || null
        }
      }) : [],
      html: product.product_html ?? undefined
    }

    return NextResponse.json(transformedProduct)
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
      images,
      html, // <-- new field for custom HTML
      product_type, // <-- add product_type
      download_link // <-- add download_link
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
    ) as any[]

    if (existingProduct) {
      return NextResponse.json(
        { message: 'A product with this name already exists' },
        { status: 400 }
      )
    }

    await transaction(async (connection) => {
      // Always update product_type and download_link robustly
      let updateProductType = product_type;
      if (updateProductType !== 'digital') updateProductType = 'default';
      const updateDownloadLink = updateProductType === 'digital' && download_link ? download_link : null;
      await connection.execute(
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
          category_id = ?,
          product_type = ?,
          download_link = ?,
          updated_at = NOW()
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
          updateProductType,
          updateDownloadLink,
          params.id
        ]
      )

      // Upsert product HTML
      if (typeof html === 'string') {
        // Try update first
        const [result] = await connection.execute(
          `UPDATE product_html SET html = ? WHERE product_id = ?`,
          [html, params.id]
        )
        // If no row was updated, insert
        // @ts-ignore
        if (result.affectedRows === 0) {
          await connection.execute(
            `INSERT INTO product_html (product_id, html) VALUES (?, ?)`,
            [params.id, html]
          )
        }
      } else if (html === null) {
        // If html is null, delete the row so the field is cleared
        await connection.execute(
          'DELETE FROM product_html WHERE product_id = ?',
          [params.id]
        )
      }

      // Delete existing images
      await connection.execute('DELETE FROM product_images WHERE product_id = ?', [params.id])

      // Insert new images
      if (images && images.length > 0) {
        const imageValues = images.map((image: string, index: number) => [
          params.id,
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
    })

    return NextResponse.json({
      message: 'Product updated successfully'
    })
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

    await transaction(async (connection) => {
      // Delete product images
      await connection.execute('DELETE FROM product_images WHERE product_id = ?', [params.id])

      // Delete product
      await connection.execute('DELETE FROM products WHERE id = ?', [params.id])
    })

    return NextResponse.json({
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { message: 'Failed to delete product' },
      { status: 500 }
    )
  }
}