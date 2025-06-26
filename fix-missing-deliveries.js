const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createMissingDeliveries() {
  try {
    // Get orders without deliveries
    const ordersWithoutDeliveries = await prisma.order.findMany({
      where: {
        delivery: null
      },
      select: {
        id: true,
        orderNumber: true,
        status: true
      }
    });
    
    console.log(`Found ${ordersWithoutDeliveries.length} orders without deliveries`);
    
    for (const order of ordersWithoutDeliveries) {
      await prisma.delivery.create({
        data: {
          orderId: order.id,
          status: 'PENDING'
        }
      });
      console.log(`✅ Created delivery for order ${order.orderNumber}`);
    }
    
    console.log('\nAll missing delivery records have been created!');
    
  } catch (error) {
    console.error('Error creating missing deliveries:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMissingDeliveries();
