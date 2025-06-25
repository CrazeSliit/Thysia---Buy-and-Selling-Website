const { PrismaClient } = require('@prisma/client');
const { compare } = require('bcryptjs');

const prisma = new PrismaClient();

async function testAuth() {
  try {
    console.log('Testing authentication for seller...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'seller@example.com' },
      include: {
        buyerProfile: true,
        sellerProfile: true,
        driverProfile: true
      }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('👤 User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      hasPassword: !!user.password
    });

    // Test password comparison
    const testPassword = 'seller123';
    const isPasswordValid = await compare(testPassword, user.password);
    console.log('🔑 Password valid for "seller123":', isPasswordValid);

    if (user.sellerProfile) {
      console.log('🏪 Seller profile:', {
        id: user.sellerProfile.id,
        businessName: user.sellerProfile.businessName,
        isVerified: user.sellerProfile.isVerified
      });
    } else {
      console.log('❌ No seller profile found');
    }

  } catch (error) {
    console.error('Error testing auth:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
