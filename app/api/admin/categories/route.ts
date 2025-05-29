import { NextResponse } from 'next/server'
import { query } from '@/lib/db/mysql'

export async function GET() {
  try {
    // Fetch categories with their sales data
    const categories = await query(`
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.image_url,
        c.is_active,
        COALESCE(SUM(oi.total_price), 0) as revenue,
        ROUND(
          (COALESCE(SUM(oi.total_price), 0) / 
          (SELECT COALESCE(SUM(total_price), 0) FROM order_items)) * 100,
          2
        ) as percentage
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY c.id
      ORDER BY revenue DESC
    `)

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
} 