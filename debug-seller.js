// Debug seller authentication and verification
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('=== SELLER DEBUG INFORMATION ===\n')
  
  // Find the seller user with full details
  const sellerUser = await prisma.user.findUnique({
    where: { email: 'seller@example.com' },
    include: { 
      sellerProfile: {
        include: {
          products: {
            select: {
              id: true,
              name: true,
              isActive: true
            },
            take: 5
          }
        }
      }
    }
  })

  if (sellerUser) {
    console.log('✅ SELLER USER FOUND:')
    console.log(`   - ID: ${sellerUser.id}`)
    console.log(`   - Email: ${sellerUser.email}`)
    console.log(`   - Name: ${sellerUser.name}`)
    console.log(`   - Role: ${sellerUser.role}`)
    console.log(`   - Active: ${sellerUser.isActive}`)
    
    if (sellerUser.sellerProfile) {
      console.log('\n✅ SELLER PROFILE FOUND:')
      console.log(`   - ID: ${sellerUser.sellerProfile.id}`)
      console.log(`   - Business Name: ${sellerUser.sellerProfile.businessName}`)
      console.log(`   - Is Verified: ${sellerUser.sellerProfile.isVerified}`)
      console.log(`   - Phone: ${sellerUser.sellerProfile.phone}`)
      console.log(`   - Address: ${sellerUser.sellerProfile.address}`)
      console.log(`   - Products Count: ${sellerUser.sellerProfile.products.length}`)
      
      if (sellerUser.sellerProfile.products.length > 0) {
        console.log('\n📦 SAMPLE PRODUCTS:')
        sellerUser.sellerProfile.products.forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name} (${product.isActive ? 'Active' : 'Inactive'})`)
        })
      }
    } else {
      console.log('\n❌ NO SELLER PROFILE FOUND!')
    }
    
    // Check session compatibility
    console.log('\n🔐 AUTHENTICATION CHECK:')
    console.log(`   - User role is SELLER: ${sellerUser.role === 'SELLER'}`)
    console.log(`   - Account is active: ${sellerUser.isActive}`)
    console.log(`   - Has seller profile: ${!!sellerUser.sellerProfile}`)
    console.log(`   - Seller is verified: ${sellerUser.sellerProfile?.isVerified}`)
    
    // Check for any potential issues
    console.log('\n🔍 POTENTIAL ISSUES:')
    const issues = []
    
    if (sellerUser.role !== 'SELLER') issues.push('User role is not SELLER')
    if (!sellerUser.isActive) issues.push('User account is not active')
    if (!sellerUser.sellerProfile) issues.push('No seller profile exists')
    if (sellerUser.sellerProfile && !sellerUser.sellerProfile.isVerified) {
      issues.push('Seller profile is not verified')
    }
    
    if (issues.length === 0) {
      console.log('   ✅ No issues found - seller should be able to create products!')
    } else {
      issues.forEach(issue => console.log(`   ❌ ${issue}`))
    }
    
  } else {
    console.log('❌ SELLER USER NOT FOUND!')
  }
  
  console.log('\n=== NEXT.JS SERVER INFO ===')
  console.log('The server should be running on: http://localhost:3000')
  console.log('If you\'re seeing port 3001 errors, please check your browser URL!')
  console.log('\nCorrect URLs:')
  console.log('- Dashboard: http://localhost:3000/dashboard/seller')
  console.log('- Products: http://localhost:3000/dashboard/seller/products')
  console.log('- New Product: http://localhost:3000/dashboard/seller/products/new')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
