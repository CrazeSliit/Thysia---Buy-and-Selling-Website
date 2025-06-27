import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Simple database query to verify connectivity
    const userCount = await prisma.user.count();
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      userCount,
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message,
        environment: process.env.NODE_ENV || 'development',
      },
      { status: 500 }
    );
  }
}
