/**
 * Likes API route
 * Handles like actions and mutual match detection
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserStatus } from '@prisma/client';
import { createMatch } from '@/lib/matching';

/**
 * POST /api/likes - Create a like and detect mutual matches
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is ACTIVE
    if (session.user.status !== UserStatus.ACTIVE) {
      return NextResponse.json(
        { error: 'Account must be active to like profiles' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { likedUserId } = body;

    if (!likedUserId) {
      return NextResponse.json({ error: 'likedUserId is required' }, { status: 400 });
    }

    const userId = session.user.id;

    // Validate: can't like yourself
    if (userId === likedUserId) {
      return NextResponse.json({ error: 'Cannot like yourself' }, { status: 400 });
    }

    // Validate: liked user exists and is ACTIVE
    const likedUser = await prisma.user.findUnique({
      where: { id: likedUserId },
      select: { status: true },
    });

    if (!likedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (likedUser.status !== UserStatus.ACTIVE) {
      return NextResponse.json(
        { error: 'Cannot like inactive user' },
        { status: 400 }
      );
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_likedUserId: {
          userId,
          likedUserId,
        },
      },
    });

    if (existingLike) {
      return NextResponse.json(
        { error: 'You have already liked this user' },
        { status: 400 }
      );
    }

    // Create like record
    await prisma.like.create({
      data: {
        userId,
        likedUserId,
      },
    });

    // Check for mutual like
    const mutualLike = await prisma.like.findUnique({
      where: {
        userId_likedUserId: {
          userId: likedUserId,
          likedUserId: userId,
        },
      },
    });

    let matched = false;
    let matchId: string | undefined;

    if (mutualLike) {
      // Create match
      const match = await createMatch(userId, likedUserId);
      matched = true;
      matchId = match.id;
    }

    return NextResponse.json({
      liked: true,
      matched,
      matchId,
    });
  } catch (error) {
    console.error('Like API error:', error);
    return NextResponse.json(
      { error: 'Failed to process like' },
      { status: 500 }
    );
  }
}
