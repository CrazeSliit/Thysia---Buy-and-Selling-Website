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
      select: { id: true }
    })

    if (!driverProfile) {
      return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 })
    }

    // Get pending deliveries (deliveries not assigned to any driver or assigned to this driver)
    const pendingDeliveries = await prisma.delivery.findMany({
      where: {
        OR: [
          { driverId: null, status: 'PENDING' },
          { driverId: driverProfile.id, status: 'PENDING' }
        ]
      },
      include: {
        order: {
          include: {
            buyer: {
              select: {
                id: true,
                name: true
              }
            },
            shippingAddress: true,
            orderItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    imageUrl: true
                  }
                }
              },
              take: 3 // Limit to first 3 items for display
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20 // Limit to 20 pending deliveries
    })

    return NextResponse.json({
      deliveries: pendingDeliveries.map(delivery => ({
        id: delivery.id,
        status: delivery.status,
        createdAt: delivery.createdAt.toISOString(),
        updatedAt: delivery.updatedAt.toISOString(),
        order: {
          id: delivery.order.id,
          orderNumber: delivery.order.orderNumber,
          totalAmount: delivery.order.totalAmount,
          buyer: delivery.order.buyer,
          shippingAddress: delivery.order.shippingAddress,
          items: delivery.order.orderItems.map(item => ({
            id: item.id,
            quantity: item.quantity,
            priceAtTime: item.priceAtTime,
            product: item.product
          })),
          itemCount: delivery.order.orderItems.length
        }
      }))
    })

  } catch (error) {
    console.error('Error fetching pending deliveries:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
