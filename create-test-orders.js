// Add more test orders for comprehensive testing
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Get buyer and seller
  const buyerUser = await prisma.user.findUnique({
    where: { email: 'buyer@example.com' }
  })

  const sellerProfile = await prisma.sellerProfile.findFirst({
    where: { user: { email: 'seller@example.com' } }
  })

  const products = await prisma.product.findMany({
    where: { sellerId: sellerProfile.id },
    take: 3
  })

  if (buyerUser && sellerProfile && products.length > 0) {
    // Create a few more orders with different statuses and products
    const newOrders = [
      {
        status: 'PENDING',
        products: [{ product: products[0], quantity: 1 }],
        description: 'New pending order'
      },
      {
        status: 'PROCESSING',
        products: [{ product: products[1], quantity: 3 }, { product: products[2], quantity: 1 }],
        description: 'Mixed product order'
      },
      {
        status: 'SHIPPED',
        products: [{ product: products[2], quantity: 2 }],
        description: 'Shipped order'
      }
    ]

    for (const orderData of newOrders) {
      const total = orderData.products.reduce((sum, item) => 
        sum + (item.product.price * item.quantity), 0
      )

      const order = await prisma.order.create({
        data: {
          buyerId: buyerUser.id,
          status: orderData.status,
          total: total,
          items: {
            create: orderData.products.map(item => ({
              productId: item.product.id,
              quantity: item.quantity,
              price: item.product.price
            }))
          }
        }
      })

      console.log(`Created ${orderData.status} order: ${order.id} - $${total.toFixed(2)}`)
    }

    console.log('All test orders created successfully!')
  } else {
    console.log('Missing required data for order creation')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
