'use client'

import { useState } from 'react'

interface Size {
  id: number
  name: string
  inStock: boolean
}

interface SizeSelectorProps {
  productId: number
}

export default function SizeSelector({ productId }: SizeSelectorProps) {
  // This would typically come from an API call
  const sizes: Size[] = [
    { id: 1, name: 'XS', inStock: true },
    { id: 2, name: 'S', inStock: true },
    { id: 3, name: 'M', inStock: true },
    { id: 4, name: 'L', inStock: false },
    { id: 5, name: 'XL', inStock: true },
  ]

  const [selectedSize, setSelectedSize] = useState<number | null>(null)

  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((size) => (
        <button
          key={size.id}
          onClick={() => size.inStock && setSelectedSize(size.id)}
          disabled={!size.inStock}
          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
            selectedSize === size.id
              ? 'border-black bg-black text-white'
              : size.inStock
              ? 'border-gray-200 hover:border-gray-300'
              : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
        >
          {size.name}
          {!size.inStock && (
            <span className="block text-xs mt-1">Out of stock</span>
          )}
        </button>
      ))}
    </div>
  )
} 