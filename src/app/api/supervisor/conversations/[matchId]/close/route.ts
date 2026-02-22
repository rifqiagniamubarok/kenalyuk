/**
 * Supervisor Close Conversation API
 * POST - Close a conversation (sets status to CLOSED)
 */

import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole, MatchStatus } from '@/types/auth';
import { createAuditLog, AuditAction } from '@/lib/audit';

export async function POST(request: Request, { params }: { params: Promise<{ matchId: string }> }) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== UserRole.SUPERVISOR) {
      return NextResponse.json({ error: 'Forbidden - Supervisor access required' }, { status: 403 });
    }

    if (!session.user.supervisorRegionId) {
      return NextResponse.json({ error: 'No region assigned to supervisor' }, { status: 400 });
    }

    const { matchId } = await params;
    const supervisorRegionId = session.user.supervisorRegionId;

    const body = await request.json();
    const { reason } = body;

    if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
      return NextResponse.json({ error: 'Reason must be at least 10 characters' }, { status: 400 });
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            regionId: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            regionId: true,
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const hasAccess = match.user1.regionId === supervisorRegionId || match.user2.regionId === supervisorRegionId;

    if (!hasAccess) {
      return NextResponse.json({ error: 'You do not have access to this conversation' }, { status: 403 });
    }

    if (match.status === MatchStatus.CLOSED) {
      return NextResponse.json({ error: 'Conversation is already closed' }, { status: 400 });
    }

    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.CLOSED,
        closedBy: session.user.id,
        closedAt: new Date(),
        closedReason: reason.trim(),
      },
    });

    await createAuditLog(session.user.id, 'CLOSE_CONVERSATION' as AuditAction, matchId, {
      user1Id: match.user1.id,
      user1Name: match.user1.name,
      user2Id: match.user2.id,
      user2Name: match.user2.name,
      reason: reason.trim(),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Conversation closed successfully',
      match: updatedMatch,
    });
  } catch (error) {
    console.error('Error closing conversation:', error);
    return NextResponse.json({ error: 'Failed to close conversation' }, { status: 500 });
  }
}
