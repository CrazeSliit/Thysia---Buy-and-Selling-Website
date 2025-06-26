const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createDeliveries() {
  try {
    // Find orders that don't have deliveries yet
    const ordersWithoutDeliveries = await prisma.order.findMany({
      where: {
        delivery: null, // Orders without deliveries
        status: {
          in: ['CONFIRMED', 'PROCESSING', 'PENDING'] // Orders that need delivery
        }
      },
      include: {
        delivery: true
      }
    })

    console.log(`Found ${ordersWithoutDeliveries.length} orders without deliveries`)

    // Create delivery records for these orders
    for (const order of ordersWithoutDeliveries) {
      const delivery = await prisma.delivery.create({
        data: {
          orderId: order.id,
          status: 'PENDING', // Available for drivers to pick up
          driverId: null // Unassigned
        }
      })
      console.log(`Created delivery ${delivery.id} for order ${order.orderNumber}`)
    }

    // Also create some test orders with deliveries
    const buyerProfile = await prisma.buyerProfile.findFirst({
      include: { user: true, addresses: true }
    })

    if (buyerProfile && buyerProfile.addresses.length > 0) {
      const products = await prisma.product.findMany({ take: 2 })
      
      if (products.length > 0) {
        // Create a new order
        const newOrder = await prisma.order.create({
          data: {
            orderNumber: `ORD-${Date.now()}-DEL`,
            buyerId: buyerProfile.userId,
            status: 'CONFIRMED',
            subtotal: 50.00,
            taxAmount: 4.00,
            shippingCost: 9.99,
            totalAmount: 63.99,
            paymentMethod: 'CREDIT_CARD',
            paymentStatus: 'PAID',
            shippingAddressId: buyerProfile.addresses[0].id,
            billingAddressId: buyerProfile.addresses[0].id,
            orderItems: {
              create: {
                productId: products[0].id,
                quantity: 1,
                priceAtTime: 50.00,
                totalPrice: 50.00,
                sellerId: buyerProfile.userId // Using buyer as seller for test
              }
            }
          }
        })

        // Create delivery for this order
        await prisma.delivery.create({
          data: {
            orderId: newOrder.id,
            status: 'PENDING',
            driverId: null
          }
        })

        console.log(`Created test order ${newOrder.orderNumber} with delivery`)
      }
    }

    console.log('Delivery creation completed!')

  } catch (error) {
    console.error('Error creating deliveries:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDeliveries()
