const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testOrderCreation() {
  try {
    // Find the buyer and seller
    const buyerProfile = await prisma.buyerProfile.findFirst({
      include: { 
        user: true,
        addresses: true
      }
    })

    const product = await prisma.product.findFirst({
      include: {
        seller: {
          include: {
            user: true
          }
        }
      }
    })

    if (!buyerProfile || !product) {
      console.log('Missing buyer or product data')
      return
    }

    console.log('Buyer:', buyerProfile.user.email)
    console.log('Product:', product.name)
    console.log('Seller User ID:', product.seller.userId)
    console.log('Address available:', buyerProfile.addresses.length > 0)

    if (buyerProfile.addresses.length === 0) {
      console.log('No addresses available for buyer')
      return
    }

    const address = buyerProfile.addresses[0]

    // Create order data
    const subtotal = product.price * 1
    const taxAmount = subtotal * 0.08
    const shippingCost = 9.99
    const totalAmount = subtotal + taxAmount + shippingCost
    const orderNumber = `ORD-${Date.now()}-TEST2`

    console.log('Creating order...')

    const order = await prisma.order.create({
      data: {
        orderNumber,
        buyerId: buyerProfile.userId, // Use User ID for Order relation
        status: 'PENDING',
        subtotal,
        taxAmount,
        shippingCost,
        totalAmount,
        paymentMethod: 'CREDIT_CARD',
        paymentStatus: 'PENDING',
        shippingAddressId: address.id,
        billingAddressId: address.id,
        orderItems: {
          create: {
            productId: product.id,
            quantity: 1,
            priceAtTime: product.price,
            totalPrice: product.price,
            sellerId: product.seller.userId // Use seller's User ID
          }
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    console.log('Order created successfully!')
    console.log('Order ID:', order.id)
    console.log('Order Number:', order.orderNumber)
    console.log('Total Amount:', order.totalAmount)

  } catch (error) {
    console.error('Error creating order:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testOrderCreation()
