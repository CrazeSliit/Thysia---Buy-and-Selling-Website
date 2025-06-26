const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkImageUrls() {
  try {
    console.log('Checking for invalid image URLs...');

    // Check products with unsplash.com URLs (not images.unsplash.com)
    const products = await prisma.product.findMany({
      where: {
        imageUrl: {
          contains: 'unsplash.com'
        }
      },
      select: {
        id: true,
        name: true,
        imageUrl: true
      }
    });

    console.log(`Found ${products.length} products with unsplash.com URLs:`);
    
    for (const product of products) {
      console.log(`- ${product.name}: ${product.imageUrl}`);
      
      // If it's a photo page URL, convert it to direct image URL
      if (product.imageUrl && product.imageUrl.includes('unsplash.com/photos/')) {
        const photoId = product.imageUrl.split('/photos/')[1]?.split('-').pop();
        if (photoId) {
          const directUrl = `https://images.unsplash.com/photo-${photoId}?w=500`;
          console.log(`  → Should be: ${directUrl}`);
          
          // Update the product with the correct URL
          await prisma.product.update({
            where: { id: product.id },
            data: { imageUrl: directUrl }
          });
          console.log(`  ✅ Updated product: ${product.name}`);
        }
      }
    }

    // Also check categories
    const categories = await prisma.category.findMany({
      where: {
        imageUrl: {
          contains: 'unsplash.com'
        }
      },
      select: {
        id: true,
        name: true,
        imageUrl: true
      }
    });
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
