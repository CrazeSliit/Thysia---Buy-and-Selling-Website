const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDataState() {
  try {
    const orderCount = await prisma.order.count();
    const deliveryCount = await prisma.delivery.count();
    
    console.log(`Orders: ${orderCount}`);
    console.log(`Deliveries: ${deliveryCount}`);
    
    if (orderCount > deliveryCount) {
      console.log(`\n⚠️  Missing ${orderCount - deliveryCount} delivery records for existing orders!`);
      
      // Get orders without deliveries
      const ordersWithoutDeliveries = await prisma.order.findMany({
        where: {
          delivery: null
        },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          createdAt: true
        }
      });
      
      console.log('\nOrders without deliveries:');
      ordersWithoutDeliveries.forEach(order => {
        console.log(`- ${order.orderNumber} (${order.status}) - $${order.totalAmount} - ${order.createdAt.toISOString().split('T')[0]}`);
      });
    } else {
      console.log('\n✅ All orders have corresponding delivery records');
    }
    
  } catch (error) {
    console.error('Error checking data state:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDataState();
