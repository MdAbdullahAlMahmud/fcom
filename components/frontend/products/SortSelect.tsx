'use client'

import { useRouter } from 'next/navigation'

interface SortSelectProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function SortSelect({ searchParams }: SortSelectProps) {
  const router = useRouter()

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const url = new URL(window.location.href)
    url.searchParams.set('sort', e.target.value)
    router.push(url.toString())
  }

  return (
    <select
      className="px-4 py-2 border rounded-lg"
      defaultValue={searchParams.sort || 'newest'}
      onChange={handleSort}
    >
      <option value="newest">Newest</option>
      <option value="price-low">Price: Low to High</option>
      <option value="price-high">Price: High to Low</option>
      <option value="name-asc">Name: A to Z</option>
      <option value="name-desc">Name: Z to A</option>
    </select>
  )
} 