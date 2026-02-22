/**
 * API routes for region management
 * Only accessible by SUPERADMIN role
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@/types/auth';
import { createAuditLog, AuditAction } from '@/lib/audit';

/**
 * GET /api/regions - List all regions
 * Public endpoint (authenticated users only) - for biodata form
 * SUPERADMIN gets additional stats
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // SUPERADMIN gets detailed info with counts
    if (session.user.role === UserRole.SUPERADMIN) {
      const regions = await prisma.region.findMany({
        include: {
          _count: {
            select: {
              users: true,
              supervisors: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      return NextResponse.json({ regions });
    }

    // Regular users just get basic region list for form selection
    const regions = await prisma.region.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ regions });
  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json({ error: 'Failed to fetch regions' }, { status: 500 });
  }
}

/**
 * POST /api/regions - Create a new region
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    // Validate input
    if (!name || name.trim().length < 3 || name.trim().length > 50) {
      return NextResponse.json({ error: 'Region name must be between 3 and 50 characters' }, { status: 400 });
    }

    // Check if region already exists
    const existing = await prisma.region.findUnique({
      where: { name: name.trim() },
    });

    if (existing) {
      return NextResponse.json({ error: 'Region with this name already exists' }, { status: 400 });
    }

    // Create region
    const region = await prisma.region.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    // Log action
    await createAuditLog(session.user.id, AuditAction.CREATE_REGION, region.id, {
      regionName: region.name,
    });

    return NextResponse.json({ region }, { status: 201 });
  } catch (error) {
    console.error('Error creating region:', error);
    return NextResponse.json({ error: 'Failed to create region' }, { status: 500 });
  }
}

/**
 * PUT /api/regions - Update a region
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description } = body;

    if (!id) {
      return NextResponse.json({ error: 'Region ID is required' }, { status: 400 });
    }

    // Validate input
    if (name && (name.trim().length < 3 || name.trim().length > 50)) {
      return NextResponse.json({ error: 'Region name must be between 3 and 50 characters' }, { status: 400 });
    }

    // Check if region exists
    const existing = await prisma.region.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Region not found' }, { status: 404 });
    }

    // If name is changing, check if new name is available
    if (name && name.trim() !== existing.name) {
      const nameExists = await prisma.region.findUnique({
        where: { name: name.trim() },
      });

      if (nameExists) {
        return NextResponse.json({ error: 'Region with this name already exists' }, { status: 400 });
      }
    }

    // Update region
    const region = await prisma.region.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
      },
    });

    // Log action
    await createAuditLog(session.user.id, AuditAction.UPDATE_REGION, region.id, {
      regionName: region.name,
      changes: { name, description },
    });

    return NextResponse.json({ region });
  } catch (error) {
    console.error('Error updating region:', error);
    return NextResponse.json({ error: 'Failed to update region' }, { status: 500 });
  }
}

/**
 * DELETE /api/regions - Delete a region
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Region ID is required' }, { status: 400 });
    }

    // Check if region exists
    const region = await prisma.region.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            supervisors: true,
          },
        },
      },
    });

    if (!region) {
      return NextResponse.json({ error: 'Region not found' }, { status: 404 });
    }

    // Prevent deletion if region has users or supervisors
    if (region._count.users > 0 || region._count.supervisors > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete region with assigned users or supervisors',
          details: {
            users: region._count.users,
            supervisors: region._count.supervisors,
          },
        },
        { status: 400 },
      );
    }

    // Delete region
    await prisma.region.delete({
      where: { id },
    });

    // Log action
    await createAuditLog(session.user.id, AuditAction.DELETE_REGION, id, {
      regionName: region.name,
    });

    return NextResponse.json({ message: 'Region deleted successfully' });
  } catch (error) {
    console.error('Error deleting region:', error);
    return NextResponse.json({ error: 'Failed to delete region' }, { status: 500 });
  }
}
