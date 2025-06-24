import { prisma } from '@/lib/prisma'
import { Star } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface PersonalizedRecommendationsProps {
  userId: string
}

async function getRecommendations(userId: string) {
  try {
    // Simple recommendation logic: get featured products or products from categories the user has bought from
    const userOrders = await prisma.order.findMany({
      where: { buyerId: userId },
      include: {
        items: {
          include: {
            product: {
              include: { category: true }
            }
          }
        }
      },
      take: 5
    })    // Extract categories from user's past orders
    const userCategories = userOrders.flatMap(order => 
      order.items.map(item => item.product.categoryId)
    )
    const uniqueCategories = Array.from(new Set(userCategories))

    // Get products from those categories or featured products
    const recommendations = await prisma.product.findMany({
      where: {
        AND: [
          { isActive: true },
          uniqueCategories.length > 0 
            ? { categoryId: { in: uniqueCategories } }
            : { isFeatured: true }
        ]
      },
      include: {
        category: true,
        reviews: {
          select: {
            rating: true
          }
        }
      },
      take: 3,
      orderBy: { createdAt: 'desc' }
    })

    return recommendations
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return []
  }
}

export default async function PersonalizedRecommendations({ userId }: PersonalizedRecommendationsProps) {
  const recommendations = await getRecommendations(userId)

  if (recommendations.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-secondary-500 mb-4">No recommendations available</p>
        <Link
          href="/products"
          className="text-primary-600 hover:text-primary-500 text-sm font-medium"
        >
          Browse all products
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="space-y-4">
        {recommendations.map((product) => {
          // Calculate average rating
          const avgRating = product.reviews.length > 0 
            ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
            : 0

          return (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-secondary-50 transition-colors"
            >
              {/* Product Image */}
              <div className="flex-shrink-0">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-secondary-200 rounded-lg flex items-center justify-center">
                    <span className="text-secondary-400 text-xs">No Image</span>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-secondary-900 truncate">
                  {product.name}
                </h3>
                <p className="text-xs text-secondary-500 mb-1">
                  {product.category.name}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-600">
                    ${product.price.toFixed(2)}
                  </span>
                  {avgRating > 0 && (
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-xs text-secondary-500">
                        {avgRating.toFixed(1)} ({product.reviews.length})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <Link
          href="/products"
          className="block w-full text-center py-2 px-4 border border-primary-300 rounded-md text-primary-600 hover:bg-primary-50 transition-colors text-sm font-medium"
        >
          See More Products
        </Link>
      </div>
    </div>
  )
}
