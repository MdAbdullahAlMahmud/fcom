import { query } from '@/lib/db/mysql'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import AddToCartButton from '@/components/frontend/products/AddToCartButton'

async function getProduct(slug: string) {
  try {
    const products = await query(`
      SELECT 
        p.*,
        pi.image_url,
        c.name as category_name
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ? AND p.is_active = 1
    `, [slug])

    return products[0]
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative h-[500px] bg-white rounded-lg overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              No Image
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            {product.category_name && (
              <p className="text-gray-600">Category: {product.category_name}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {product.sale_price ? (
              <>
                <span className="text-3xl text-red-600 font-bold">
                  ${Number(product.sale_price).toFixed(2)}
                </span>
                <span className="text-xl text-gray-500 line-through">
                  ${Number(product.price).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold">
                ${Number(product.price).toFixed(2)}
              </span>
            )}
          </div>

          {product.short_description && (
            <p className="text-gray-600">{product.short_description}</p>
          )}

          {product.description && (
            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p>{product.description}</p>
            </div>
          )}

          <div className="pt-4">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  )
} 