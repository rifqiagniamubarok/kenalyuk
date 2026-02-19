/**
 * API route: Approve user profile
 * Changes user status to ACTIVE and logs the action
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole, UserStatus } from '@/types/auth';
import { createAuditLog, AuditAction } from '@/lib/audit';
import { sendApprovalNotification } from '@/lib/notifications';

/**
 * POST /api/supervisor/approve
 * Approve a user profile and change status to ACTIVE
 * Body: { userId: string }
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    // Fetch user to verify region and status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        regionId: true,
        status: true,
        role: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Verify user is in supervisor's region
    if (user.regionId !== session.user.supervisorRegionId) {
      return NextResponse.json({ success: false, error: 'User is not in your assigned region' }, { status: 403 });
    }

    // Verify user is pending approval
    if (user.status !== UserStatus.PENDING_APPROVAL) {
      return NextResponse.json({ success: false, error: 'User is not pending approval' }, { status: 400 });
    }

    // Verify user is regular user (not supervisor/superadmin)
    if (user.role !== UserRole.USER) {
      return NextResponse.json({ success: false, error: 'Cannot approve non-user accounts' }, { status: 400 });
    }

    // Update user status to ACTIVE
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.ACTIVE,
        updatedAt: new Date(),
      },
    });

    // Create audit log
    await createAuditLog(session.user.id, AuditAction.APPROVE_USER, userId, {
      userEmail: user.email,
      userName: user.name,
      regionId: user.regionId,
      timestamp: new Date().toISOString(),
    });

    // Send approval notification to user
    await sendApprovalNotification(user.email, user.name || 'User');

    return NextResponse.json({
      success: true,
      message: 'User approved successfully',
      data: {
        userId: updatedUser.id,
        status: updatedUser.status,
      },
    });
  } catch (error) {
    console.error('Error approving user:', error);
    return NextResponse.json({ success: false, error: 'Failed to approve user' }, { status: 500 });
  }
}
