/**
 * Likes sent API route
 * Returns list of likes sent by current user with match status
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserStatus } from '@prisma/client';

/**
 * GET /api/likes/sent - Get current user's sent likes
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is ACTIVE
    if (session.user.status !== UserStatus.ACTIVE) {
      return NextResponse.json(
        { error: 'Account must be active to view likes' },
        { status: 403 }
      );
    }

    const userId = session.user.id;

    // Find likes sent by current user
    const sentLikes = await prisma.like.findMany({
      where: {
        userId: userId,
      },
      include: {
        likedUser: {
          select: {
            id: true,
            name: true,
            age: true,
            city: true,
            photoUrls: true,
            region: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Check if liked back (mutual like = match)
    const formattedLikes = await Promise.all(
      sentLikes.map(async (like) => {
        // Check if they liked back
        const reverseLike = await prisma.like.findUnique({
          where: {
            userId_likedUserId: {
              userId: like.likedUserId,
              likedUserId: userId,
            },
          },
        });

        const likedBack = !!reverseLike;

        return {
          likeId: like.id,
          likedAt: like.createdAt,
          matched: likedBack,
          user: {
            id: like.likedUser.id,
            name: like.likedUser.name,
            age: like.likedUser.age,
            city: like.likedUser.city,
            region: like.likedUser.region?.name || '',
            photos: like.likedUser.photoUrls,
          },
        };
      })
    );

    return NextResponse.json({ likes: formattedLikes });
  } catch (error) {
    console.error('Error fetching sent likes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sent likes' },
      { status: 500 }
    );
  }
}
