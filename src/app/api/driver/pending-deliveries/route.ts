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

    // Get the driver profile first
    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!driverProfile) {
      return NextResponse.json([], { status: 200 })
    }

    // Get pending delivery requests (unassigned or assigned to this driver but not started)
    const deliveries = await prisma.delivery.findMany({
      where: {
        OR: [
          {
            driverId: null, // Unassigned
            status: 'PENDING'
          },
          {
            driverId: driverProfile.id,
            status: 'PENDING'
          }
        ]
      },
      include: {
        order: {
          include: {
            buyer: {
              select: {
                name: true
              }
            },
            orderItems: {
              include: {
                product: {
                  select: {
                    name: true,
                    seller: {
                      select: {
                        businessName: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      take: 5
    })

    return NextResponse.json(deliveries.map(delivery => ({
      ...delivery,
      createdAt: delivery.createdAt.toISOString(),
      updatedAt: delivery.updatedAt.toISOString(),
      order: {
        ...delivery.order,
        createdAt: delivery.order.createdAt.toISOString(),
        updatedAt: delivery.order.updatedAt.toISOString(),
      }
    })))
  } catch (error) {
    console.error('Error fetching pending deliveries:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
