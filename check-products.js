const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        seller: {
          include: {
            user: true
          }
        }
      }
    })

    console.log('Products and their sellers:')
    products.forEach(product => {
      console.log(`Product: ${product.name}`)
      console.log(`  sellerId (SellerProfile): ${product.sellerId}`)
      console.log(`  seller.userId (User): ${product.seller.userId}`)
      console.log(`  seller.user.id: ${product.seller.user.id}`)
      console.log('---')
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProducts()
