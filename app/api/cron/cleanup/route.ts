import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from a cron job (Vercel Cron or similar)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cleanup old cart items (older than 30 days for inactive buyers)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Cleanup old notifications (older than 90 days and read)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    let cleanupResults = {
      cartItemsDeleted: 0,
      notificationsDeleted: 0,
      adminLogsDeleted: 0,
      timestamp: new Date().toISOString()
    };

    // Clean up old cart items (older than 30 days)
    try {
      const deletedCartItems = await prisma.cartItem.deleteMany({
        where: {
          updatedAt: {
            lt: thirtyDaysAgo
          }
        }
      });
      cleanupResults.cartItemsDeleted = deletedCartItems.count;
    } catch (error) {
      console.log('Cart items cleanup skipped:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Clean up old read notifications (older than 90 days)
    try {
      const deletedNotifications = await prisma.notification.deleteMany({
        where: {
          isRead: true,
          createdAt: {
            lt: ninetyDaysAgo
          }
        }
      });
      cleanupResults.notificationsDeleted = deletedNotifications.count;
    } catch (error) {
      console.log('Notifications cleanup skipped:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Clean up old admin logs (older than 90 days)
    try {
      const deletedAdminLogs = await prisma.adminLog.deleteMany({
        where: {
          createdAt: {
            lt: ninetyDaysAgo
          }
        }
      });
      cleanupResults.adminLogsDeleted = deletedAdminLogs.count;
    } catch (error) {
      console.log('Admin logs cleanup skipped:', error instanceof Error ? error.message : 'Unknown error');
    }

    console.log('Cleanup completed:', cleanupResults);

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed successfully',
      results: cleanupResults
    });

  } catch (error) {
    console.error('Cleanup cron job failed:', error);
    return NextResponse.json(
      { 
        error: 'Cleanup failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Also support POST method for manual triggers
  return GET(request);
}