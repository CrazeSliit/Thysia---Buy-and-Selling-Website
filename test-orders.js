// Quick test to check orders in database
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Get all orders with items and products
  const orders = await prisma.order.findMany({
    include: {
      buyer: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              imageUrl: true,
              seller: {
                select: {
                  id: true,
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
      }
    }
  })

  console.log('All orders:', JSON.stringify(orders, null, 2))

  // Get all products
  const products = await prisma.product.findMany({
    include: {
      seller: {
        include: {
          user: true
        }
      }
    }
  })

  console.log('\nAll products:', JSON.stringify(products, null, 2))

  // Get seller profiles
  const sellers = await prisma.sellerProfile.findMany({
    include: {
      user: true
    }
  })

  console.log('\nAll sellers:', JSON.stringify(sellers, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
