const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkSpecificAddress() {
  try {
    console.log('🔍 Checking specific address ID: cmcbmbgcg001femlbrdolgiit')
    
    // Check if this address exists
    const address = await prisma.address.findUnique({
      where: { id: 'cmcbmbgcg001femlbrdolgiit' }
    })
    
    console.log('📍 Address found:', !!address)
    if (address) {
      console.log('Address details:', address)
    }
    
    // Check all addresses for the buyer profile
    const buyerProfile = await prisma.buyerProfile.findFirst({
      where: { userId: 'cmcbkoe5n0002a1hrpv33t7uy' }
    })
    
    if (buyerProfile) {
      console.log('\n📍 All addresses for buyer profile:', buyerProfile.id)
      const allAddresses = await prisma.address.findMany({
        where: { buyerId: buyerProfile.id }
      })
      
      allAddresses.forEach(addr => {
        console.log(`  - ${addr.id}: ${addr.address1}, ${addr.city} (default: ${addr.isDefault})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSpecificAddress()
