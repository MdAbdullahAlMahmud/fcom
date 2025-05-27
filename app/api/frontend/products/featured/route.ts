import { NextResponse } from 'next/server'
import { query } from '@/lib/db/mysql'

export async function GET() {
  try {
    const products = await query(`
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.price,
        p.sale_price,
        pi.image_url
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      WHERE p.is_featured = 1 AND p.is_active = 1
      LIMIT 8
    `)

    console.log('Featured Products:', products) // Debug log

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return NextResponse.json(
      { message: 'Failed to fetch featured products' },
      { status: 500 }
    )
  }
} 