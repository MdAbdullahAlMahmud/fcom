'use client'

import { useState } from 'react'

interface Color {
  id: number
  name: string
  hex: string
}

interface ColorSelectorProps {
  productId: number
}

export default function ColorSelector({ productId }: ColorSelectorProps) {
  // This would typically come from an API call
  const colors: Color[] = [
    { id: 1, name: 'Black', hex: '#000000' },
    { id: 2, name: 'White', hex: '#FFFFFF' },
    { id: 3, name: 'Red', hex: '#FF0000' },
    { id: 4, name: 'Blue', hex: '#0000FF' },
  ]

  const [selectedColor, setSelectedColor] = useState<number | null>(null)

  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((color) => (
        <button
          key={color.id}
          onClick={() => setSelectedColor(color.id)}
          className={`relative w-10 h-10 rounded-full border-2 transition-all ${
            selectedColor === color.id
              ? 'border-black scale-110'
              : 'border-transparent hover:border-gray-300'
          }`}
          style={{ backgroundColor: color.hex }}
          aria-label={`Select ${color.name} color`}
        >
          {selectedColor === color.id && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-white opacity-50" />
            </div>
          )}
        </button>
      ))}
    </div>
  )
} 