const { PrismaClient } = require('@prisma/client');

async function checkCategories() {
  const prisma = new PrismaClient();
  try {
    const categories = await prisma.category.findMany();
    console.log('Categories found:', categories.length);
    categories.forEach(cat => {
      console.log(`- ID: ${cat.id}, Name: ${cat.name}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
