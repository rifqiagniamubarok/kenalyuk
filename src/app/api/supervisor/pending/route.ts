/**
 * API route: Get pending users for supervisor review
 * Filters users by supervisor's assigned region
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole, UserStatus } from '@/types/auth';

/**
 * GET /api/supervisor/pending
 * Fetch all users with PENDING_APPROVAL status in supervisor's region
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check supervisor role
    if (session.user.role !== UserRole.SUPERVISOR) {
      return NextResponse.json({ success: false, error: 'Forbidden - Supervisor access required' }, { status: 403 });
    }

    // Check if supervisor has assigned region
    if (!session.user.supervisorRegionId) {
      return NextResponse.json({ success: false, error: 'No region assigned to supervisor' }, { status: 400 });
    }

    // Fetch pending users in supervisor's region
    const pendingUsers = await prisma.user.findMany({
      where: {
        status: UserStatus.PENDING_APPROVAL,
        regionId: session.user.supervisorRegionId,
        role: UserRole.USER, // Only regular users, not supervisors/superadmins
      },
      include: {
        region: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc', // Most recently updated first
      },
    });

    // Remove password from response
    const sanitizedUsers = pendingUsers.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return NextResponse.json({
      success: true,
      data: sanitizedUsers,
      count: sanitizedUsers.length,
    });
  } catch (error) {
    console.error('Error fetching pending users:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch pending users' }, { status: 500 });
  }
}
