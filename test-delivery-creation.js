const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDeliveryCreation() {
  try {
    console.log('Testing delivery creation...');

    // Get an existing buyer and their address
    const buyer = await prisma.user.findFirst({
      where: { role: 'BUYER' },
      include: {
        buyerProfile: {
          include: {
            addresses: true
          }
        }
      }
    });

    if (!buyer || !buyer.buyerProfile || buyer.buyerProfile.addresses.length === 0) {
      console.log('No buyer with addresses found. Need to create test data first.');
      return;
    }

    console.log('Found buyer:', buyer.email);

    // Get an active product
    const product = await prisma.product.findFirst({
      where: { isActive: true, stock: { gt: 0 } },
      include: {
        seller: true
      }
    });

    if (!product) {
      console.log('No active products found. Need to create test products first.');
      return;
    }

    console.log('Found product:', product.name);

    // Create a test order manually to see if delivery is created
    const orderNumber = `TEST-${Date.now()}`;
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          buyerId: buyer.id,
          status: 'PENDING',
          subtotal: product.price,
          taxAmount: product.price * 0.08,
          shippingCost: 9.99,
          totalAmount: product.price * 1.08 + 9.99,
          paymentMethod: 'CREDIT_CARD',
          paymentStatus: 'PENDING',
          shippingAddressId: buyer.buyerProfile.addresses[0].id,
          billingAddressId: buyer.buyerProfile.addresses[0].id,
          orderItems: {
            create: [{
              productId: product.id,
              quantity: 1,
              priceAtTime: product.price,
              totalPrice: product.price,
              sellerId: product.seller.userId
            }]
          }
        }
      });

      // Create delivery record for the order
      await tx.delivery.create({
        data: {
          orderId: newOrder.id,
          status: 'PENDING'
        }
      });

      return newOrder;
    });

    console.log('Created order:', order.orderNumber);

    // Check if delivery was created
    const delivery = await prisma.delivery.findUnique({
      where: { orderId: order.id },
      include: {
        order: {
          include: {
            orderItems: {
              include: {
                product: true
              }
            },
            shippingAddress: true
          }
        }
      }
    });

    if (delivery) {
      console.log('✅ Delivery created successfully!');
      console.log('Delivery ID:', delivery.id);
      console.log('Status:', delivery.status);
      console.log('Order total:', delivery.order.totalAmount);
    } else {
      console.log('❌ Delivery was not created');
    }

    // Clean up the test order and delivery
    await prisma.delivery.delete({
      where: { orderId: order.id }
    });
    await prisma.orderItem.deleteMany({
      where: { orderId: order.id }
    });
    await prisma.order.delete({
      where: { id: order.id }
    });

    console.log('Test data cleaned up');

  } catch (error) {
    console.error('Error in test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDeliveryCreation();
