const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testOrderAPI() {
  try {
    console.log('Testing Order API requirements...')
    
    // Check if we have a buyer user
    const buyers = await prisma.user.findMany({
      where: { role: 'BUYER' },
      include: {
        buyerProfile: true
      }
    })
    console.log('Buyers found:', buyers.length)
    if (buyers.length > 0) {
      console.log('First buyer:', buyers[0])
    }
    
    // Check if we have addresses
    const addresses = await prisma.address.findMany()
    console.log('Addresses found:', addresses.length)
    if (addresses.length > 0) {
      console.log('First address:', addresses[0])
    }
    
    // Check if we have cart items
    const cartItems = await prisma.cartItem.findMany({
      include: {
        product: true
      }
    })
    console.log('Cart items found:', cartItems.length)
    if (cartItems.length > 0) {
      console.log('First cart item:', cartItems[0])
    }
    
    // Check products
    const products = await prisma.product.findMany({
      where: { isActive: true }
    })
    console.log('Active products found:', products.length)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testOrderAPI()
