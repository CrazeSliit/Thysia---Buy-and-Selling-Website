const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testCheckout() {
  try {
    // Find the buyer and their cart
    const buyerProfile = await prisma.buyerProfile.findFirst({
      include: { 
        user: true,
        cartItems: {
          include: { product: true }
        },
        addresses: true
      }
    })

    if (!buyerProfile) {
      console.log('No buyer profile found')
      return
    }

    console.log('Buyer:', buyerProfile.user.email)
    console.log('Cart items:', buyerProfile.cartItems.length)
    console.log('Addresses:', buyerProfile.addresses.length)

    if (buyerProfile.cartItems.length === 0) {
      console.log('No cart items')
      return
    }

    if (buyerProfile.addresses.length === 0) {
      console.log('No addresses found')
      return
    }

    const address = buyerProfile.addresses[0]
    const cartItems = buyerProfile.cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price
    }))

    // Simulate checkout request
    const checkoutData = {
      cartItems,
      shippingAddressId: address.id,
      billingAddressId: address.id,
      paymentMethod: 'CREDIT_CARD'
    }

    console.log('Checkout data:', JSON.stringify(checkoutData, null, 2))

    // Try to create the order manually to test the logic
    let subtotal = 0
    const orderItemsData = cartItems.map(cartItem => {
      const product = buyerProfile.cartItems.find(ci => ci.productId === cartItem.productId).product
      const itemTotal = product.price * cartItem.quantity
      subtotal += itemTotal
      
      return {
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        priceAtTime: product.price,
        totalPrice: itemTotal,
        sellerId: product.sellerId
      }
    })

    const taxRate = 0.08
    const shippingCost = subtotal > 50 ? 0 : 9.99
    const taxAmount = subtotal * taxRate
    const totalAmount = subtotal + taxAmount + shippingCost
    const orderNumber = `ORD-${Date.now()}-TEST`

    console.log('Order calculation:')
    console.log('Subtotal:', subtotal)
    console.log('Tax:', taxAmount)
    console.log('Shipping:', shippingCost)
    console.log('Total:', totalAmount)

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        buyerId: buyerProfile.userId,
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
          create: orderItemsData
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

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { buyerId: buyerProfile.id }
    })

    console.log('Cart cleared')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCheckout()
