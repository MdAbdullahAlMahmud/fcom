import { query } from '@/lib/db/mysql'
import Link from 'next/link'
import { Suspense } from 'react'
import FilterForm from '@/components/frontend/products/FilterForm'
import SortSelect from '@/components/frontend/products/SortSelect'
import ProductCard from '@/components/frontend/products/ProductCard'

async function getCategories() {
  try {
    const categoriesRaw = await query(`
      SELECT id, name, slug
      FROM categories
      WHERE is_active = 1
      ORDER BY name
    `)
    return Array.isArray(categoriesRaw) && categoriesRaw.length > 0 && typeof categoriesRaw[0] === 'object' && 'id' in categoriesRaw[0] && !('affectedRows' in categoriesRaw[0]) ? categoriesRaw : []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

async function getProducts(searchParams: { [key: string]: string | string[] | undefined }) {
  try {
    const category = searchParams.category as string
    const sort = searchParams.sort as string
    const minPrice = searchParams.minPrice as string
    const maxPrice = searchParams.maxPrice as string

    let sqlQuery = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.price,
        p.sale_price,
        pi.image_url,
        c.name as category_name
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `

    const params: any[] = []

    if (category && category !== 'all') {
      sqlQuery += ' AND c.slug = ?'
      params.push(category)
    }

    if (minPrice) {
      sqlQuery += ' AND p.price >= ?'
      params.push(minPrice)
    }

    if (maxPrice) {
      sqlQuery += ' AND p.price <= ?'
      params.push(maxPrice)
    }

    // Add sorting
    switch (sort) {
      case 'price-low':
        sqlQuery += ' ORDER BY p.price ASC'
        break
      case 'price-high':
        sqlQuery += ' ORDER BY p.price DESC'
        break
      case 'name-asc':
        sqlQuery += ' ORDER BY p.name ASC'
        break
      case 'name-desc':
        sqlQuery += ' ORDER BY p.name DESC'
        break
      default:
        sqlQuery += ' ORDER BY p.created_at DESC'
    }

    const productsRaw = await query(sqlQuery, params)
    return Array.isArray(productsRaw) && productsRaw.length > 0 && typeof productsRaw[0] === 'object' && 'id' in productsRaw[0] && !('affectedRows' in productsRaw[0]) ? productsRaw : []
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const [products, categories] = await Promise.all([
    getProducts(searchParams),
    getCategories(),
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Categories</h3>
            <div className="space-y-2">
              <Link
                href="/products"
                className={`block px-4 py-2 rounded-full ${
                  !searchParams.category || searchParams.category === 'all'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                All Categories
              </Link>
              {categories.map((category: any) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className={`block px-4 py-2 rounded-full ${
                    searchParams.category === category.slug
                      ? 'bg-black text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Price Range</h3>
            <Suspense fallback={<div>Loading filters...</div>}>
              <FilterForm searchParams={searchParams} />
            </Suspense>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Sort Options */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">All Products</h1>
            <Suspense fallback={<div>Loading sort options...</div>}>
              <SortSelect searchParams={searchParams} />
            </Suspense>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}