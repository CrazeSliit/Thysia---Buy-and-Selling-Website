const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkSellerIds() {
  try {
    console.log('🔍 Checking Product Seller IDs...')
    
    // Get some products and their seller info
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        seller: true  // This should be a SellerProfile
      },
      take: 5
    })
    
    console.log('📦 Products and their sellers:')
    for (const product of products) {
      console.log(`Product: ${product.name}`)
      console.log(`  - sellerId: ${product.sellerId}`)
      console.log(`  - seller: ${product.seller ? 'Found' : 'NOT FOUND'}`)
      if (product.seller) {
        console.log(`  - seller details:`, product.seller)
      }
    }
    
    // Also check what SellerProfile records exist
    console.log('\n👥 SellerProfile records:')
    const sellerProfiles = await prisma.sellerProfile.findMany({
      include: {
        user: {
          select: { id: true, email: true, role: true }
        }
      }
    })
    
    sellerProfiles.forEach(sp => {
      console.log(`SellerProfile ID: ${sp.id}`)
      console.log(`  - User ID: ${sp.userId}`)
      console.log(`  - User: ${sp.user.email} (${sp.user.role})`)
    })
    
    // Check what the schema expects
    console.log('\n❓ Schema Analysis:')
    console.log('Product.sellerId should reference -> SellerProfile.id')
    console.log('OrderItem.sellerId should reference -> User.id (per schema)')
    console.log('This means we need to convert SellerProfile.id -> User.id when creating OrderItems')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSellerIds()
