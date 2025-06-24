import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import OrderDetails from '@/components/dashboard/buyer/OrderDetails'

interface OrderDetailsPageProps {
  params: {
    id: string
  }
}

async function getOrder(orderId: string, userId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        buyerId: userId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,                seller: {
                  select: {
                    id: true,
                    businessName: true,
                  },
                },
              },
            },
          },
        },
        delivery: {
          include: {
            driver: {
              select: {
                id: true,                  user: {
                    select: {
                      name: true,
                    },
                  },
                vehicleType: true,
              },
            },
          },
        },
      },
    })

    return order
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'BUYER') {
    redirect('/unauthorized')
  }

  const order = await getOrder(params.id, session.user.id)

  if (!order) {
    notFound()
  }

  return (
    <DashboardLayout userRole="BUYER">
      <div className="space-y-6">
        <div className="border-b border-secondary-200 pb-4">
          <h1 className="text-2xl font-bold text-secondary-900">
            Order #{order.id.slice(-8)}
          </h1>
          <p className="mt-1 text-sm text-secondary-600">
            Order details and tracking information
          </p>
        </div>
          <OrderDetails order={{
          ...order,
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
          delivery: order.delivery ? {
            id: order.delivery.id,
            status: order.delivery.status,
            driver: order.delivery.driver ? {
              id: order.delivery.driver.id,
              user: order.delivery.driver.user,
              vehicleType: order.delivery.driver.vehicleType,
            } : undefined,
          } : undefined,
        }} />
      </div>
    </DashboardLayout>
  )
}
