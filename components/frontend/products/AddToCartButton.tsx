'use client'

import { useCart } from '@/contexts/CartContext'
import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { CheckCircle2, ShoppingCart, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Product {
  id: number
  name: string
  price: number | string
  sale_price: number | string | null
  image_url: string
  slug: string
}

interface AddToCartButtonProps {
  product: Product
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export default function AddToCartButton({ 
  product, 
  variant = 'primary',
  size = 'md' 
}: AddToCartButtonProps) {
  const { addItem } = useCart()
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)
  const [showSparkles, setShowSparkles] = useState(false)

  const handleAddToCart = () => {
    setIsAdding(true)
    setShowSparkles(true)

    // Convert prices to numbers if they're strings
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price
    const salePrice = product.sale_price 
      ? (typeof product.sale_price === 'string' ? parseFloat(product.sale_price) : product.sale_price)
      : null

    addItem({
      id: product.id,
      name: product.name,
      price: price,
      sale_price: salePrice,
      image_url: product.image_url
    })

    toast({
      title: '✨ Added to cart!',
      description: `${product.name} is ready for checkout.`,
      className: 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50',
    })

    setTimeout(() => {
      setIsAdding(false)
      setShowSparkles(false)
    }, 2000)
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5'
  }

  const variantClasses = {
    primary: isAdding 
      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/25' 
      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-transparent text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40',
    secondary: isAdding
      ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-md hover:shadow-lg',
    ghost: isAdding
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800'
  }

  return (
    <div className="relative">
      <motion.button
        onClick={handleAddToCart}
        disabled={isAdding}
        whileHover={{ 
          scale: 1.02,
          transition: { type: "spring", stiffness: 400, damping: 10 }
        }}
        whileTap={{ scale: 0.98 }}
        className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          font-semibold flex items-center justify-center rounded-2xl border-2 
          transition-all duration-300 ease-out transform-gpu
          focus:outline-none focus:ring-4 focus:ring-blue-500/20
          disabled:cursor-not-allowed relative overflow-hidden
          backdrop-blur-sm
        `}
      >
        <AnimatePresence mode="wait">
          {isAdding ? (
            <motion.div
              key="added"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center gap-2"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <CheckCircle2 className="w-5 h-5" />
              </motion.div>
              <span>Added!</span>
            </motion.div>
          ) : (
            <motion.div
              key="add"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center gap-2"
            >
              <motion.div
                whileHover={{ 
                  rotate: [0, -10, 10, -10, 0],
                  transition: { duration: 0.5 }
                }}
              >
                <ShoppingCart className="w-5 h-5" />
              </motion.div>
              <span>Add to Cart</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sparkle effect */}
        <AnimatePresence>
          {showSparkles && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 0, 
                    scale: 0,
                    x: 0,
                    y: 0
                  }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0, 1, 0],
                    x: [0, (i - 1) * 30, (i - 1) * 60],
                    y: [0, -20 - i * 10, -40 - i * 20]
                  }}
                  transition={{ 
                    duration: 1.5,
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                  className="absolute pointer-events-none"
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Shimmer effect */}
        {!isAdding && variant === 'primary' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "linear"
            }}
          />
        )}
      </motion.button>
    </div>
  )
}