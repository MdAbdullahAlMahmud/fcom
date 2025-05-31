'use client'

import { useState } from 'react'
import { Star, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface Review {
  id: number
  user: {
    name: string
    avatar: string
  }
  rating: number
  comment: string
  date: string
  images?: string[]
}

interface ReviewSectionProps {
  productId: number
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [images, setImages] = useState<File[]>([])

  // This would typically come from an API call
  const reviews: Review[] = [
    {
      id: 1,
      user: {
        name: 'John Doe',
        avatar: '/avatars/john.jpg',
      },
      rating: 5,
      comment: 'Great product! The quality is amazing and it looks even better in person.',
      date: '2024-03-15',
      images: ['/reviews/review1.jpg', '/reviews/review2.jpg'],
    },
    {
      id: 2,
      user: {
        name: 'Jane Smith',
        avatar: '/avatars/jane.jpg',
      },
      rating: 4,
      comment: 'Very satisfied with the purchase. The only reason for 4 stars is the shipping time.',
      date: '2024-03-10',
    },
  ]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle review submission
    console.log({ rating, comment, images })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= 4.5
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-lg font-medium">4.5 out of 5</span>
          <span className="text-gray-600">(120 reviews)</span>
        </div>
      </div>

      {/* Review Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Your Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium mb-2">
            Your Review
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Share your experience with this product..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Add Photos</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <ImageIcon className="w-5 h-5" />
              <span>Upload Images</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            {images.length > 0 && (
              <span className="text-sm text-gray-600">
                {images.length} image(s) selected
              </span>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Submit Review
        </button>
      </form>

      {/* Reviews List */}
      <div className="space-y-8">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-8">
            <div className="flex items-start gap-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={review.user.avatar}
                  alt={review.user.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{review.user.name}</h3>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-600">{review.date}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-gray-600">{review.comment}</p>
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mt-4">
                    {review.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative w-20 h-20 rounded-lg overflow-hidden"
                      >
                        <Image
                          src={image}
                          alt={`Review image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 