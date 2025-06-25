import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all active products (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isActive: true
    }

    if (category) {
      where.categoryId = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get products with pagination
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          },
          seller: {
            select: {
              id: true,
              businessName: true,
              isVerified: true,
              user: {
                select: {
                  name: true
                }
              }
            }
          },
          reviews: {
            select: {
              rating: true
            }
          },
          _count: {
            select: {
              reviews: true,
              orderItems: true,
              wishlistItems: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    // Calculate average ratings
    const productsWithRatings = products.map(product => {
      const avgRating = product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0

      return {
        ...product,
        averageRating: avgRating,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
        reviews: undefined // Remove reviews from response to reduce payload
      }
    })

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      products: productsWithRatings,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
