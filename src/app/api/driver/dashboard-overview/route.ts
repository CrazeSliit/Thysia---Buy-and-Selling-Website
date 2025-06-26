import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'DRIVER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get driver profile
    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        deliveries: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            order: {
              select: {
                id: true,
                totalAmount: true,
                orderNumber: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            deliveries: true
          }
        }
      }
    })

    if (!driverProfile) {
      return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 })
    }

    // Calculate stats
    const deliveryStats = await prisma.delivery.groupBy({
      by: ['status'],
      where: { driverId: driverProfile.id },
      _count: {
        id: true
      }
    })

    const completedDeliveries = deliveryStats.find(stat => stat.status === 'DELIVERED')?._count.id || 0
    const pendingDeliveries = deliveryStats.find(stat => stat.status === 'PENDING')?._count.id || 0
    const inProgressDeliveries = deliveryStats.find(stat => stat.status === 'OUT_FOR_DELIVERY')?._count.id || 0

    // Mock earnings calculation (you'll want to implement this properly)
    const todaysEarnings = 125.50 // This should be calculated from actual delivery data
    const weeklyEarnings = 850.75 // This should be calculated from actual delivery data

    return NextResponse.json({
      driver: {
        ...driverProfile,
        createdAt: driverProfile.createdAt.toISOString(),
        updatedAt: driverProfile.updatedAt.toISOString(),
        user: {
          ...driverProfile.user,
          createdAt: driverProfile.user.createdAt.toISOString(),
        }
      },
      stats: {
        totalDeliveries: driverProfile._count.deliveries,
        completedDeliveries,
        pendingDeliveries,
        inProgressDeliveries,
        todaysEarnings,
        weeklyEarnings
      },
      recentDeliveries: driverProfile.deliveries.map(delivery => ({
        id: delivery.id,
        status: delivery.status,
        createdAt: delivery.createdAt.toISOString(),
        order: {
          id: delivery.order.id,
          orderNumber: delivery.order.orderNumber,
          totalAmount: delivery.order.totalAmount
        }
      }))
    })

  } catch (error) {
    console.error('Error fetching driver dashboard overview:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
