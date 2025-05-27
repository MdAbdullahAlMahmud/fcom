'use client'

import Image from 'next/image'
import Link from 'next/link'
import AddToCartButton from './AddToCartButton'

interface ProductCardProps {
  product: {
    id: number
    name: string
    slug: string
    price: number
    sale_price: number | null
    image_url: string
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group">
      <Link href={`/products/${product.slug}`}>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative h-64">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                No Image
              </div>
            )}
          </div>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
            <div className="flex items-center gap-2">
              {product.sale_price ? (
                <>
                  <span className="text-red-600 font-bold">
                    ${Number(product.sale_price).toFixed(2)}
                  </span>
                  <span className="text-gray-500 line-through">
                    ${Number(product.price).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="font-bold">${Number(product.price).toFixed(2)}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
      <div className="mt-4">
        <AddToCartButton product={product} />
      </div>
    </div>
  )
} 