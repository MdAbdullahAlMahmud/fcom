import ProductCard from '@/components/frontend/products/ProductCard'

interface Product {
  id: number
  name: string
  slug: string
  price: number | string
  sale_price: number | string | null
  image_url: string
}

export default function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
} 