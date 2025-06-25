// Verify seller account script
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Find the seller user
  const sellerUser = await prisma.user.findUnique({
    where: { email: 'seller@example.com' },
    include: { sellerProfile: true }
  })

  if (sellerUser && sellerUser.sellerProfile) {
    console.log('Current seller verification status:', sellerUser.sellerProfile.isVerified)
    
    if (!sellerUser.sellerProfile.isVerified) {
      // Update seller to verified
      await prisma.sellerProfile.update({
        where: { id: sellerUser.sellerProfile.id },
        data: { isVerified: true }
      })
      
      console.log('✅ Seller account has been verified!')
    } else {
      console.log('✅ Seller account is already verified!')
    }
  } else {
    console.log('❌ Seller not found!')
  }
  
  // Check if the seller products API endpoint exists
  console.log('Checking seller products...')
  const products = await prisma.product.findMany({
    where: {
      seller: {
        user: { email: 'seller@example.com' }
      }
    }
  })
  
  console.log(`Found ${products.length} products for seller`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
