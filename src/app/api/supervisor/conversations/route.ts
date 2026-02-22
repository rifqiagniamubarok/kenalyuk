/**
 * Supervisor Conversations API
 * GET - List all conversations in supervisor's region(s)
 */

import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@/types/auth';

export async function GET() {
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

    const supervisorRegionId = session.user.supervisorRegionId;

    const conversations = await prisma.match.findMany({
      where: {
        OR: [
          { user1: { regionId: supervisorRegionId } },
          { user2: { regionId: supervisorRegionId } },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            photoUrls: true,
            city: true,
            region: { select: { id: true, name: true } },
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            photoUrls: true,
            city: true,
            region: { select: { id: true, name: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, createdAt: true },
        },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const formattedConversations = conversations.map((match) => ({
      matchId: match.id,
      status: match.status,
      createdAt: match.createdAt,
      updatedAt: match.updatedAt,
      closedAt: match.closedAt,
      closedReason: match.closedReason,
      user1: match.user1,
      user2: match.user2,
      messageCount: match._count.messages,
      lastMessage: match.messages[0] || null,
    }));

    return NextResponse.json({ conversations: formattedConversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
