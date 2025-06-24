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
    
  } catch (error) {
    console.error('Database error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDB()
