const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugOrderCreation() {
  try {
    console.log('🔍 Debugging Order Creation Foreign Key Issues...')
    
    // Check buyer user and profile
    const buyer = await prisma.user.findFirst({
      where: { role: 'BUYER' },
      include: { buyerProfile: true }
    })
    console.log('👤 Buyer User:', buyer ? { id: buyer.id, email: buyer.email } : 'Not found')
    console.log('🏠 Buyer Profile:', buyer?.buyerProfile ? { id: buyer.buyerProfile.id } : 'Not found')
    
    // Check addresses for this buyer
    const addresses = await prisma.address.findMany({
      where: { buyerId: buyer?.buyerProfile?.id }
    })
    console.log('📍 Addresses for buyer profile:', addresses.length)
    addresses.forEach(addr => console.log(`   - ${addr.id}: ${addr.address1}, ${addr.city} (default: ${addr.isDefault})`))
    
    // Check products
    const products = await prisma.product.findMany({
      where: { isActive: true },
      take: 3
    })
    console.log('📦 Active products:', products.length)
    products.forEach(p => console.log(`   - ${p.id}: ${p.name} (stock: ${p.stock})`))
    
    // Let's also check the Order table structure to see what's expected
    console.log('\n🔍 Checking what data we would send for order creation...')
    
    if (buyer && addresses.length > 0 && products.length > 0) {
      const testOrderData = {
        orderNumber: `TEST-${Date.now()}`,
        buyerId: buyer.id, // User ID 
        status: 'PENDING',
        subtotal: 299.99,
        taxAmount: 24.00,
        shippingCost: 9.99,
        totalAmount: 333.98,
        paymentMethod: 'CREDIT_CARD',
        paymentStatus: 'PENDING',
        shippingAddressId: addresses[0].id,
        billingAddressId: addresses[0].id
      }
      
      console.log('📝 Test order data:', JSON.stringify(testOrderData, null, 2))
      
      // Let's try to validate each foreign key
      console.log('\n🔍 Validating foreign keys...')
      
      // Check if buyer ID exists in User table
      const userExists = await prisma.user.findUnique({ where: { id: testOrderData.buyerId } })
      console.log('✅ User exists:', !!userExists)
      
      // Check if shipping address exists
      const shippingExists = await prisma.address.findUnique({ where: { id: testOrderData.shippingAddressId } })
      console.log('✅ Shipping address exists:', !!shippingExists)
      
      // Check if billing address exists
      const billingExists = await prisma.address.findUnique({ where: { id: testOrderData.billingAddressId } })
      console.log('✅ Billing address exists:', !!billingExists)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugOrderCreation()
