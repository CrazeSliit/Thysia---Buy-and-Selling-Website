import { redirect } from 'next/navigation'
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

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'BUYER') {
    redirect('/unauthorized')
  }

  // Fetch the order details
  const order = await prisma.order.findFirst({
    where: {
      id: params.id,
      buyerId: session.user.id, // Ensure buyer can only view their own orders
    },
    include: {
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              category: {
                select: {
                  name: true
                }
              },
              seller: {
                select: {
                  businessName: true
                }
              }
            }
          }
        }
      },
      shippingAddress: true,
      billingAddress: true,
      delivery: {
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          driver: {
            select: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  })

  if (!order) {
    redirect('/dashboard/buyer/orders')
  }

  return (
    <DashboardLayout userRole="BUYER">
      <div className="space-y-6">
        <div className="border-b border-secondary-200 pb-4">
          <h1 className="text-2xl font-bold text-secondary-900">
            Order Details
          </h1>
          <p className="mt-1 text-sm text-secondary-600">
            Order #{order.orderNumber}
          </p>
        </div>
        
        <OrderDetails order={{
          id: order.id,
          status: order.status,
          total: order.totalAmount,
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
          items: order.orderItems.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.priceAtTime,
            product: {
              id: item.product.id,
              name: item.product.name,
              imageUrl: item.product.imageUrl || '/placeholder-product.jpg',
              category: {
                name: item.product.category?.name || 'Uncategorized'
              },
              seller: {
                id: item.sellerId,
                businessName: item.product.seller?.businessName || 'Unknown Seller'
              }
            }
          })),
          delivery: order.delivery ? {
            id: order.delivery.id,
            status: order.delivery.status,
            driver: order.delivery.driver ? {
              id: order.delivery.driver.user.email, // Using email as ID since we don't have driver profile ID
              user: {
                name: order.delivery.driver.user.name
              },
              vehicleType: null // We don't have vehicle type in our schema yet
            } : undefined
          } : null
        }} />
      </div>
    </DashboardLayout>
  )
}
