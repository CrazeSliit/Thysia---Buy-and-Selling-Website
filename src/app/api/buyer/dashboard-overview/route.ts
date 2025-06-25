import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const userId = session.user.id

    // Fetch buyer overview data in parallel for better performance
    const [
      user,
      recentOrders,
      wishlistCount,
      cartItemsCount,
      totalSpent,
      recommendations
    ] = await Promise.all([
      // User details
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        }
      }),

      // Recent orders (last 5)
      prisma.order.findMany({
        where: { buyerId: userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  price: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),      // Wishlist items count
      prisma.wishlistItem.count({
        where: { buyerId: userId }
      }),

      // Cart items count
      prisma.cartItem.count({
        where: { buyerId: userId }
      }),

      // Total amount spent (from delivered orders)
      prisma.order.aggregate({
        where: {
          buyerId: userId,
          status: 'DELIVERED'
        },
        _sum: {
          total: true
        }
      }),

      // Get personalized recommendations
      getPersonalizedRecommendations(userId)
    ])

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate additional stats
    const totalOrders = await prisma.order.count({
      where: { buyerId: userId }
    })

    const pendingOrders = await prisma.order.count({
      where: {
        buyerId: userId,
        status: { in: ['PENDING', 'PROCESSING', 'SHIPPED'] }
      }
    })

    // Recent activity (orders from last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentActivity = await prisma.order.count({
      where: {
        buyerId: userId,
        createdAt: { gte: thirtyDaysAgo }
      }
    })

    return NextResponse.json({
      user: {
        ...user,
        memberSince: user.createdAt
      },
      stats: {
        totalOrders,
        pendingOrders,
        wishlistItems: wishlistCount,
        cartItems: cartItemsCount,
        totalSpent: totalSpent._sum.total || 0,
        recentActivity
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        itemCount: order.items.length,
        firstItem: order.items[0] ? {
          productName: order.items[0].product.name,
          productImage: order.items[0].product.imageUrl,
          price: order.items[0].price
        } : null
      })),
      recommendations
    })

  } catch (error) {
    console.error('Error fetching buyer dashboard overview:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Hyper-Personalized Product Recommendations
async function getPersonalizedRecommendations(userId: string) {
  try {
    // Get user's purchase history to understand preferences
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
      take: 10 // Recent orders for analysis
    })

    // Extract categories and products from user's purchase history
    const purchasedCategories = new Set<string>()
    const purchasedProducts = new Set<string>()

    userOrders.forEach(order => {
      order.items.forEach(item => {
        purchasedCategories.add(item.product.categoryId)
        purchasedProducts.add(item.product.id)
      })
    })

    let recommendations: any[] = []

    if (purchasedCategories.size > 0) {
      // Get products from categories user has bought from, excluding already purchased
      recommendations = await prisma.product.findMany({
        where: {
          AND: [
            { isActive: true },
            { categoryId: { in: Array.from(purchasedCategories) } },
            { id: { notIn: Array.from(purchasedProducts) } }
          ]
        },
        include: {
          category: true,
          reviews: {
            select: { rating: true }
          },
          seller: {
            select: { businessName: true, isVerified: true }
          }
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' }
        ],
        take: 6
      })
    }

    // If no category-based recommendations or not enough, get featured/popular products
    if (recommendations.length < 3) {
      const additionalRecommendations = await prisma.product.findMany({
        where: {
          AND: [
            { isActive: true },
            { id: { notIn: Array.from(purchasedProducts) } },
            { OR: [{ isFeatured: true }, { stock: { gt: 0 } }] }
          ]
        },
        include: {
          category: true,
          reviews: {
            select: { rating: true }
          },
          seller: {
            select: { businessName: true, isVerified: true }
          }
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' }
        ],
        take: 6 - recommendations.length
      })

      recommendations = [...recommendations, ...additionalRecommendations]
    }

    // Calculate average ratings and format response
    return recommendations.map((product: any) => {
      const avgRating = product.reviews.length > 0 
        ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length
        : 0

      return {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category.name,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
        seller: product.seller.businessName,
        isVerifiedSeller: product.seller.isVerified,
        isFeatured: product.isFeatured
      }
    }).slice(0, 6) // Limit to 6 recommendations

  } catch (error) {
    console.error('Error getting personalized recommendations:', error)
    return []
  }
}
