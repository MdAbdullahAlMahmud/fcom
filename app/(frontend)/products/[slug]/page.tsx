import { query } from '@/lib/db/mysql'
import { notFound } from 'next/navigation'
import { RowDataPacket } from 'mysql2'
import ProductDetails from './ProductDetails'

interface Product extends RowDataPacket {
  id: number
  name: string
  slug: string
  price: number
  sale_price: number | null
  description: string
  category_id: number
  category_name: string
  category_slug: string
  images: string
  material?: string
  weight?: string
  dimensions?: string
  sku?: string
}

interface ProductWithImages extends Omit<Product, 'images'> {
  images: string[]
}

interface RelatedProduct extends RowDataPacket {
  id: number
  name: string
  slug: string
  price: number
  sale_price: number | null
  image_url: string
}

async function getProduct(slug: string): Promise<ProductWithImages & { html?: string } | null> {
  try {
    const products = await query(`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        GROUP_CONCAT(pi.image_url) as images,
        ph.html as product_html
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN product_html ph ON p.id = ph.product_id
      WHERE p.slug = ? AND p.is_active = 1
      GROUP BY p.id
    `, [slug]) as (Product & { product_html?: string })[]

    const product = products[0]
    if (!product) return null

    // Convert comma-separated images string to array
    const images = product.images ? product.images.split(',') : []
    
    return {
      ...product,
      images,
      html: product.product_html || undefined
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

async function getRelatedProducts(categoryId: number, currentProductId: number): Promise<RelatedProduct[]> {
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
      WHERE p.category_id = ? 
      AND p.id != ? 
      AND p.is_active = 1
      LIMIT 4
    `, [categoryId, currentProductId]) as RelatedProduct[]
    
    return products
  } catch (error) {
    console.error('Error fetching related products:', error)
    return []
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  
  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.category_id, product.id)
  const discount = product.sale_price ? Math.round(((product.price - product.sale_price) / product.price) * 100) : 0
  const savings = product.sale_price ? (product.price - product.sale_price).toFixed(2) : '0'

  return <ProductDetails 
    product={product as any} 
    relatedProducts={relatedProducts} 
    discount={discount} 
    savings={savings} 
    html={product.html || ''}
  />
}