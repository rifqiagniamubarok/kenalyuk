/**
 * API routes for supervisor management
 * Only accessible by SUPERADMIN role
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole, UserStatus } from '@/types/auth';
import { createAuditLog, AuditAction } from '@/lib/audit';

/**
 * GET /api/supervisors - List all supervisors with their regions
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all supervisors
    const supervisors = await prisma.user.findMany({
      where: {
        role: UserRole.SUPERVISOR,
      },
      include: {
        supervisorRegion: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Get all regular users (potential supervisors)
    const users = await prisma.user.findMany({
      where: {
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ supervisors, users });
  } catch (error) {
    console.error('Error fetching supervisors:', error);
    return NextResponse.json({ error: 'Failed to fetch supervisors' }, { status: 500 });
  }
}

/**
 * POST /api/supervisors - Assign supervisor role to a user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, regionId } = body;

    if (!userId || !regionId) {
      return NextResponse.json({ error: 'User ID and Region ID are required' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if region exists
    const region = await prisma.region.findUnique({
      where: { id: regionId },
    });

    if (!region) {
      return NextResponse.json({ error: 'Region not found' }, { status: 404 });
    }

    // Check if user is already a supervisor for this region
    if (user.role === UserRole.SUPERVISOR && user.supervisorRegionId === regionId) {
      return NextResponse.json({ error: 'User is already a supervisor for this region' }, { status: 400 });
    }

    // Update user role and assign region
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: UserRole.SUPERVISOR,
        supervisorRegionId: regionId,
      },
      include: {
        supervisorRegion: true,
      },
    });

    // Log action
    await createAuditLog(session.user.id, AuditAction.ASSIGN_SUPERVISOR, userId, {
      userName: updatedUser.name,
      regionId,
      regionName: region.name,
    });

    // TODO: Send notification to user about role assignment
    // This would typically involve email notification or in-app notification

    return NextResponse.json({ supervisor: updatedUser }, { status: 201 });
  } catch (error) {
    console.error('Error assigning supervisor:', error);
    return NextResponse.json({ error: 'Failed to assign supervisor role' }, { status: 500 });
  }
}

/**
 * PUT /api/supervisors - Update supervisor region assignment
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, regionId } = body;

    if (!userId || !regionId) {
      return NextResponse.json({ error: 'User ID and Region ID are required' }, { status: 400 });
    }

    // Check if user exists and is a supervisor
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== UserRole.SUPERVISOR) {
      return NextResponse.json({ error: 'User is not a supervisor' }, { status: 400 });
    }

    // Check if region exists
    const region = await prisma.region.findUnique({
      where: { id: regionId },
    });

    if (!region) {
      return NextResponse.json({ error: 'Region not found' }, { status: 404 });
    }

    // Update supervisor region
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        supervisorRegionId: regionId,
      },
      include: {
        supervisorRegion: true,
      },
    });

    // Log action
    await createAuditLog(session.user.id, AuditAction.ASSIGN_SUPERVISOR, userId, {
      userName: updatedUser.name,
      regionId,
      regionName: region.name,
      action: 'region_update',
    });

    return NextResponse.json({ supervisor: updatedUser });
  } catch (error) {
    console.error('Error updating supervisor:', error);
    return NextResponse.json({ error: 'Failed to update supervisor' }, { status: 500 });
  }
}

/**
 * DELETE /api/supervisors - Revoke supervisor role
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user exists and is a supervisor
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        supervisorRegion: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== UserRole.SUPERVISOR) {
      return NextResponse.json({ error: 'User is not a supervisor' }, { status: 400 });
    }

    // Revoke supervisor role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: UserRole.USER,
        supervisorRegionId: null,
      },
    });

    // Log action
    await createAuditLog(session.user.id, AuditAction.REVOKE_SUPERVISOR, userId, {
      userName: updatedUser.name,
      previousRegionId: user.supervisorRegionId,
      previousRegionName: user.supervisorRegion?.name,
    });

    // TODO: Send notification to user about role revocation
    // TODO: Invalidate existing sessions to ensure role change takes effect immediately

    return NextResponse.json({ message: 'Supervisor role revoked successfully', user: updatedUser });
  } catch (error) {
    console.error('Error revoking supervisor:', error);
    return NextResponse.json({ error: 'Failed to revoke supervisor role' }, { status: 500 });
  }
}
