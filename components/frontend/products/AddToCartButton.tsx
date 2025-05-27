'use client'

import { useCart } from '@/contexts/CartContext'
import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'

interface AddToCartButtonProps {
  product: {
    id: number
    name: string
    price: number
    sale_price: number | null
    image_url: string
  }
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    setIsAdding(true)
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      sale_price: product.sale_price,
      image_url: product.image_url,
    })
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
    setTimeout(() => setIsAdding(false), 1000)
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`w-full md:w-auto bg-black text-white px-8 py-3 rounded-full transition-colors ${
        isAdding ? 'bg-green-600' : 'hover:bg-gray-800'
      }`}
    >
      {isAdding ? 'Added to Cart!' : 'Add to Cart'}
    </button>
  )
} 