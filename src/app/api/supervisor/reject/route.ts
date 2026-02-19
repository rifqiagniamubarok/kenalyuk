/**
 * API route: Reject user profile
 * Changes user status to REJECTED with reason and logs the action
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole, UserStatus } from '@/types/auth';
import { createAuditLog, AuditAction } from '@/lib/audit';
import { sendRejectionNotification } from '@/lib/notifications';

/**
 * POST /api/supervisor/reject
 * Reject a user profile with reason and change status to REJECTED
 * Body: { userId: string, reason: string }
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
    const { userId, reason } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    if (!reason || reason.trim().length < 20) {
      return NextResponse.json({ success: false, error: 'Rejection reason must be at least 20 characters' }, { status: 400 });
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
      return NextResponse.json({ success: false, error: 'Cannot reject non-user accounts' }, { status: 400 });
    }

    // Update user status to REJECTED
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.REJECTED,
        updatedAt: new Date(),
      },
    });

    // Create audit log with rejection reason
    await createAuditLog(session.user.id, AuditAction.REJECT_USER, userId, {
      userEmail: user.email,
      userName: user.name,
      regionId: user.regionId,
      reason: reason.trim(),
      timestamp: new Date().toISOString(),
    });

    // Send rejection notification to user
    await sendRejectionNotification(user.email, user.name || 'User', reason.trim());

    return NextResponse.json({
      success: true,
      message: 'User rejected successfully',
      data: {
        userId: updatedUser.id,
        status: updatedUser.status,
        reason: reason.trim(),
      },
    });
  } catch (error) {
    console.error('Error rejecting user:', error);
    return NextResponse.json({ success: false, error: 'Failed to reject user' }, { status: 500 });
  }
}
