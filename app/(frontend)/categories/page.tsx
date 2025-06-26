import { query } from '@/lib/db/mysql'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

async function getCategories() {
  try {
    const categories = await query(`
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.image_url,
        c.parent_id,
        COUNT(p.id) as product_count,
        (
          SELECT GROUP_CONCAT(sc.id, ':', sc.name, ':', sc.slug, ':', sc.image_url)
          FROM categories sc
          WHERE sc.parent_id = c.id
          LIMIT 3
        ) as subcategories
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
      WHERE c.parent_id IS NULL AND c.is_active = 1
      GROUP BY c.id
      ORDER BY c.name ASC
    `)

    return categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function CategoriesPage() {
  const categoriesRaw = await getCategories()
  const categories = Array.isArray(categoriesRaw) ? categoriesRaw : []

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-medium text-gray-900 mb-4">Categories</h1>
          <p className="text-gray-600">
            Browse our wide range of products by category
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category: any) => {
            const subcategories = category.subcategories
              ? category.subcategories.split(',').map((sub: string) => {
                  const [id, name, slug, image_url] = sub.split(':')
                  return { id, name, slug, image_url }
                })
              : []

            return (
              <div
                key={category.id}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Main Category */}
                <Link
                  href={`/products?category=${category.slug}`}
                  className="block group"
                >
                  <div className="aspect-[16/9] relative">
                    {category.image_url ? (
                      <Image
                        src={category.image_url}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h2 className="text-xl font-medium text-white mb-2">
                        {category.name}
                      </h2>
                      <p className="text-sm text-white/80">
                        {category.product_count} Products
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Subcategories */}
                {subcategories.length > 0 && (
                  <div className="p-6 border-t">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">
                      Popular Subcategories
                    </h3>
                    <div className="space-y-3">
                      {subcategories.map((sub: any) => (
                        <Link
                          key={sub.id}
                          href={`/products?category=${sub.slug}`}
                          className="flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            {sub.image_url && (
                              <div className="w-10 h-10 rounded-md overflow-hidden">
                                <Image
                                  src={sub.image_url}
                                  alt={sub.name}
                                  width={40}
                                  height={40}
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <span className="text-sm text-gray-600 group-hover:text-gray-900">
                              {sub.name}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* View All Link */}
                <div className="p-6 border-t bg-gray-50">
                  <Link
                    href={`/products?category=${category.slug}`}
                    className="flex items-center justify-between text-sm font-medium text-gray-900 hover:text-gray-700"
                  >
                    View All Products
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}