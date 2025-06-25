// Fix seller verification
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Fixing seller verification...\n')
  
  // Find the seller user
  const sellerUser = await prisma.user.findUnique({
    where: { email: 'seller@example.com' },
    include: { sellerProfile: true }
  })

  if (sellerUser && sellerUser.sellerProfile) {
    console.log('📊 Current seller status:')
    console.log(`   - Email: ${sellerUser.email}`)
    console.log(`   - Role: ${sellerUser.role}`)
    console.log(`   - Active: ${sellerUser.isActive}`)
    console.log(`   - Business: ${sellerUser.sellerProfile.businessName}`)
    console.log(`   - Verified: ${sellerUser.sellerProfile.isVerified}`)
    
    if (!sellerUser.sellerProfile.isVerified) {
      // Update seller to verified
      const updatedProfile = await prisma.sellerProfile.update({
        where: { id: sellerUser.sellerProfile.id },
        data: { isVerified: true }
      })
      
      console.log('\n✅ Seller account has been verified!')
      console.log(`   - New verification status: ${updatedProfile.isVerified}`)
    } else {
      console.log('\n✅ Seller account is already verified!')
    }
    
    // Also make sure the account is active
    if (!sellerUser.isActive) {
      await prisma.user.update({
        where: { id: sellerUser.id },
        data: { isActive: true }
      })
      console.log('✅ User account has been activated!')
    }
    
  } else {
    console.log('❌ Seller not found!')
    
    // Let's check what users exist
    const allUsers = await prisma.user.findMany({
      select: { email: true, role: true },
      take: 10
    })
    
    console.log('\n📋 Available users:')
    allUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`)
    })
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
