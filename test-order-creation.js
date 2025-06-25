const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testOrderCreation() {
  try {
    console.log('🧪 Testing Order Creation with known good data...')
    
    // Get real data from database
    const buyer = await prisma.user.findFirst({ where: { role: 'BUYER' } })
    const buyerProfile = await prisma.buyerProfile.findFirst({ where: { userId: buyer.id } })
    const address = await prisma.address.findFirst({ where: { buyerId: buyerProfile.id } })
    const product = await prisma.product.findFirst({ 
      where: { isActive: true },
      include: { seller: true }
    })
    
    console.log('📋 Test data:')
    console.log('Buyer ID:', buyer.id)
    console.log('Address ID:', address.id)
    console.log('Product ID:', product.id)
    console.log('Seller User ID:', product.seller.userId)
    
    // Try to create a minimal order
    const orderData = {
      orderNumber: `TEST-${Date.now()}`,
      buyerId: buyer.id,
      status: 'PENDING',
      subtotal: 299.99,
      taxAmount: 24.00,
      shippingCost: 9.99,
      totalAmount: 333.98,
      paymentMethod: 'CREDIT_CARD',
      paymentStatus: 'PENDING',
      shippingAddressId: address.id,
      billingAddressId: address.id
    }
    
    console.log('\n🎯 Attempting to create order...')
    const order = await prisma.order.create({
      data: orderData
    })
    
    console.log('✅ Order created successfully:', order.id)
    
    // Now try to create an order item
    const orderItemData = {
      orderId: order.id,
      productId: product.id,
      sellerId: product.seller.userId, // Use User ID
      quantity: 1,
      priceAtTime: product.price,
      totalPrice: product.price
    }
    
    console.log('\n🎯 Attempting to create order item...')
    const orderItem = await prisma.orderItem.create({
      data: orderItemData
    })
    
    console.log('✅ Order item created successfully:', orderItem.id)
    
    // Clean up
    await prisma.orderItem.delete({ where: { id: orderItem.id } })
    await prisma.order.delete({ where: { id: order.id } })
    console.log('🧹 Cleaned up test data')
    
  } catch (error) {
    console.error('💥 Error during test:', error)
    console.error('Error message:', error.message)
    if (error.meta) {
      console.error('Error meta:', error.meta)
    }
  } finally {
    await prisma.$disconnect()
  }
}

testOrderCreation()
