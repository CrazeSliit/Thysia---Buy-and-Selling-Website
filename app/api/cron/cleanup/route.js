import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  // Verify this is a legitimate cron request
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = {
      timestamp: new Date().toISOString(),
      tasks: []
    };

    // Clean up expired sessions (older than 30 days)
    const expiredSessions = await prisma.session.deleteMany({
      where: {
        expires: {
          lt: new Date()
        }
      }
    });
    results.tasks.push(`Deleted ${expiredSessions.count} expired sessions`);

    // Clean up unverified accounts (older than 7 days)
    const unverifiedAccounts = await prisma.user.deleteMany({
      where: {
        emailVerified: null,
        createdAt: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        }
      }
    });
    results.tasks.push(`Deleted ${unverifiedAccounts.count} unverified accounts`);

    // Clean up abandoned carts (older than 30 days)
    const abandonedCarts = await prisma.cart.deleteMany({
      where: {
        updatedAt: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        }
      }
    });
    results.tasks.push(`Deleted ${abandonedCarts.count} abandoned carts`);

    await prisma.$disconnect();

    console.log('Cleanup completed:', results);
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Cleanup failed:', error);
    await prisma.$disconnect();
    
    return NextResponse.json(
      {
        error: 'Cleanup failed',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
