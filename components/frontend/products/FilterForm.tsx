'use client'

import { useRouter } from 'next/navigation'

interface FilterFormProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function FilterForm({ searchParams }: FilterFormProps) {
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const url = new URL(window.location.href)
    
    const minPrice = formData.get('minPrice')
    const maxPrice = formData.get('maxPrice')
    
    if (minPrice) url.searchParams.set('minPrice', minPrice.toString())
    else url.searchParams.delete('minPrice')
    
    if (maxPrice) url.searchParams.set('maxPrice', maxPrice.toString())
    else url.searchParams.delete('maxPrice')
    
    router.push(url.toString())
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-600 mb-1">Min Price</label>
        <input
          type="number"
          name="minPrice"
          defaultValue={searchParams.minPrice as string}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Min"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">Max Price</label>
        <input
          type="number"
          name="maxPrice"
          defaultValue={searchParams.maxPrice as string}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Max"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
      >
        Apply Filters
      </button>
    </form>
  )
} 