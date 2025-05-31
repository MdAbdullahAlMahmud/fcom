import FeaturedProducts from '@/components/frontend/home/FeaturedProducts'
import { query } from '@/lib/db/mysql'
import { ArrowRight, Star, TrendingUp, Clock, Tag, Sparkles, Heart, Gift } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Floating elements for visual interest */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full opacity-20 animate-pulse delay-500"></div>
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-full px-4 py-2 mb-8">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-medium text-indigo-700">New Collection Available</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 bg-clip-text text-transparent mb-6 leading-tight">
              {settings?.site_name || 'Beautiful Things'}
            </h1>
            
            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Discover our carefully curated collection of premium products that bring joy to everyday moments
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/products"
                className="group inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-slate-800 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Explore Collection
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium px-8 py-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
              >
                <Heart className="h-4 w-4" />
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-white/70 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Featured Products</h2>
                <p className="text-slate-600">Our most loved items</p>
              </div>
            </div>
            <Link
              href="/products?featured=true"
              className="group text-slate-600 hover:text-slate-900 font-medium flex items-center gap-2 transition-colors"
            >
              View All Featured
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <FeaturedProducts products={featuredProducts} />
        </div>
      </section>

      {/* Best Selling Products */}
      <section className="py-24 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Best Sellers</h2>
                <p className="text-slate-600">What everyone's buying</p>
              </div>
            </div>
            <Link
              href="/products?sort=bestselling"
              className="group text-slate-600 hover:text-slate-900 font-medium flex items-center gap-2 transition-colors"
            >
              View All Best Sellers
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <FeaturedProducts products={bestSellingProducts} />
        </div>
      </section>

      {/* Latest Products */}
      <section className="py-24 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-2xl">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">New Arrivals</h2>
                <p className="text-slate-600">Fresh additions to our store</p>
              </div>
            </div>
            <Link
              href="/products?sort=newest"
              className="group text-slate-600 hover:text-slate-900 font-medium flex items-center gap-2 transition-colors"
            >
              View All New Arrivals
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <FeaturedProducts products={latestProducts} />
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Popular Categories</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Explore our diverse range of carefully curated product categories
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularCategories.map((category: any) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group"
              >
                <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
                  {category.image_url && (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors">{category.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-white/90 font-medium">{category.product_count} Products</span>
                      <ArrowRight className="h-4 w-4 text-white/90 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-3xl overflow-hidden shadow-2xl">
            {/* Decorative elements */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            
            <div className="grid md:grid-cols-2 items-center">
              <div className="p-12 lg:p-16">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                  <Gift className="h-5 w-5 text-white" />
                  <span className="text-white font-medium">Limited Time Offer</span>
                </div>
                
                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                  Get <span className="text-yellow-300">20% Off</span><br />
                  Your First Order
                </h2>
                
                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  Use code <span className="font-bold bg-white/20 px-3 py-1 rounded-lg">WELCOME20</span> at checkout to get 20% off your first purchase
                </p>
                
                <Link
                  href="/products"
                  className="group inline-flex items-center gap-3 bg-white text-violet-600 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  Shop Now
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              <div className="hidden md:block relative p-12">
                <div className="aspect-square bg-gradient-to-br from-white/20 to-white/5 rounded-3xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <Tag className="h-24 w-24 text-white/60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-white/90 font-medium">Stay in the Loop</span>
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-6">Never Miss a Thing</h2>
            <p className="text-xl text-slate-300 mb-12 leading-relaxed">
              Subscribe to our newsletter for the latest products, exclusive offers, and insider updates delivered to your inbox
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 text-lg bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="px-8 py-4 text-lg font-bold text-slate-900 bg-white rounded-2xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Subscribe
              </button>
            </form>
            
            <p className="text-sm text-slate-400 mt-6">
              No spam, unsubscribe at any time
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}