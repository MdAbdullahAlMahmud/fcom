'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import Image from 'next/image'

interface Category {
  id: number
  name: string
}

interface Product {
  id: number
  name: string
  slug: string
  description: string
  short_description: string
  sku: string
  price: number
  sale_price: number | null
  stock_quantity: number
  weight: number | null
  dimensions: string | null
  is_active: boolean
  is_featured: boolean
  category_id: number | null
  images: { id: number; image_url: string; alt_text: string | null }[]
}

export default function EditProductPage({
  params
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  useEffect(() => {
    fetchCategories()
    fetchProduct()
  }, [params.id])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to fetch categories')
    }
  }

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch product')
      const data = await response.json()
      setProduct(data)
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Failed to fetch product')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedImages(files)

    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file))
    setPreviewUrls(urls)
  }

  const uploadImages = async () => {
    const uploadedUrls: string[] = []
    
    for (const image of selectedImages) {
      const formData = new FormData()
      formData.append('file', image)

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('Failed to upload image')
        }

        const data = await response.json()
        uploadedUrls.push(data.url)
      } catch (error) {
        console.error('Error uploading image:', error)
        throw new Error('Failed to upload image')
      }
    }

    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    setIsLoading(true)

    try {
      // Upload new images if any
      const newImageUrls = await uploadImages()

      // Update product
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...product,
          images: [...product.images.map(img => img.image_url), ...newImageUrls],
          price: parseFloat(product.price.toString()),
          sale_price: product.sale_price ? parseFloat(product.sale_price.toString()) : null,
          stock_quantity: parseInt(product.stock_quantity.toString()),
          weight: product.weight ? parseFloat(product.weight.toString()) : null,
          category_id: product.category_id ? parseInt(product.category_id.toString()) : null
        }),
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update product')
      }

      toast.success('Product updated successfully')
      router.push('/admin/products')
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update product')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!product) {
    return <div>Product not found</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={product.sku}
                onChange={(e) => setProduct({ ...product, sku: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={product.price}
                onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale_price">Sale Price</Label>
              <Input
                id="sale_price"
                type="number"
                step="0.01"
                value={product.sale_price || ''}
                onChange={(e) => setProduct({ ...product, sale_price: e.target.value ? parseFloat(e.target.value) : null })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Stock Quantity</Label>
              <Input
                id="stock_quantity"
                type="number"
                value={product.stock_quantity}
                onChange={(e) => setProduct({ ...product, stock_quantity: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={product.category_id?.toString() || ''}
                onValueChange={(value) => setProduct({ ...product, category_id: value ? parseInt(value) : null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_description">Short Description</Label>
            <Textarea
              id="short_description"
              value={product.short_description || ''}
              onChange={(e) => setProduct({ ...product, short_description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={product.description || ''}
              onChange={(e) => setProduct({ ...product, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={product.weight || ''}
                onChange={(e) => setProduct({ ...product, weight: e.target.value ? parseFloat(e.target.value) : null })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensions (LxWxH)</Label>
              <Input
                id="dimensions"
                value={product.dimensions || ''}
                onChange={(e) => setProduct({ ...product, dimensions: e.target.value })}
                placeholder="e.g., 10x5x2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Current Images</Label>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image) => (
                <div key={image.id} className="relative aspect-square">
                  <Image
                    src={image.image_url}
                    alt={image.alt_text || product.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Add New Images</Label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={url}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/products')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 