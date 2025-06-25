'use client'

import Image from 'next/image'
import { Suspense, useState } from 'react'
import { Star, Shield, Truck, RefreshCw, Heart, CheckCircle2 } from 'lucide-react'
import ProductCarousel from '@/components/frontend/products/ProductCarousel'
import AddToCartButton from '@/components/frontend/products/AddToCartButton'
import { RowDataPacket } from 'mysql2'

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
  images: string[]
  material?: string
  weight?: string
  dimensions?: string
  sku?: string
}

interface RelatedProduct extends RowDataPacket {
  id: number
  name: string
  slug: string
  price: number
  sale_price: number | null
  image_url: string
}

interface ProductDetailsProps {
  product: Product & { html?: string }
  relatedProducts: RelatedProduct[]
  discount: number
  savings: string
  html?: string
}

function ProductImages({ product, discount }: { product: Product, discount: number }) {
  const [images, setImages] = useState(product.images)

  const handleImageClick = (index: number) => {
    const newImages = [...images]
    const clickedImage = newImages.splice(index, 1)[0]
    newImages.unshift(clickedImage)
    setImages(newImages)
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
        {/* Discount Badge */}
        {product.sale_price && (
          <div className="absolute top-4 right-4 z-10">
            <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
              {discount}% OFF
            </span>
          </div>
        )}
        
        {/* Main Image with Zoom */}
        <div className="relative w-full h-full">
          <Image
            src={images[0] || '/placeholder.png'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-150"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity" />
        </div>
      </div>
      
      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image: string, index: number) => (
            <button
              key={index}
              onClick={() => handleImageClick(index)}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer group"
            >
              <Image
                src={image}
                alt={`${product.name} - Image ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 768px) 20vw, 10vw"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProductDetails({ product, relatedProducts, discount, savings, html }: ProductDetailsProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Custom HTML Section (if present) */}
      {html && html.trim().length > 0 && (
        <div className="mb-8">
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      )}

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <ProductImages product={product} discount={discount} />

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Category: {product.category_name}</span>
              
            </div>
          </div>

          {/* Price Section */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              {product.sale_price ? (
                <>
                  <span className="text-3xl font-bold">৳{product.sale_price}</span>
                  <span className="text-xl text-gray-500 line-through">৳{product.price}</span>
                  <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                    {discount}% OFF
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold">৳{product.price}</span>
              )}
            </div>
            {product.sale_price && (
              <p className="text-green-600 font-medium">Save ৳{savings} today!</p>
            )}
          </div>

          {/* Add to Cart Section */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <Suspense fallback={<div>Loading...</div>}>
                <AddToCartButton 
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    sale_price: product.sale_price,
                    image_url: product.images[0],
                    slug: product.slug,
                    product_type: product.product_type || 'default' // <-- Pass product_type
                  }} 
                />
              </Suspense>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 py-6 border-t border-b">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-600" />
              <span className="text-sm">Secure Checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-gray-600" />
              <span className="text-sm">Fast Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-gray-600" />
              <span className="text-sm">30-Day Returns</span>
            </div>
          </div>

            <div className="text-gray-700 leading-relaxed space-y-2">
  {(product.description || 'No description available.')
    .replace(/\\n/g, '\n') // 🔥 This is the key: convert literal "\n" to real newline
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map((line, index) => (
      <p key={index}>{line}</p>
    ))}
</div>




          {/* Specifications */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Specifications</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Material</p>
                <p className="font-medium">{product.material || ''}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Weight</p>
                <p className="font-medium">{product.weight || ''}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Dimensions</p>
                <p className="font-medium">{product.dimensions || ''}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">SKU</p>
                <p className="font-medium">{product.sku || ''}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Description Section */}
      

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <ProductCarousel products={relatedProducts} />
        </div>
      )}
    </div>
  )
}