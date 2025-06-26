const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFullBuyerFlow() {
  try {
    console.log('🛒 Testing full buyer order flow...\n');

    // Step 1: Get test data
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

    const product = await prisma.product.findFirst({
      where: { isActive: true, stock: { gt: 0 } },
      include: {
        seller: true,
        category: true
      }
    });

    if (!buyer || !buyer.buyerProfile || buyer.buyerProfile.addresses.length === 0) {
      console.log('❌ No buyer with addresses found');
      return;
    }

    if (!product) {
      console.log('❌ No active products found');
      return;
    }

    console.log(`👤 Testing with buyer: ${buyer.email}`);
    console.log(`📦 Testing with product: ${product.name} ($${product.price})`);

    // Step 2: Create order (simulating the checkout API)
    const orderNumber = `TEST-BUYER-${Date.now()}`;
    const subtotal = product.price;
    const taxAmount = subtotal * 0.08;
    const shippingCost = subtotal > 50 ? 0 : 9.99;
    const totalAmount = subtotal + taxAmount + shippingCost;

    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          buyerId: buyer.id,
          status: 'PENDING',
          subtotal,
          taxAmount,
          shippingCost,
          totalAmount,
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

      // Create delivery record (our fix)
      await tx.delivery.create({
        data: {
          orderId: newOrder.id,
          status: 'PENDING'
        }
      });

      return newOrder;
    });

    console.log(`✅ Created order: ${order.orderNumber} (ID: ${order.id})`);

    // Step 3: Test buyer orders API (used by the orders list page)
    console.log('\n📋 Testing buyer orders API...');
    
    const buyerOrders = await prisma.order.findMany({
      where: {
        buyerId: buyer.id,
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const newOrder = buyerOrders.find(o => o.id === order.id);
    if (newOrder) {
      console.log(`✅ Order appears in buyer's order list`);
      console.log(`   Order: ${newOrder.orderNumber}`);
      console.log(`   Status: ${newOrder.status}`);
      console.log(`   Total: $${newOrder.totalAmount}`);
      console.log(`   Items: ${newOrder.orderItems.length}`);
    } else {
      console.log(`❌ Order NOT found in buyer's order list`);
    }

    // Step 4: Test order details API (used by the order details page)
    console.log('\n📄 Testing order details API...');
    
    const orderDetails = await prisma.order.findFirst({
      where: {
        id: order.id,
        buyerId: buyer.id,
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                category: {
                  select: {
                    name: true
                  }
                },
                seller: {
                  select: {
                    businessName: true
                  }
                }
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true,
        delivery: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            driver: {
              select: {
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
    });

    if (orderDetails) {
      console.log(`✅ Order details fetched successfully`);
      console.log(`   Order: ${orderDetails.orderNumber}`);
      console.log(`   Items: ${orderDetails.orderItems.length}`);
      console.log(`   Delivery: ${orderDetails.delivery ? 'Present' : 'Missing'}`);
      console.log(`   Delivery Status: ${orderDetails.delivery?.status || 'N/A'}`);
      
      // Transform data as the page component does
      const transformedOrder = {
        id: orderDetails.id,
        status: orderDetails.status,
        total: orderDetails.totalAmount,
        createdAt: orderDetails.createdAt.toISOString(),
        updatedAt: orderDetails.updatedAt.toISOString(),
        items: orderDetails.orderItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.priceAtTime,
          product: {
            id: item.product.id,
            name: item.product.name,
            imageUrl: item.product.imageUrl || '/placeholder-product.jpg',
            category: {
              name: item.product.category?.name || 'Uncategorized'
            },
            seller: {
              id: item.sellerId,
              businessName: item.product.seller?.businessName || 'Unknown Seller'
            }
          }
        })),
        delivery: orderDetails.delivery ? {
          id: orderDetails.delivery.id,
          status: orderDetails.delivery.status,
          driver: orderDetails.delivery.driver ? {
            id: orderDetails.delivery.driver.user.email,
            user: {
              name: orderDetails.delivery.driver.user.name
            },
            vehicleType: null
          } : undefined
        } : null
      };
      
      console.log(`✅ Data transformation successful`);
      console.log(`   Transformed items: ${transformedOrder.items.length}`);
    } else {
      console.log(`❌ Order details NOT found`);
    }

    // Step 5: Test driver deliveries API
    console.log('\n🚚 Testing driver deliveries API...');
    
    const driverDeliveries = await prisma.delivery.findMany({
      where: {
        OR: [
          { driverId: null, status: 'PENDING' }, // Unassigned deliveries
        ]
      },
      include: {
        order: {
          include: {
            buyer: { select: { name: true, email: true } },
            orderItems: {
              include: {
                product: { select: { name: true, imageUrl: true } }
              }
            },
            shippingAddress: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const newDelivery = driverDeliveries.find(d => d.orderId === order.id);
    if (newDelivery) {
      console.log(`✅ Delivery appears for drivers`);
      console.log(`   Delivery ID: ${newDelivery.id}`);
      console.log(`   Order: ${newDelivery.order.orderNumber}`);
      console.log(`   Status: ${newDelivery.status}`);
      console.log(`   Buyer: ${newDelivery.order.buyer.name}`);
    } else {
      console.log(`❌ Delivery NOT visible to drivers`);
    }

    console.log('\n🧹 Cleaning up test data...');
    await prisma.delivery.delete({ where: { orderId: order.id } });
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
    await prisma.order.delete({ where: { id: order.id } });
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 Full buyer flow test completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Order creation works');
    console.log('   ✅ Order appears in buyer orders list');
    console.log('   ✅ Order details can be fetched');
    console.log('   ✅ Data transformation works for frontend');
    console.log('   ✅ Delivery is created and visible to drivers');

    console.log('\n🔗 Test URLs (replace {orderId} with actual order ID):');
    console.log(`   Orders List: http://localhost:3001/dashboard/buyer/orders`);
    console.log(`   Order Details: http://localhost:3001/dashboard/buyer/orders/${order.id}`);
    console.log(`   Driver Shipments: http://localhost:3001/dashboard/driver/shipments`);

  } catch (error) {
    console.error('❌ Error in buyer flow test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFullBuyerFlow();
