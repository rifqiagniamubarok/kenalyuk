/**
 * Message history API route
 * GET - Fetch message history for a specific match
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserStatus } from '@prisma/client';

/**
 * GET /api/messages/[matchId] - Get message history for a match
 */
export async function GET(request: Request, { params }: { params: Promise<{ matchId: string }> }) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is ACTIVE
    if (session.user.status !== UserStatus.ACTIVE) {
      return NextResponse.json({ error: 'Account must be active to view messages' }, { status: 403 });
    }

    const { matchId } = await params;
    const userId = session.user.id;

    // Validate match exists and user is a participant
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        user1Id: true,
        user2Id: true,
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Check if current user is a participant in this match
    const isParticipant = match.user1Id === userId || match.user2Id === userId;

    if (!isParticipant) {
      return NextResponse.json({ error: 'You are not a participant in this match' }, { status: 403 });
    }

    // Fetch messages for this match
    const messages = await prisma.message.findMany({
      where: {
        matchId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            photoUrls: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Chronological order
      },
    });

    return NextResponse.json({ messages, currentUserId: userId });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
