// Quick script to update order statuses for testing
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Get all orders
  const orders = await prisma.order.findMany()
  
  console.log(`Found ${orders.length} orders`)
  
  // Update orders with different statuses
  const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
  
  for (let i = 0; i < orders.length; i++) {
    const statusIndex = i % statuses.length
    const newStatus = statuses[statusIndex]
    
    await prisma.order.update({
      where: { id: orders[i].id },
      data: { status: newStatus }
    })
    
    console.log(`Updated order ${orders[i].id} to status: ${newStatus}`)
  }
  
  console.log('All orders updated!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
