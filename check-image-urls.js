// Check for products with invalid image URLs
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkImageUrls() {
  try {
    console.log('🔍 Checking products with image URLs...');
    
    const products = await prisma.product.findMany({
      where: {
        imageUrl: {
          not: ''
        }
      },
      select: {
        id: true,
        name: true,
        imageUrl: true
      }
    });

    console.log(`Found ${products.length} products with image URLs:`);
    
    products.forEach(product => {
      console.log(`- ${product.name}: ${product.imageUrl}`);
      
      // Check for problematic URLs
      if (product.imageUrl.includes('ibb.co/') && !product.imageUrl.includes('i.ibb.co/')) {
        console.log(`  ⚠️  This appears to be a share URL, not a direct image URL`);
      }
    });

  } catch (error) {
    console.error('❌ Error checking image URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImageUrls();
