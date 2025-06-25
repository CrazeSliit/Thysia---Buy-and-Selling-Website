const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testTransactionOrderCreation() {
  try {
    console.log('🧪 Testing Order Creation with Transaction (API style)...')
    
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
    
    // Prepare order items data (same as API)
    const orderItemsData = [{
      productId: product.id,
      quantity: 1,
      priceAtTime: product.price,
      totalPrice: product.price,
      sellerId: product.seller.userId
    }]
    
    // Order data (same as API)
    const orderData = {
      orderNumber: `TEST-TX-${Date.now()}`,
      buyerId: buyer.id,
      status: 'PENDING',
      subtotal: 299.99,
      taxAmount: 24.00,
      shippingCost: 9.99,
      totalAmount: 333.98,
      paymentMethod: 'CREDIT_CARD',
      paymentStatus: 'PENDING',
      shippingAddressId: address.id,
      billingAddressId: address.id,
      orderItems: {
        create: orderItemsData
      }
    }
    
    console.log('📝 Order data:', JSON.stringify(orderData, null, 2))
    
    // Try transaction like in the API
    console.log('\n🎯 Attempting transaction order creation...')
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: orderData,
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true
                }
              }
            }
          },
          shippingAddress: true
        }
      })
      
      // Update product stock
      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: {
            decrement: 1
          }
        }
      })
      
      return newOrder
    })
    
    console.log('✅ Transaction order created successfully:', order.id)
    console.log('Order items count:', order.orderItems.length)
    
    // Clean up
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } })
    await prisma.order.delete({ where: { id: order.id } })
    console.log('🧹 Cleaned up test data')
    
  } catch (error) {
    console.error('💥 Error during transaction test:', error)
    console.error('Error message:', error.message)
    if (error.meta) {
      console.error('Error meta:', error.meta)
    }
  } finally {
    await prisma.$disconnect()
  }
}

testTransactionOrderCreation()
