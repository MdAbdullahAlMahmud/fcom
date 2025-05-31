import FeaturedProducts from '@/components/frontend/home/FeaturedProducts'
import { query } from '@/lib/db/mysql'
import { ArrowRight, Star, TrendingUp, Clock, Tag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

async function getFeaturedProducts() {
  try {
    const products = await query(`
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.price,
        p.sale_price,
        p.short_description,
        pi.image_url,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_featured = 1 AND p.is_active = 1
      LIMIT 8
    `)

    return products
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}

async function getPopularCategories() {
  try {
    const categories = await query(`
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.image_url,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY product_count DESC
      LIMIT 6
    `)

    return categories
  } catch (error) {
    console.error('Error fetching popular categories:', error)
    return []
  }
}

async function getBestSellingProducts() {
  try {
    const products = await query(`
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.price,
        p.sale_price,
        pi.image_url,
        COUNT(oi.id) as order_count
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      LEFT JOIN order_items oi ON p.id = oi.product_id
      WHERE p.is_active = 1
      GROUP BY p.id
      ORDER BY order_count DESC
      LIMIT 4
    `)

    return products
  } catch (error) {
    console.error('Error fetching best selling products:', error)
    return []
  }
}

async function getLatestProducts() {
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
      WHERE p.is_active = 1
      ORDER BY p.created_at DESC
      LIMIT 4
    `)

    return products
  } catch (error) {
    console.error('Error fetching latest products:', error)
    return []
  }
}

async function getSiteSettings() {
  try {
    const settings = await query(`
      SELECT * FROM settings LIMIT 1
    `)
    return settings[0]
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return null
  }
}

export default async function Home() {
  const [
    featuredProducts,
    popularCategories,
    bestSellingProducts,
    latestProducts,
    settings
  ] = await Promise.all([
    getFeaturedProducts(),
    getPopularCategories(),
    getBestSellingProducts(),
    getLatestProducts(),
    getSiteSettings()
  ])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-24 border-b">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-medium text-gray-900 mb-6">
              {settings?.site_name || 'Welcome to Our Store'}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Discover our carefully curated collection of premium products
            </p>
            <Link
              href="/products"
              className="inline-flex items-center text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
            >
              View Collection
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <h2 className="text-2xl font-medium text-gray-900">Featured Products</h2>
            </div>
            <Link
              href="/products?featured=true"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              View All Featured
            </Link>
          </div>
          <FeaturedProducts products={featuredProducts} />
        </div>
      </section>

      {/* Best Selling Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <h2 className="text-2xl font-medium text-gray-900">Best Sellers</h2>
            </div>
            <Link
              href="/products?sort=bestselling"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              View All Best Sellers
            </Link>
          </div>
          <FeaturedProducts products={bestSellingProducts} />
        </div>
      </section>

      {/* Latest Products */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <h2 className="text-2xl font-medium text-gray-900">New Arrivals</h2>
            </div>
            <Link
              href="/products?sort=newest"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              View All New Arrivals
            </Link>
          </div>
          <FeaturedProducts products={latestProducts} />
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-medium text-gray-900">Popular Categories</h2>
            <Link
              href="/categories"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              View All Categories
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularCategories.map((category: any) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group"
              >
                <div className="aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden relative">
                  {category.image_url && (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-xl font-medium text-white mb-2">{category.name}</h3>
                    <p className="text-sm text-white/80">{category.product_count} Products</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-12 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-5 w-5 text-white" />
                  <span className="text-white/80">Special Offer</span>
                </div>
                <h2 className="text-3xl font-medium text-white mb-4">
                  Get 20% Off Your First Order
                </h2>
                <p className="text-white/80 mb-8">
                  Use code WELCOME20 at checkout to get 20% off your first purchase
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-violet-600 rounded-lg font-medium hover:bg-gray-50 transition-colors w-fit"
                >
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
              <div className="hidden md:block relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Stay Updated</h2>
            <p className="text-gray-600 mb-8">
              Subscribe to our newsletter for the latest products and exclusive offers
            </p>
            <form className="flex gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
} 