const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addTestCartItems() {
  try {
    // Find the buyer profile
    const buyerProfile = await prisma.buyerProfile.findFirst({
      include: { user: true }
    })

    if (!buyerProfile) {
      console.log('No buyer profile found')
      return
    }

    console.log('Buyer profile found:', buyerProfile.user.email)

    // Find some products
    const products = await prisma.product.findMany({
      take: 2
    })

    if (products.length === 0) {
      console.log('No products found')
      return
    }

    console.log('Found products:', products.map(p => p.name))

    // Clear existing cart items
    await prisma.cartItem.deleteMany({
      where: { buyerId: buyerProfile.id }
    })

    // Add products to cart
    for (const product of products) {
      await prisma.cartItem.create({
        data: {
          buyerId: buyerProfile.id,
          productId: product.id,
          quantity: 2
        }
      })
      console.log(`Added ${product.name} to cart`)
    }

    console.log('Cart items added successfully!')

    // Check cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { buyerId: buyerProfile.id },
      include: { product: true }
    })

    console.log('Current cart items:')
    cartItems.forEach(item => {
      console.log(`- ${item.product.name} x ${item.quantity} = $${(item.product.price * item.quantity).toFixed(2)}`)
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTestCartItems()
