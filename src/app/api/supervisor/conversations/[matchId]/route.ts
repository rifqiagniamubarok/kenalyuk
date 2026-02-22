/**
 * Supervisor Conversation Detail API
 * GET - Get specific conversation with full message history
 */

import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@/types/auth';

export async function GET(request: Request, { params }: { params: { matchId: string } }) {
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

    const { matchId } = params;
    const supervisorRegionId = session.user.supervisorRegionId;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            photoUrls: true,
            age: true,
            city: true,
            region: { select: { id: true, name: true } },
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            photoUrls: true,
            age: true,
            city: true,
            region: { select: { id: true, name: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                photoUrls: true,
              },
            },
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const hasAccess = match.user1.region?.id === supervisorRegionId || match.user2.region?.id === supervisorRegionId;

    if (!hasAccess) {
      return NextResponse.json({ error: 'You do not have access to this conversation' }, { status: 403 });
    }

    return NextResponse.json({ match, messages: match.messages });
  } catch (error) {
    console.error('Error fetching conversation details:', error);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}
