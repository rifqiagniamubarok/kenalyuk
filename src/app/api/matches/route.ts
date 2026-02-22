/**
 * Matches API route
 * Returns list of active matches for current user
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserStatus, MatchStatus } from '@prisma/client';

/**
 * GET /api/matches - Get current user's matches
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
        { error: 'Account must be active to view matches' },
        { status: 403 }
      );
    }

    const userId = session.user.id;

    // Find matches where current user is either user1 or user2
    const matches = await prisma.match.findMany({
      where: {
        status: MatchStatus.ACTIVE,
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      include: {
        user1: {
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
        user2: {
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
        updatedAt: 'desc',
      },
    });

    // Transform matches to include the matched user (not current user)
    const formattedMatches = matches.map((match) => {
      const matchedUser = match.user1Id === userId ? match.user2 : match.user1;
      
      return {
        matchId: match.id,
        matchedAt: match.createdAt,
        user: {
          id: matchedUser.id,
          name: matchedUser.name,
          age: matchedUser.age,
          city: matchedUser.city,
          region: matchedUser.region?.name || '',
          photos: matchedUser.photoUrls,
        },
      };
    });

    return NextResponse.json({ matches: formattedMatches });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}
