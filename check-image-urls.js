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

    console.log(`Found ${categories.length} categories with unsplash.com URLs:`);
    
    for (const category of categories) {
      console.log(`- ${category.name}: ${category.imageUrl}`);
      
      // If it's a photo page URL, convert it to direct image URL
      if (category.imageUrl && category.imageUrl.includes('unsplash.com/photos/')) {
        const photoId = category.imageUrl.split('/photos/')[1]?.split('-').pop();
        if (photoId) {
          const directUrl = `https://images.unsplash.com/photo-${photoId}?w=500`;
          console.log(`  → Should be: ${directUrl}`);
          
          // Update the category with the correct URL
          await prisma.category.update({
            where: { id: category.id },
            data: { imageUrl: directUrl }
          });
          console.log(`  ✅ Updated category: ${category.name}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error checking image URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImageUrls();
