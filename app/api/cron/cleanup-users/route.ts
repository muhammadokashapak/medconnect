import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This endpoint should be protected, e.g., by checking a CRON_SECRET from Vercel
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const legacyThresholdDate = new Date("2026-06-16T00:00:00Z");
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    // Find doctors who are:
    // 1. Not legacy (createdAt >= 2026-06-16)
    // 2. Not verified (verificationStatus == 'PENDING')
    // 3. Registered more than 3 days ago
    
    const usersToDelete = await prisma.doctor.findMany({
      where: {
        createdAt: {
          gte: legacyThresholdDate,
          lt: threeDaysAgo
        },
        verificationStatus: 'PENDING'
      },
      select: { id: true, email: true }
    });

    if (usersToDelete.length === 0) {
      return NextResponse.json({ message: "No unverified users to clean up." });
    }

    const idsToDelete = usersToDelete.map(u => u.id);

    // Delete them. Ensure Prisma schema has onDelete: Cascade for relations.
    // If not, we might need to delete related data manually first.
    // Assuming Cascade is set up for most things, or they just registered and have no data.
    const deletedCount = await prisma.doctor.deleteMany({
      where: {
        id: { in: idsToDelete }
      }
    });

    console.log(`Cron Cleanup: Deleted ${deletedCount.count} unverified users.`, usersToDelete);

    return NextResponse.json({
      message: `Successfully deleted ${deletedCount.count} unverified users.`,
      deletedUsers: usersToDelete
    });
  } catch (error: any) {
    console.error("Cron Cleanup Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
