import FeaturedProducts from '@/components/frontend/home/FeaturedProducts'
import { query } from '@/lib/db/mysql'

async function getFeaturedProducts() {
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

    return products
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts()

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to fCommerce
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover amazing products at great prices
          </p>
          <a
            href="/products"
            className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors"
          >
            Shop Now
          </a>
        </div>
      </section>

      {/* Featured Products */}
      <FeaturedProducts products={featuredProducts} />
    </div>
  )
} 