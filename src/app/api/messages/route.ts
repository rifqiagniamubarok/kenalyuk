/**
 * Messages API route
 * POST - Send a new message to a matched user
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserStatus, MatchStatus } from '@prisma/client';

/**
 * POST /api/messages - Send a message
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is ACTIVE
    if (session.user.status !== UserStatus.ACTIVE) {
      return NextResponse.json({ error: 'Account must be active to send messages' }, { status: 403 });
    }

    const body = await request.json();
    const { matchId, content } = body;

    // Validate required fields
    if (!matchId || !content) {
      return NextResponse.json({ error: 'matchId and content are required' }, { status: 400 });
    }

    // Validate content length
    if (typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 });
    }

    if (content.length > 5000) {
      return NextResponse.json({ error: 'Content cannot exceed 5000 characters' }, { status: 400 });
    }

    const userId = session.user.id;

    // Validate match exists and user is a participant
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        user1Id: true,
        user2Id: true,
        status: true,
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Check if conversation has been closed
    if (match.status === MatchStatus.CLOSED) {
      return NextResponse.json({ error: 'Conversation has been closed' }, { status: 403 });
    }

    // Check if current user is a participant in this match
    const isParticipant = match.user1Id === userId || match.user2Id === userId;

    if (!isParticipant) {
      return NextResponse.json({ error: 'You are not a participant in this match' }, { status: 403 });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        matchId,
        senderId: userId,
        content: content.trim(),
        isRead: false,
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
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
