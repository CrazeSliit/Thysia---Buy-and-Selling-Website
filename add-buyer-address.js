// Add buyer addresses for testing
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Get the buyer profile
  const buyerUser = await prisma.user.findUnique({
    where: { email: 'buyer@example.com' },
    include: { buyerProfile: true }
  })

  if (buyerUser && buyerUser.buyerProfile) {
    // Check if address already exists
    const existingAddress = await prisma.address.findFirst({
      where: { buyerId: buyerUser.buyerProfile.id }
    })

    if (!existingAddress) {
      // Create a default address
      await prisma.address.create({
        data: {
          buyerId: buyerUser.buyerProfile.id,
          type: 'HOME',
          firstName: 'John',
          lastName: 'Buyer',
          address1: '123 Main Street',
          address2: 'Apt 4B',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'US',
          phone: '555-0123',
          isDefault: true
        }
      })

      console.log('Added default address for buyer')
    } else {
      console.log('Buyer already has an address')
    }
  } else {
    console.log('Buyer not found')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
