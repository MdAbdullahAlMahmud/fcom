'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Star, Eye, Tag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AddToCartButton from './AddToCartButton'

interface Product {
  id: number
  name: string
  price: number | string
  sale_price: number | string | null
  image_url: string
  rating?: number
  reviews?: number
  badge?: string
  category?: string
  slug: string
}

interface ProductCardProps {
  product: Product
  onQuickView?: (product: Product) => void
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()
  
  // Convert prices to numbers for calculations
  const numPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price
  const numSalePrice = product.sale_price 
    ? (typeof product.sale_price === 'string' ? parseFloat(product.sale_price) : product.sale_price)
    : null
  
  const hasDiscount = numSalePrice && numSalePrice < numPrice
  const discountPercentage = hasDiscount 
    ? Math.round(((numPrice - numSalePrice) / numPrice) * 100)
    : 0

  const displayPrice = numSalePrice || numPrice

  const handleProductClick = () => {
    router.push(`/products/${product.slug}`)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(true) // Stop showing shimmer even on error
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -4,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 max-w-sm"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Badges */}
        <div className="absolute top-2 left-2 z-30 flex flex-col gap-1">
          {product.badge && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg"
            >
              {product.badge}
            </motion.div>
          )}
          {hasDiscount && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
            >
              <Tag className="w-3 h-3" />
              -{discountPercentage}%
            </motion.div>
          )}
        </div>

        {/* Like Button - Top Right */}
        <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              setIsLiked(!isLiked)
            }}
            className={`p-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 ${
              isLiked 
                ? 'bg-red-500 text-white' 
                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </motion.button>
        </div>

        {/* Product Image with optimized loading */}
        <div className="relative w-full h-full">
          {!imageError ? (
            <>
              <img
                src={product.image_url}
                alt={product.name}
                onLoad={handleImageLoad}
                onError={handleImageError}
                className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                loading="lazy"
                decoding="async"
              />
              
              {/* Loading Shimmer - Only show when image is not loaded */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-xs">Image not available</p>
              </div>
            </div>
          )}
        </div>

        {/* Center Eye Button - Appears on Hover with proper z-index */}
        <AnimatePresence>
          {isHovered && imageLoaded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] z-20"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleProductClick}
                className="bg-white text-gray-800 p-4 rounded-full shadow-2xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 border-2 border-white/80 hover:border-blue-200"
              >
                <Eye className="w-6 h-6" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {/* Category */}
        {product.category && (
          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
            {product.category}
          </span>
        )}

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating!)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            {product.reviews && (
              <span className="text-xs text-gray-500">({product.reviews})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            ৳{displayPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-500 line-through">
              ৳{numPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <div className="pt-1">
          <AddToCartButton 
            product={{
              ...product,
              price: numPrice,
              sale_price: numSalePrice
            }} 
            variant="primary"
            size="sm"
          />
        </div>
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-200 transition-colors duration-300 pointer-events-none" />
    </motion.div>
  )
}