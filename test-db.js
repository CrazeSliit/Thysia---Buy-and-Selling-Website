// Quick test to check database connection and users
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDB() {
  try {
    console.log('Testing database connection...')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        password: true
      }
    })
      console.log('Users found:', users.length)
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Active: ${user.isActive} - Has Password: ${!!user.password}`)
    })
      // Check products
    const products = await prisma.product.findMany({
      include: {
        category: true,
        seller: {
          select: {
            businessName: true,
            user: {
              select: {
                email: true,
                name: true
              }
            }
          }
        }
      }
    })
      console.log('\nProducts found:', products.length)
    if (products.length > 0) {
      console.log('First product ID:', products[0].id)
      products.slice(0, 5).forEach(product => {
        console.log(`- ID: ${product.id} - ${product.name} ($${product.price}) - Category: ${product.category?.name}`)
      })
    }
    
  } catch (error) {
    console.error('Database error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDB()
