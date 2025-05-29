import { NextResponse } from 'next/server'
import { query } from '@/lib/db/mysql'

export async function GET() {
  try {
    // Fetch products with their sales data
    const products = await query(`
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.price,
        p.sale_price,
        p.stock_quantity,
        p.is_active,
        p.created_at,
        p.updated_at,
        COALESCE(SUM(oi.quantity), 0) as sales_count,
        COALESCE(SUM(oi.total_price), 0) as revenue,
        (
          SELECT image_url 
          FROM product_images 
          WHERE product_id = p.id AND is_primary = 1 
          LIMIT 1
        ) as image_url
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.id
      ORDER BY sales_count DESC
    `)

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
} 